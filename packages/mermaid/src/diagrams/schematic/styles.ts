export const styles = () => {
  return `
    .schematic-root {
      font-family: sans-serif;
    }
    .title-block rect {
      stroke: black;
      stroke-width: 1;
      fill: none;
    }
    .component {
      cursor: pointer;
    }
    .resistor polyline {
      fill: none;
      stroke-linejoin: bevel;
    }
    .capacitor line {
      stroke-linecap: square;
    }
  `;
};

export default styles;
