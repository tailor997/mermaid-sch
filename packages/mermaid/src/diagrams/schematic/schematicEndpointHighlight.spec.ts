import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../rendering-util/setupViewPortForSVG.js', () => ({
  setupViewPortForSVG: vi.fn(),
}));

vi.mock('../../diagram-api/diagramAPI.js', () => ({
  getConfig: () => ({
    schematic: {
      showEndpointHighlights: true,
    },
  }),
}));

vi.mock('../../config.js', () => ({
  getUserDefinedConfig: () => ({}),
}));

vi.mock('./schematicLayout.js', () => ({
  layoutSchematic: vi.fn(() => ({
    nodesCount: 0,
    edgesCount: 0,
    layoutTimeMs: 0,
    width: 0,
    height: 0,
  })),
}));

import { draw } from './schematicRenderer.js';
import { SchematicDB } from './schematicDb.js';

describe('schematic endpoint highlights', () => {
  let db: SchematicDB;

  beforeEach(() => {
    document.body.innerHTML = '<svg id="schematic-endpoints"></svg>';
    db = new SchematicDB();
    db.clear();
  });

  it('should render endpoint highlight circles for polyline connections', async () => {
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
    db.addConnection('R1', 'C1');

    const data = db.getData();
    data.schematicData.pages[0].connections[0].points = [
      { x: 10, y: 10 },
      { x: 30, y: 10 },
      { x: 30, y: 40 },
    ];

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
    await draw('text', 'schematic-endpoints', '1.0', diagObj as any);

    const svgNode = document.getElementById('schematic-endpoints')!;
    const endpointCircles = svgNode.querySelectorAll('.endpoint-highlight');
    expect(endpointCircles.length).toBe(2);
  });
});
