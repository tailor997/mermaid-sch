import type { D3Element } from '../../../types.js';
import type { ElementStyle, Point } from './types.js';

export const drawLine = (group: D3Element, start: Point, end: Point, style: ElementStyle = {}) => {
  const line = group.append('line');
  line
    .attr('x1', start.x)
    .attr('y1', start.y)
    .attr('x2', end.x)
    .attr('y2', end.y)
    .attr('stroke', style.stroke ?? 'black')
    .attr('stroke-width', style.strokeWidth ?? 1)
    .attr('fill', 'none');

  if (style.strokeDasharray) {
    line.attr('stroke-dasharray', style.strokeDasharray);
  }

  if (style.className) {
    line.attr('class', style.className);
  }

  return line;
};
