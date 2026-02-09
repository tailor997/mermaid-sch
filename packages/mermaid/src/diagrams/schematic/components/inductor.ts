import type { D3Element } from '../../../types.js';
import { drawLine, drawText } from '../elements/index.js';
import type { ComponentProps } from './types.js';
import { applyTransform } from './utils.js';

export const drawInductor = (parent: D3Element, props: ComponentProps) => {
  const { x, y, rotation = 0, label, name, size = 60, color = 'black' } = props;

  const group = parent.append('g').attr('class', 'component inductor');
  applyTransform(group, x, y, rotation);

  // Dimensions
  const coilCount = 4;
  const coilWidth = 10;
  const coilHeight = 8;
  const coilLen = coilCount * coilWidth;
  const totalLen = size;
  const leadLen = (totalLen - coilLen) / 2;

  // Draw leads
  drawLine(group, { x: -size / 2, y: 0 }, { x: -size / 2 + leadLen, y: 0 }, { stroke: color });
  drawLine(group, { x: size / 2 - leadLen, y: 0 }, { x: size / 2, y: 0 }, { stroke: color });

  // Draw Coils
  // Using path with arcs
  // Start at left of coil section
  let pathD = `M ${-size / 2 + leadLen} 0`;
  for (let i = 0; i < coilCount; i++) {
    // Relative arc: rx ry x-axis-rotation large-arc-flag sweep-flag dx dy
    // Drawing loops upwards
    pathD += ` a ${coilWidth / 2} ${coilHeight} 0 0 1 ${coilWidth} 0`;
  }

  group
    .append('path')
    .attr('d', pathD)
    .attr('stroke', color)
    .attr('fill', 'none')
    .attr('stroke-width', 1.5)
    .attr('stroke-linecap', 'round');

  // Draw Labels
  if (name) {
    drawText(group, name, 0, -15, { textAnchor: 'middle', fontSize: 10 });
  }
  if (label) {
    drawText(group, label, 0, 25, { textAnchor: 'middle', fontSize: 10 });
  }

  return group;
};
