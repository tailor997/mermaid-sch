import { describe, it, expect, beforeEach } from 'vitest';
import { select, type Selection, type BaseType } from 'd3';
import { drawInductor } from './inductor.js';

describe('Schematic Inductor', () => {
  let g: Selection<SVGGElement, unknown, BaseType, unknown>;

  beforeEach(() => {
    document.body.innerHTML = '<svg><g id="test-group"></g></svg>';
    g = select('#test-group') as Selection<SVGGElement, unknown, BaseType, unknown>;
  });

  it('should draw an inductor', () => {
    drawInductor(g, { x: 0, y: 0, name: 'L1' });
    const ind = document.querySelector('.inductor');
    expect(ind).toBeTruthy();
    const path = ind?.querySelector('path');
    expect(path).toBeTruthy();
    expect(path?.getAttribute('d')).toContain('M');
    expect(ind?.textContent).toContain('L1');
  });
});
