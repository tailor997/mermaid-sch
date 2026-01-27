import { describe, it, expect, beforeEach } from 'vitest';
import { select, type Selection, type BaseType } from 'd3';
import { drawLine, drawRect, drawCircle, drawText } from './index.js';

describe('Schematic Elements', () => {
  let g: Selection<SVGGElement, unknown, BaseType, any>;

  beforeEach(() => {
    document.body.innerHTML = '<svg><g id="test-group"></g></svg>';
    g = select('#test-group') as Selection<SVGGElement, unknown, BaseType, any>;
  });

  it('should draw a line', () => {
    drawLine(g, { x: 0, y: 0 }, { x: 10, y: 10 });
    const line = document.querySelector('line');
    expect(line).toBeTruthy();
    expect(line?.getAttribute('x1')).toBe('0');
    expect(line?.getAttribute('x2')).toBe('10');
  });

  it('should draw a rect', () => {
    drawRect(g, 0, 0, 50, 30);
    const rect = document.querySelector('rect');
    expect(rect).toBeTruthy();
    expect(rect?.getAttribute('width')).toBe('50');
    expect(rect?.getAttribute('height')).toBe('30');
  });

  it('should draw a circle', () => {
    drawCircle(g, 10, 10, 5);
    const circle = document.querySelector('circle');
    expect(circle).toBeTruthy();
    expect(circle?.getAttribute('r')).toBe('5');
  });

  it('should draw text', () => {
    drawText(g, 'Hello', 0, 0);
    const text = document.querySelector('text');
    expect(text).toBeTruthy();
    expect(text?.textContent).toBe('Hello');
  });
});
