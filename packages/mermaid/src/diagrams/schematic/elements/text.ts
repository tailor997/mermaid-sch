import type { D3Element } from '../../../types.js';
import type { ElementStyle } from './types.js';

export interface TextStyle extends ElementStyle {
  fontSize?: number;
  textAnchor?: 'start' | 'middle' | 'end';
  dominantBaseline?: 'auto' | 'middle' | 'hanging';
}

export const drawText = (
  group: D3Element,
  text: string,
  x: number,
  y: number,
  style: TextStyle = {}
) => {
  const textEl = group.append('text');
  textEl
    .attr('x', x)
    .attr('y', y)
    .text(text)
    .attr('fill', style.fill ?? 'black')
    .attr('font-size', style.fontSize ?? 12)
    .attr('text-anchor', style.textAnchor ?? 'start')
    .attr('dominant-baseline', style.dominantBaseline ?? 'auto');

  if (style.className) {
    textEl.attr('class', style.className);
  }

  return textEl;
};
