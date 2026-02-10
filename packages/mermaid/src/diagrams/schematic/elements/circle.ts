import type { D3Element } from '../../../types.js';
import type { ElementStyle } from './types.js';

export const drawCircle = (
  group: D3Element,
  cx: number,
  cy: number,
  r: number,
  style: ElementStyle = {}
) => {
  const circle = group.append('circle');
  circle
    .attr('cx', cx)
    .attr('cy', cy)
    .attr('r', r)
    .attr('stroke', style.stroke ?? 'black')
    .attr('stroke-width', style.strokeWidth ?? 1)
    .attr('fill', style.fill ?? 'none')
    .attr('fill-opacity', style.fillOpacity ?? 1);

  if (style.strokeDasharray) {
    circle.attr('stroke-dasharray', style.strokeDasharray);
  }

  if (style.className) {
    circle.attr('class', style.className);
  }

  return circle;
};
