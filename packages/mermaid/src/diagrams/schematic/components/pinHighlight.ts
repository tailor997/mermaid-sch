import type { D3Element } from '../../../types.js';
import { drawCircle } from '../elements/index.js';

export interface PinHighlightProps {
  x: number;
  y: number;
  radius?: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  fillOpacity?: number;
  className?: string;
}

/**
 * Draws a pin highlight marker at the specified coordinates
 * @param parent - The parent SVG element
 * @param props - Pin highlight properties
 * @returns The created SVG circle element
 */
export const drawPinHighlight = (parent: D3Element, props: PinHighlightProps) => {
  const {
    x,
    y,
    radius = 3,
    fill = 'yellow',
    stroke = 'none',
    strokeWidth = 0,
    fillOpacity = 0.8,
    className = 'pin-highlight',
  } = props;

  return drawCircle(parent, x, y, radius, {
    fill,
    stroke,
    strokeWidth,
    fillOpacity,
    className,
  });
};
