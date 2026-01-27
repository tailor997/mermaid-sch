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

    const diagObj = {
      db: db,
      type: 'schematic',
      parser: { parse: vi.fn() },
      renderer: {},
    };

    // Mock getBBox because JSDOM doesn't support it well
    Element.prototype.getBBox = () => ({ x: 0, y: 0, width: 100, height: 100 }) as DOMRect;

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
});
