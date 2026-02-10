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
  });
});
