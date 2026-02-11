import { describe, it, expect, vi } from 'vitest';
import { layoutSchematic, type SchematicConfig } from './schematicLayout.js';
import type { SchematicDB, SchematicPage } from './schematicDb.js';

describe('schematicLayout', () => {
  it('should layout a simple schematic page', async () => {
    const page: SchematicPage = {
      id: 'page1',
      name: 'Test Page',
      symbols: [
        {
          id: 'R1',
          name: 'resistor',
          pinGroups: [
            {
              pins: [
                { id: '1', x: -30, y: 0 },
                { id: '2', x: 30, y: 0 },
              ],
            },
          ],
        },
        {
          id: 'C1',
          name: 'capacitor',
          pinGroups: [
            {
              pins: [
                { id: '1', x: 0, y: -30 },
                { id: '2', x: 0, y: 30 },
              ],
            },
          ],
        },
      ],
      connections: [
        {
          id: 'conn1',
          source: { id: 'R1', isPin: true, pin: '2' },
          target: { id: 'C1', isPin: true, pin: '1' },
        },
      ],
      pageSetting: { width: 800, height: 600 },
    };

    const dbMock = {
      getData: () => ({
        schematicData: {
          pages: [page],
        },
        config: {},
      }),
    } as unknown as SchematicDB;

    const config: SchematicConfig = {
      schematic: {
        direction: 'RIGHT',
        nodeSpacing: 60,
      },
    };

    await layoutSchematic(dbMock, config);

    const r1 = page.symbols.find((s) => s.id === 'R1');
    const c1 = page.symbols.find((s) => s.id === 'C1');

    expect(r1?.electrical?.x).toBeDefined();
    expect(r1?.electrical?.y).toBeDefined();
    expect(c1?.electrical?.x).toBeDefined();
    expect(c1?.electrical?.y).toBeDefined();

    // With RIGHT direction, R1 should be to the left of C1 roughly, or at least they shouldn't overlap
    // Note: Exact positions depend on ELK implementation, but we can check relative logic or just that they are laid out.
    // ELK 'layered' with 'RIGHT' direction should place R1 (source) left of C1 (target)

    // In ELK coordinate system (top-left origin):
    // R1.x < C1.x
    expect(r1!.electrical!.x!).toBeLessThan(c1!.electrical!.x!);

    const conn1 = page.connections[0];
    expect(conn1.points).toBeDefined();
    expect(conn1.points!.length).toBeGreaterThan(1);

    const rPins = (r1!.electrical as any).pins as { id: string; x: number; y: number }[];
    const cPins = (c1!.electrical as any).pins as { id: string; x: number; y: number }[];
    const r1Pin2 = rPins.find((p) => p.id === '2')!;
    const c1Pin1 = cPins.find((p) => p.id === '1')!;
    const start = conn1.points![0];
    const end = conn1.points![conn1.points!.length - 1];
    expect(Math.abs(start.x - r1Pin2.x)).toBeLessThan(2);
    expect(Math.abs(start.y - r1Pin2.y)).toBeLessThan(2);
    expect(Math.abs(end.x - c1Pin1.x)).toBeLessThan(2);
    expect(Math.abs(end.y - c1Pin1.y)).toBeLessThan(2);
  });

  it('should attach unpinned two-terminal edges to default ports (RIGHT)', async () => {
    const page: SchematicPage = {
      id: 'page1',
      name: 'Test Page',
      symbols: [
        {
          id: 'R1',
          name: 'resistor',
          width: 120,
          height: 60,
          pinGroups: [],
          electrical: { rotation: 0 },
        },
        {
          id: 'C1',
          name: 'capacitor',
          width: 80,
          height: 60,
          pinGroups: [],
          electrical: { rotation: 0 },
        },
      ],
      connections: [
        {
          id: 'conn1',
          source: { id: 'R1', isPin: false },
          target: { id: 'C1', isPin: false },
        },
      ],
      pageSetting: { width: 800, height: 600 },
    };

    const dbMock = {
      getData: () => ({
        schematicData: {
          pages: [page],
        },
        config: {},
      }),
    } as unknown as SchematicDB;

    const config: SchematicConfig = {
      schematic: {
        direction: 'RIGHT',
        nodeSpacing: 60,
      },
    };

    await layoutSchematic(dbMock, config);

    const r1 = page.symbols.find((s) => s.id === 'R1')!;
    const c1 = page.symbols.find((s) => s.id === 'C1')!;

    expect((r1.electrical as any)?.pins?.length).toBe(2);
    expect((c1.electrical as any)?.pins?.length).toBe(2);

    const rPins = (r1.electrical as any).pins as { id: string; x: number; y: number }[];
    const cPins = (c1.electrical as any).pins as { id: string; x: number; y: number }[];
    const r1PinEast = rPins.find((p) => p.id === '1')!;
    const c1PinWest = cPins.find((p) => p.id === '0')!;

    const conn1 = page.connections[0];
    expect(conn1.points).toBeDefined();
    expect(conn1.points!.length).toBeGreaterThan(1);

    const start = conn1.points![0];
    const end = conn1.points![conn1.points!.length - 1];
    expect(Math.abs(start.x - r1PinEast.x)).toBeLessThan(0.5);
    expect(Math.abs(start.y - r1PinEast.y)).toBeLessThan(0.5);
    expect(Math.abs(end.x - c1PinWest.x)).toBeLessThan(0.5);
    expect(Math.abs(end.y - c1PinWest.y)).toBeLessThan(0.5);

    const next = conn1.points![1];
    expect(Math.abs(start.x - next.x) < 0.5 || Math.abs(start.y - next.y) < 0.5).toBe(true);

    const prev = conn1.points![conn1.points!.length - 2];
    expect(Math.abs(end.x - prev.x) < 0.5 || Math.abs(end.y - prev.y) < 0.5).toBe(true);
  });

  it('should attach unpinned two-terminal edges to default ports (DOWN + rotation)', async () => {
    const page: SchematicPage = {
      id: 'page1',
      name: 'Test Page',
      symbols: [
        {
          id: 'R1',
          name: 'resistor',
          pinGroups: [],
          electrical: { rotation: 90 },
        },
        {
          id: 'C1',
          name: 'capacitor',
          pinGroups: [],
          electrical: { rotation: 90 },
        },
      ],
      connections: [
        {
          id: 'conn1',
          source: { id: 'R1', isPin: false },
          target: { id: 'C1', isPin: false },
        },
      ],
      pageSetting: { width: 800, height: 600 },
    };

    const dbMock = {
      getData: () => ({
        schematicData: {
          pages: [page],
        },
        config: {},
      }),
    } as unknown as SchematicDB;

    const config: SchematicConfig = {
      schematic: {
        direction: 'DOWN',
        nodeSpacing: 60,
      },
    };

    await layoutSchematic(dbMock, config);

    const r1 = page.symbols.find((s) => s.id === 'R1')!;
    const c1 = page.symbols.find((s) => s.id === 'C1')!;

    const rPins = ((r1.electrical as any).pins ?? []) as { id: string; x: number; y: number }[];
    const cPins = ((c1.electrical as any).pins ?? []) as { id: string; x: number; y: number }[];
    expect(rPins.length).toBe(2);
    expect(cPins.length).toBe(2);

    const r1PinSouth = rPins.find((p) => p.id === '1')!;
    const c1PinNorth = cPins.find((p) => p.id === '0')!;

    const conn1 = page.connections[0];
    expect(conn1.points).toBeDefined();
    expect(conn1.points!.length).toBeGreaterThan(1);

    const start = conn1.points![0];
    const end = conn1.points![conn1.points!.length - 1];
    expect(Math.abs(start.x - r1PinSouth.x)).toBeLessThan(0.5);
    expect(Math.abs(start.y - r1PinSouth.y)).toBeLessThan(0.5);
    expect(Math.abs(end.x - c1PinNorth.x)).toBeLessThan(0.5);
    expect(Math.abs(end.y - c1PinNorth.y)).toBeLessThan(0.5);
  });
});
