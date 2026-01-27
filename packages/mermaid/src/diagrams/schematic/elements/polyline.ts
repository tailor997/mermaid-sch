import type { D3Element } from '../../../types.js';
import type { ElementStyle, Point } from './types.js';

export const drawPolyline = (group: D3Element, points: Point[], style: ElementStyle = {}) => {
  const pointsStr = points.map((p) => `${p.x},${p.y}`).join(' ');
  const polyline = group.append('polyline');
  polyline
    .attr('points', pointsStr)
    .attr('stroke', style.stroke ?? 'black')
    .attr('stroke-width', style.strokeWidth ?? 1)
    .attr('fill', style.fill ?? 'none');

  if (style.strokeDasharray) {
    polyline.attr('stroke-dasharray', style.strokeDasharray);
  }

  if (style.className) {
    polyline.attr('class', style.className);
  }

  return polyline;
};
