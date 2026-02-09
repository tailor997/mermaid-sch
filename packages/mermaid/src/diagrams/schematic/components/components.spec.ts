import { describe, it, expect, beforeEach } from 'vitest';
import { select, type Selection, type BaseType } from 'd3';
import { drawResistor, drawCapacitor } from './index.js';

describe('Schematic Components', () => {
  let g: Selection<SVGGElement, unknown, BaseType, unknown>;

  beforeEach(() => {
    document.body.innerHTML = '<svg><g id="test-group"></g></svg>';
    g = select('#test-group') as Selection<SVGGElement, unknown, BaseType, unknown>;
  });

  it('should draw a resistor', () => {
    drawResistor(g, { x: 0, y: 0, name: 'R1' });
    const res = document.querySelector('.resistor');
    expect(res).toBeTruthy();
    expect(res?.querySelector('polyline')).toBeTruthy(); // Zigzag
    expect(res?.textContent).toContain('R1');
  });

  it('should draw a capacitor', () => {
    drawCapacitor(g, { x: 0, y: 0, name: 'C1' });
    const cap = document.querySelector('.capacitor');
    expect(cap).toBeTruthy();
    // Capacitor has 2 parallel lines (plates) and 2 leads, so at least 4 lines
    const lines = cap?.querySelectorAll('line');
    expect(lines?.length).toBeGreaterThanOrEqual(4);
    expect(cap?.textContent).toContain('C1');
  });
});
