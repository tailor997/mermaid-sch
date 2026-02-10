import type { D3Element } from '../../../types.js';
import { drawLine, drawText } from '../elements/index.js';
import type { ComponentProps } from './types.js';
import { applyTransform } from './utils.js';

import { COMPONENT_SIZE } from './constants.js';

export const drawCapacitor = (parent: D3Element, props: ComponentProps) => {
  const { x, y, rotation = 0, label, name, size = COMPONENT_SIZE, color = 'black' } = props;

  const group = parent.append('g').attr('class', 'component capacitor');
  applyTransform(group, x, y, rotation);

  // Dimensions
  const halfSize = size / 2;
  const gap = 8;
  const plateHeight = 24;

  // Draw leads
  drawLine(group, { x: -halfSize, y: 0 }, { x: -gap / 2, y: 0 }, { stroke: color });
  drawLine(group, { x: gap / 2, y: 0 }, { x: halfSize, y: 0 }, { stroke: color });

  // Draw Plates
  // Left plate
  drawLine(
    group,
    { x: -gap / 2, y: -plateHeight / 2 },
    { x: -gap / 2, y: plateHeight / 2 },
    { stroke: color, strokeWidth: 2 }
  );
  // Right plate
  drawLine(
    group,
    { x: gap / 2, y: -plateHeight / 2 },
    { x: gap / 2, y: plateHeight / 2 },
    { stroke: color, strokeWidth: 2 }
  );

  // Draw Labels
  if (name) {
    drawText(group, name, 0, -20, { textAnchor: 'middle', fontSize: 10 });
  }
  if (label) {
    drawText(group, label, 0, 25, { textAnchor: 'middle', fontSize: 10 });
  }

  return group;
};
