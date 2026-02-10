import type { D3Element } from '../../../types.js';
import { drawLine, drawText, drawPolyline } from '../elements/index.js';
import type { ComponentProps } from './types.js';
import { applyTransform } from './utils.js';

import { COMPONENT_SIZE } from './constants.js';

export const drawResistor = (parent: D3Element, props: ComponentProps) => {
  const { x, y, rotation = 0, label, name, size = COMPONENT_SIZE, color = 'black' } = props;

  const group = parent.append('g').attr('class', 'component resistor');
  applyTransform(group, x, y, rotation);

  // Dimensions
  const halfSize = size / 2;
  const zigZagLen = size / 2; // Length of the zig-zag part
  const height = 10; // Height of zig-zag

  // Draw leads
  drawLine(group, { x: -halfSize, y: 0 }, { x: -size / 4, y: 0 }, { stroke: color });
  drawLine(group, { x: size / 4, y: 0 }, { x: halfSize, y: 0 }, { stroke: color });

  // Draw Zig-Zag (ANSI style)
  // 6 points for zig-zag
  const points = [
    { x: -size / 4, y: 0 },
    { x: -size / 4 + zigZagLen / 6, y: -height },
    { x: -size / 4 + (2 * zigZagLen) / 6, y: height },
    { x: -size / 4 + (3 * zigZagLen) / 6, y: -height },
    { x: -size / 4 + (4 * zigZagLen) / 6, y: height },
    { x: -size / 4 + (5 * zigZagLen) / 6, y: -height },
    { x: size / 4, y: 0 },
  ];

  drawPolyline(group, points, { stroke: color, fill: 'none' });

  // Draw Labels
  if (name) {
    drawText(group, name, -10, -15, { textAnchor: 'middle', fontSize: 10 });
  }
  if (label) {
    drawText(group, label, -10, 20, { textAnchor: 'middle', fontSize: 10 });
  }

  return group;
};
