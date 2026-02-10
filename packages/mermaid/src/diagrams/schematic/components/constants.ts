export const COMPONENT_SIZE = 60;
export const COMPONENT_HALF_SIZE = COMPONENT_SIZE / 2;
export const PIN_LENGTH = 10; // Optional, implicit in drawing usually

// Pin highlight styling
export const PIN_HIGHLIGHT_RADIUS = 3;
export const PIN_HIGHLIGHT_FILL = 'yellow';
export const PIN_HIGHLIGHT_STROKE = 'none';
export const PIN_HIGHLIGHT_FILL_OPACITY = 0.8;

// Standard pin definitions relative to component center (0,0)
export const STANDARD_PINS = {
  TWO_TERMINAL: [
    { id: '0', x: -COMPONENT_HALF_SIZE, y: 0, side: 'WEST' },
    { id: '1', x: COMPONENT_HALF_SIZE, y: 0, side: 'EAST' },
  ],
};
