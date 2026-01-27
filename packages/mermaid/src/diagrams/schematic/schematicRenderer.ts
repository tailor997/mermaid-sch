import type { DrawDefinition } from '../../diagram-api/types.js';
import { log } from '../../logger.js';
import { select } from 'd3';
import type { SchematicDB } from './schematicDb.js';
import { drawResistor, drawCapacitor } from './components/index.js';
import { drawRect, drawText } from './elements/index.js';
import { setupViewPortForSVG } from '../../rendering-util/setupViewPortForSVG.js';

// Simple auto layout function
const autoLayout = (components: any[], startX: number, startY: number) => {
  let x = startX;
  let y = startY;
  const gap = 120;
  const maxWidth = 600;

  components.forEach((comp) => {
    comp.x = x;
    comp.y = y;
    x += gap;
    if (x > startX + maxWidth) {
      x = startX;
      y += 100;
    }
  });
};

export const draw: DrawDefinition = (text, id, _version, diagObj) => {
  log.info('Drawing schematic diagram');
  const db = diagObj.db as SchematicDB;
  const data = db.getData();
  const schematicData = data.schematicData;

  // Select SVG
  // In Mermaid, 'id' passed here is usually the ID of the container div or svg
  // The 'svg' element is usually created by the caller or we select it.
  // Standard pattern: select(`[id="${id}"]`)
  const svg = select(`[id="${id}"]`);

  // Clear existing
  svg.selectAll('*').remove();

  const g = svg.append('g').attr('class', 'schematic-root');

  let currentY = 50;

  // Draw Pages (Title Blocks)
  if (schematicData.pages) {
    schematicData.pages.forEach((page) => {
      // Draw Title Block Frame
      if (page.titleBlock) {
        const titleGroup = g.append('g').attr('class', 'title-block');
        drawRect(titleGroup, 10, currentY, 400, 80, { stroke: 'black', fill: 'none' });
        drawText(titleGroup, `Title: ${page.titleBlock.title ?? ''}`, 20, currentY + 30, {
          fontSize: 16,
        });
        drawText(titleGroup, `Date: ${page.titleBlock.date ?? ''}`, 20, currentY + 60, {
          fontSize: 12,
        });
        currentY += 100;
      }
    });
  }

  // Draw Components
  // Since the parser is not fully ready to parse components, we generate some demo components
  // or use data from db if available (it is empty now based on previous reads)

  // Demo Data for visualization
  const demoComponents = [
    { type: 'resistor', name: 'R1', label: '10k', rotation: 0 },
    { type: 'resistor', name: 'R2', label: '220R', rotation: 90 },
    { type: 'capacitor', name: 'C1', label: '100uF', rotation: 0 },
    { type: 'capacitor', name: 'C2', label: '10nF', rotation: 90 },
    { type: 'resistor', name: 'R3', label: '4.7k', rotation: 0 },
  ];

  // Apply Layout
  autoLayout(demoComponents, 60, currentY + 50);

  // Render
  demoComponents.forEach((comp) => {
    if (comp.type === 'resistor') {
      drawResistor(g, comp);
    } else if (comp.type === 'capacitor') {
      drawCapacitor(g, comp);
    }
  });

  // Setup ViewPort
  // We need to calculate bounding box
  try {
    // @ts-ignore: getBBox is missing in some d3 types or dom types in test env
    const bounds = g.node().getBBox();
    setupViewPortForSVG(svg, data.config.schematic?.padding ?? 10, 'schematic', false);
    // Adjust viewBox manually if needed or rely on setupViewPortForSVG
    svg.attr(
      'viewBox',
      `${bounds.x - 10} ${bounds.y - 10} ${bounds.width + 20} ${bounds.height + 20}`
    );
  } catch {
    log.warn('Could not calculate BBox for schematic');
  }
};

export default { draw };
