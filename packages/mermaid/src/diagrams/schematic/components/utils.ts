import type { D3Element } from '../../../types.js';

export const applyTransform = (group: D3Element, x: number, y: number, rotation = 0) => {
  let transform = `translate(${x}, ${y})`;
  if (rotation !== 0) {
    transform += ` rotate(${rotation})`;
  }
  group.attr('transform', transform);
};
