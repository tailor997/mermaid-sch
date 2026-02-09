import { describe, it, expect, vi, beforeEach } from 'vitest';
import { draw } from './schematicRenderer.js';
import { SchematicDB } from './schematicDb.js';

// Mock setupViewPortForSVG to avoid errors with getBBox
vi.mock('../../rendering-util/setupViewPortForSVG.js', () => ({
  setupViewPortForSVG: vi.fn(),
}));

describe('schematicRenderer', () => {
  let db: SchematicDB;

  beforeEach(() => {
    document.body.innerHTML = '<svg id="schematic-demo"></svg>';
    db = new SchematicDB();
    db.clear();
  });

  it('should render title block and components', async () => {
    // Setup data
    db.addPage('Page1', 'Main Page');
    db.setTitleBlock({ title: 'Test Schematic' });

    // Add symbols manually for test
    db.addSymbol({
      id: 'R1',
      name: 'Resistor',
      pinGroups: [],
      electrical: { label: '10k', rotation: 0 },
    });
    db.addSymbol({
      id: 'C1',
      name: 'Capacitor',
      pinGroups: [],
      electrical: { label: '100uF', rotation: 0 },
    });

    const diagObj = {
      db: db,
      type: 'schematic',
      parser: { parse: vi.fn() },
      renderer: { draw: vi.fn() },
      text: '',
      render: vi.fn(),
      getParser: vi.fn(),
      getType: vi.fn(),
      draw: vi.fn(),
    };

    // Mock getBBox because JSDOM doesn't support it well
    (Element.prototype as any).getBBox = () => ({ x: 0, y: 0, width: 100, height: 100 }) as DOMRect;

    await draw('text', 'schematic-demo', '1.0', diagObj);

    const svgNode = document.getElementById('schematic-demo');
    expect(svgNode).toBeTruthy();

    // Check Title Block
    const titleBlock = svgNode?.querySelector('.title-block');
    expect(titleBlock).toBeTruthy();
    expect(titleBlock?.textContent).toContain('Test Schematic');

    // Check Components (Demo components are rendered by default currently)
    const resistors = svgNode?.querySelectorAll('.resistor');
    expect(resistors?.length).toBeGreaterThan(0);

    const capacitors = svgNode?.querySelectorAll('.capacitor');
    expect(capacitors?.length).toBeGreaterThan(0);
  });

  it('should render connections', async () => {
    // Add SVG for this test
    const div = document.createElement('div');
    div.innerHTML = '<svg id="schematic-demo-conn"></svg>';
    document.body.appendChild(div);

    db.addPage('Page1', 'Main Page');
    db.addSymbol({
      id: 'R1',
      name: 'Resistor',
      pinGroups: [],
      electrical: { label: '10k', rotation: 0, x: 100, y: 100 },
    });
    db.addSymbol({
      id: 'C1',
      name: 'Capacitor',
      pinGroups: [],
      electrical: { label: '100uF', rotation: 0, x: 200, y: 100 },
    });

    // Connect R1:1 to C1:0
    db.addConnection('R1', 'C1', '1', '0');

    const diagObj = {
      db: db,
      type: 'schematic',
      parser: { parse: vi.fn() },
      renderer: { draw: vi.fn() },
      text: '',
      render: vi.fn(),
      getParser: vi.fn(),
      getType: vi.fn(),
      draw: vi.fn(),
    };

    (Element.prototype as any).getBBox = () => ({ x: 0, y: 0, width: 300, height: 300 }) as DOMRect;
    await draw('text', 'schematic-demo-conn', '1.0', diagObj);

    const svgNode = document.getElementById('schematic-demo-conn');
    const lines = svgNode?.querySelectorAll('line');
    // We expect lines for:
    // - Page Border (rect uses path or rect? elements.ts uses rect or line?)
    // - Components (resistor/capacitor use paths)
    // - Connection line

    // Actually drawLine uses 'line' element.
    // Page border uses 'rect'.
    // Components use 'path' or 'line' for leads. Resistor/Capacitor use lines for leads.
    // So there will be multiple lines.
    // Let's verify we have lines.
    expect(lines?.length).toBeGreaterThan(0);

    // Verify at least one line connects approx x=130 (R1 right) to x=170 (C1 left)
    // R1 at 100, pin 1 at +30 = 130
    // C1 at 200, pin 0 at -30 = 170
    // So line from 130,100 to 170,100

    const connLine = [...(lines || [])].find((l) => {
      const x1 = parseFloat(l.getAttribute('x1') || '0');
      const x2 = parseFloat(l.getAttribute('x2') || '0');
      return Math.abs(x1 - 130) < 1 && Math.abs(x2 - 170) < 1;
    });
    expect(connLine).toBeTruthy();
  });
});
