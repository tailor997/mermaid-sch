import type { D3Element } from '../../../types.js';
import type { ElementStyle } from './types.js';

export const drawRect = (
  group: D3Element,
  x: number,
  y: number,
  width: number,
  height: number,
  style: ElementStyle = {}
) => {
  const rect = group.append('rect');
  rect
    .attr('x', x)
    .attr('y', y)
    .attr('width', width)
    .attr('height', height)
    .attr('stroke', style.stroke ?? 'black')
    .attr('stroke-width', style.strokeWidth ?? 1)
    .attr('fill', style.fill ?? 'none');

  if (style.strokeDasharray) {
    rect.attr('stroke-dasharray', style.strokeDasharray);
  }

  if (style.className) {
    rect.attr('class', style.className);
  }

  return rect;
};
