export const styles = () => {
  return `
    .schematic-root {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }
    
    /* Page Styles */
    .page-border {
      fill: white;
      stroke: #333;
      stroke-width: 2;
    }
    
    /* Title Block Styles */
    .title-block rect {
      stroke: #333;
      stroke-width: 1;
      fill: none;
    }
    .title-block line {
      stroke: #333;
      stroke-width: 1;
    }
    .title-block text {
      font-family: sans-serif;
    }
    
    /* Symbol Default Styles */
    .symbol {
      cursor: pointer;
    }
    
    /* Symbol Body - Default rectangular shape */
    .symbol-body {
      fill: #f8f9fa;
      stroke: #333;
      stroke-width: 1.5;
      stroke-linejoin: round;
    }
    
    /* Symbol with multiple parts */
    .symbol-multi-part .symbol-body {
      fill: #e9ecef;
      stroke: #495057;
      stroke-width: 1.5;
    }
    
    /* Part group within a symbol */
    .symbol-part {
      fill: none;
      stroke: #6c757d;
      stroke-width: 1;
      stroke-dasharray: 4,2;
    }
    
    .symbol-part-label {
      font-size: 10px;
      fill: #6c757d;
      font-weight: 500;
    }
    
    /* Pin Styles */
    .pin {
      stroke: #333;
      stroke-width: 1;
    }
    
    .pin-line {
      stroke: #333;
      stroke-width: 1;
    }
    
    .pin-dot {
      fill: #333;
    }
    
    .pin-label {
      font-size: 9px;
      fill: #495057;
    }
    
    .pin-number {
      font-size: 7px;
      fill: #868e96;
    }
    
    /* Pin Types */
    .pin-type-power {
      stroke: #dc3545;
    }
    
    .pin-type-ground {
      stroke: #333;
    }
    
    .pin-type-input {
      stroke: #0d6efd;
    }
    
    .pin-type-output {
      stroke: #198754;
    }
    
    .pin-type-bidirectional {
      stroke: #6f42c1;
    }
    
    /* Symbol Labels */
    .symbol-name {
      font-size: 11px;
      font-weight: 600;
      fill: #212529;
    }
    
    .symbol-ref {
      font-size: 10px;
      fill: #495057;
    }
    
    .symbol-value {
      font-size: 9px;
      fill: #6c757d;
    }
    
    /* Component-specific styles */
    .component {
      cursor: pointer;
    }
    
    /* Resistor */
    .resistor polyline {
      fill: none;
      stroke: #333;
      stroke-width: 1.5;
      stroke-linejoin: bevel;
    }
    
    /* Capacitor */
    .capacitor line {
      stroke: #333;
      stroke-width: 1.5;
      stroke-linecap: square;
    }
    
    /* Inductor */
    .inductor path {
      fill: none;
      stroke: #333;
      stroke-width: 1.5;
    }
    
    /* IC / Multi-pin Symbol */
    .ic-symbol .symbol-body {
      fill: #fff3cd;
      stroke: #664d03;
    }
    
    .ic-symbol .pin-line {
      stroke: #664d03;
    }
    
    /* Power Symbol */
    .power-symbol .symbol-body {
      fill: #f8d7da;
      stroke: #842029;
    }
    
    /* Ground Symbol */
    .ground-symbol .symbol-body {
      fill: #d1e7dd;
      stroke: #0f5132;
    }
    
    /* LED */
    .led-symbol .symbol-body {
      fill: #fff3cd;
      stroke: #664d03;
    }
    
    .led-symbol .led-arrow {
      fill: none;
      stroke: #198754;
      stroke-width: 1;
    }
    
    /* Crystal */
    .crystal-symbol .symbol-body {
      fill: #e2e3e5;
      stroke: #41464b;
    }
    
    /* Connection/Wire Styles */
    .wire {
      stroke: #0066cc;
      stroke-width: 1.5;
      fill: none;
    }
    
    .wire:hover {
      stroke-width: 2.5;
      stroke: #0052a3;
    }
    
    /* Junction dots */
    .junction {
      fill: #0066cc;
    }
    
    /* Net labels */
    .net-label {
      font-size: 10px;
      fill: #dc3545;
      font-weight: 500;
    }
    
    /* Endpoint highlights (for debugging) */
    .endpoint-highlight {
      pointer-events: none;
    }
    
    .pin-highlight {
      pointer-events: none;
    }
    
    /* Hidden/Metadata subgraph - not rendered visually */
    .meta-data {
      display: none;
    }
    
    /* Symbol Instance Styles */
    .symbol-instance {
      filter: drop-shadow(0 1px 2px rgba(0,0,0,0.1));
    }
    
    .symbol-instance:hover {
      filter: drop-shadow(0 2px 4px rgba(0,0,0,0.15));
    }
    
    .symbol-instance:hover .symbol-body {
      stroke: #0d6efd;
      stroke-width: 2;
    }
  `;
};

export default styles;
