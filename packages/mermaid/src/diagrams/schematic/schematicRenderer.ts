// cspell:ignore SOIC,TSSOP,LQFP
import type { DrawDefinition } from '../../diagram-api/types.js';
import { log } from '../../logger.js';
import { select } from 'd3';
import type {
  SchematicDB,
  PageSetting,
  SchematicPage,
  SchematicConnection,
  SchematicSymbol,
} from './schematicDb.js';
import { SymbolLibrary } from './components/index.js';
import {
  generateDualSidePackage,
  generateQuadPackage,
  type PackageConfig,
} from './components/symbols/ic/icPackageGenerator.js';
import { drawSvgSymbol } from './components/svgSymbol.js';
import type { SchematicSymbolDefinition } from './schematicDb.js';
import { drawPinHighlight } from './components/pinHighlight.js';
import {
  PIN_HIGHLIGHT_FILL,
  PIN_HIGHLIGHT_FILL_OPACITY,
  PIN_HIGHLIGHT_RADIUS,
  PIN_HIGHLIGHT_STROKE,
} from './components/constants.js';
import { drawRect, drawText, drawLine, drawPolyline } from './elements/index.js';
import { setupViewPortForSVG } from '../../rendering-util/setupViewPortForSVG.js';
import { layoutSchematic, type SchematicConfig } from './schematicLayout.js';

// Global symbol library instance
let symbolLibrary: SymbolLibrary | null = null;

/**
 * Initialize symbol library
 * Path is relative to the page root - symbols are served from demos/symbols
 */
const initSymbolLibrary = async (): Promise<SymbolLibrary> => {
  if (!symbolLibrary) {
    // Use relative path from page root (demos/ directory)
    symbolLibrary = new SymbolLibrary('./symbols');
    await symbolLibrary.init();
  }
  return symbolLibrary;
};

interface DemoComponent {
  type: string;
  name: string;
  label: string;
  rotation: number;
  x?: number;
  y?: number;
  showPinHighlights?: boolean;
}

const paperSizes: Record<string, { width: number; height: number }> = {
  A4: { width: 297, height: 210 },
  A3: { width: 420, height: 297 },
  A2: { width: 594, height: 420 },
  A1: { width: 841, height: 594 },
  A0: { width: 1189, height: 841 },
};

const MM_TO_PX = 3.78; // 96 DPI: 1 mm = 3.78 px

const getPageDimensions = (pageSetting?: PageSetting) => {
  let width = paperSizes.A4.width;
  let height = paperSizes.A4.height;

  if (pageSetting?.paper && paperSizes[pageSetting.paper.toUpperCase()]) {
    const size = paperSizes[pageSetting.paper.toUpperCase()];
    width = size.width;
    height = size.height;
  }

  if (pageSetting?.width) {
    width = pageSetting.width;
  }
  if (pageSetting?.height) {
    height = pageSetting.height;
  }

  // Handle orientation
  const isLandscape = pageSetting?.orientation !== 'portrait'; // Default to landscape
  if ((isLandscape && height > width) || (!isLandscape && width > height)) {
    const temp = width;
    width = height;
    height = temp;
  }

  return { width: width * MM_TO_PX, height: height * MM_TO_PX };
};

// Simple auto layout function
const autoLayout = (components: DemoComponent[], startX: number, startY: number) => {
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

/**
 * Render a custom symbol based on shape definition
 * Supports dual-side packages (dual04, dual05, ..., dual24) and quad packages
 */
const renderCustomSymbol = (
  parent: any,
  comp: DemoComponent,
  symbolDef: SchematicSymbolDefinition,
  x: number,
  y: number
): Record<string, { x: number; y: number }> | null => {
  const shape = symbolDef.shape;
  if (!shape) {
    return null;
  }

  // Parse shape name (e.g., "dual10", "quad16")
  const dualMatch = /^dual(\d+)$/i.exec(shape);
  const quadMatch = /^quad(\d+)$/i.exec(shape);

  if (dualMatch) {
    const pinsPerSide = parseInt(dualMatch[1], 10);
    return renderDualSidePackage(parent, comp, symbolDef, x, y, pinsPerSide);
  } else if (quadMatch) {
    const pinsPerSide = parseInt(quadMatch[1], 10);
    return renderQuadPackage(parent, comp, symbolDef, x, y, pinsPerSide);
  }

  log.warn(`Unsupported shape: ${shape}`);
  return null;
};

/**
 * Render a dual-side package (DIP, SOIC, TSSOP, etc.)
 */
const renderDualSidePackage = (
  parent: any,
  comp: DemoComponent,
  symbolDef: SchematicSymbolDefinition,
  x: number,
  y: number,
  pinsPerSide: number
): Record<string, { x: number; y: number }> => {
  const config: PackageConfig = {
    type: 'sop',
    pinsPerSide,
    pinPitch: 10,
    pinLength: 8,
    bodyWidth: 50,
  };

  const { svg, pins } = generateDualSidePackage(config);

  const result = drawSvgSymbol(parent, {
    x,
    y,
    rotation: comp.rotation,
    label: comp.label,
    name: comp.name,
    svgContent: svg,
    pins,
  });

  // Draw pin names if available
  if (symbolDef.pins && symbolDef.pins.length > 0) {
    drawPinNames(result.group, symbolDef.pins, pins, comp.rotation);
  }

  return result.pins;
};

/**
 * Render a quad package (QFN, QFP, LQFP, etc.)
 */
const renderQuadPackage = (
  parent: any,
  comp: DemoComponent,
  symbolDef: SchematicSymbolDefinition,
  x: number,
  y: number,
  pinsPerSide: number
): Record<string, { x: number; y: number }> => {
  const config: PackageConfig = {
    type: 'qfp',
    pinsPerSide,
    pinPitch: 10,
    pinLength: 10,
    bodyWidth: 70,
  };

  const { svg, pins } = generateQuadPackage(config);

  const result = drawSvgSymbol(parent, {
    x,
    y,
    rotation: comp.rotation,
    label: comp.label,
    name: comp.name,
    svgContent: svg,
    pins,
  });

  // Draw pin names if available
  if (symbolDef.pins && symbolDef.pins.length > 0) {
    drawPinNames(result.group, symbolDef.pins, pins, comp.rotation);
  }

  return result.pins;
};

/**
 * Draw pin names next to the package pins
 */
const drawPinNames = (
  group: any,
  pinDefs: { num: number; name: string; type?: string; desc?: string }[],
  pinPositions: Record<string, { x: number; y: number; name: string; type: string }>,
  rotation: number
): void => {
  const rad = ((rotation || 0) * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);

  pinDefs.forEach((pinDef) => {
    const pinNum = (pinDef.num - 1).toString();
    const pinPos = pinPositions[pinNum];
    if (!pinPos) {
      return;
    }

    // Calculate label position (offset from pin)
    // Determine side based on pin x position relative to center
    const isLeft = pinPos.x < 0;
    const offsetX = isLeft ? -15 : 15;

    // Apply rotation to offset
    const rotOffsetX = offsetX * cos;
    const rotOffsetY = offsetX * sin;

    drawText(group, pinDef.name, pinPos.x + rotOffsetX, pinPos.y + rotOffsetY, {
      fontSize: 8,
      fill: '#333',
      textAnchor: isLeft ? 'end' : 'start',
      dominantBaseline: 'middle',
    });
  });
};

export const draw: DrawDefinition = async (text, id, _version, diagObj) => {
  log.info('Drawing schematic diagram');
  const db = diagObj.db as SchematicDB;

  const data = db.getData();
  const config = data.config as SchematicConfig;
  await layoutSchematic(db, config);

  const schematicData = data.schematicData;

  // Select SVG
  const svg = select(`[id="${id}"]`);

  // Clear existing
  svg.selectAll('*').remove();

  const g = svg.append('g').attr('class', 'schematic-root');

  let currentY = 0;
  const pageGap = 50;

  // Draw Pages
  if (schematicData.pages?.length > 0) {
    schematicData.pages.forEach((page: SchematicPage) => {
      const { width, height } = getPageDimensions(page.pageSetting);

      const pageGroup = g
        .append('g')
        .attr('class', `page-group page-${page.id}`)
        .attr('transform', `translate(0, ${currentY})`);

      // Draw Page Border (Paper)
      drawRect(pageGroup, 0, 0, width, height, {
        stroke: 'black',
        strokeWidth: 2,
        fill: 'white',
        className: 'page-border',
      });

      // Draw Title Block if exists
      if (page.titleBlock) {
        // Standard Title Block Size (approx 160mm x 60mm converted to px)
        const tbWidth = 160 * MM_TO_PX;
        const tbHeight = 60 * MM_TO_PX;

        // Position at bottom right
        const tbX = width - tbWidth;
        const tbY = height - tbHeight;

        const titleGroup = pageGroup
          .append('g')
          .attr('class', 'title-block')
          .attr('transform', `translate(${tbX}, ${tbY})`);

        // Outer border of title block
        drawRect(titleGroup, 0, 0, tbWidth, tbHeight, {
          stroke: 'black',
          strokeWidth: 1,
          fill: 'none',
        });

        // Inner lines for layout
        // Horizontal line splitting title and details
        const splitY = tbHeight * 0.6;
        drawLine(titleGroup, { x: 0, y: splitY }, { x: tbWidth, y: splitY }, { stroke: 'black' });

        // Vertical lines for details
        const colWidth = tbWidth / 3;
        drawLine(
          titleGroup,
          { x: colWidth, y: splitY },
          { x: colWidth, y: tbHeight },
          { stroke: 'black' }
        );
        drawLine(
          titleGroup,
          { x: colWidth * 2, y: splitY },
          { x: colWidth * 2, y: tbHeight },
          { stroke: 'black' }
        );

        // Title
        drawText(titleGroup, 'Title:', 10, 20, { fontSize: 10, fill: '#666' });
        drawText(titleGroup, page.titleBlock.title ?? 'Untitled', 10, 45, {
          fontSize: 24,
          textAnchor: 'start',
        });

        // Company
        drawText(titleGroup, 'Company:', 10, splitY + 15, { fontSize: 10, fill: '#666' });
        drawText(titleGroup, page.titleBlock.company ?? '', 10, splitY + 30, { fontSize: 12 });

        // Date
        drawText(titleGroup, 'Date:', colWidth + 10, splitY + 15, { fontSize: 10, fill: '#666' });
        drawText(titleGroup, page.titleBlock.date ?? '', colWidth + 10, splitY + 30, {
          fontSize: 12,
        });

        // Rev
        drawText(titleGroup, 'Rev:', colWidth * 2 + 10, splitY + 15, {
          fontSize: 10,
          fill: '#666',
        });
        drawText(titleGroup, page.titleBlock.rev ?? '', colWidth * 2 + 10, splitY + 30, {
          fontSize: 12,
        });
      }

      currentY += height + pageGap;
    });
  } else {
    // Default page if no pages defined
    const { width, height } = getPageDimensions();
    drawRect(g, 0, 0, width, height, { stroke: 'black', strokeWidth: 2, fill: 'white' });
  }

  // Render Symbols from Page Data
  if (schematicData.pages?.length > 0) {
    for (const page of schematicData.pages) {
      // Find the page group
      const pageGroup = g.select(`.page-group.page-${page.id}`);

      if (page.symbols?.length > 0) {
        // Map symbols to DemoComponent format for rendering
        // In the future, we should unify the types
        const components: DemoComponent[] = page.symbols.map((sym: SchematicSymbol) => {
          return {
            type: sym.name.toLowerCase(), // 'resistor' etc.
            name: sym.id, // 'R1' etc.
            label: (sym.electrical?.label as string) || (sym.electrical?.value as string) || '',
            rotation: (sym.electrical?.rotation as number) || 0,
            x: sym.electrical?.x as number,
            y: sym.electrical?.y as number,
            showPinHighlights: config.schematic?.showPinHighlights,
          };
        });

        // Apply auto layout if positions are missing
        // This is a simple heuristic: if any component lacks x or y, run auto layout on all
        // (Better approach would be to only layout missing ones, but for now this is fine)
        const needsLayout = components.some((c) => c.x === undefined || c.y === undefined);
        if (needsLayout) {
          autoLayout(components, 100, 100);
        }

        // Initialize symbol library for SVG support
        log.info('[SchematicRenderer] Initializing symbol library...');
        const symLib = await initSymbolLibrary();
        log.info('[SchematicRenderer] Symbol library initialized');

        // Store pin positions for connections
        const componentPins = new Map<string, Record<string, { x: number; y: number }>>();

        for (const comp of components) {
          if (comp.x === undefined || comp.y === undefined) {
            continue;
          }

          // Check if symbol exists in SVG library
          const symbolDef = symLib.getSymbol(comp.type);
          if (symbolDef) {
            // Use SVG symbol
            const result = await symLib.drawSymbol(pageGroup, comp.type, {
              x: comp.x,
              y: comp.y,
              rotation: comp.rotation,
              label: comp.label,
              name: comp.name,
            });
            if (result) {
              componentPins.set(comp.name, result.pins);
            }
          } else {
            // Check if it's a custom symbol with shape definition
            const pageSymbol = page.symbols.find((s) => s.id === comp.name);
            const symbolDefinition = pageSymbol?.electrical?._symbolDef as
              | SchematicSymbolDefinition
              | undefined;

            if (symbolDefinition?.shape) {
              // Render custom IC symbol based on shape
              const pins = renderCustomSymbol(pageGroup, comp, symbolDefinition, comp.x, comp.y);
              if (pins) {
                componentPins.set(comp.name, pins);
              }
            } else {
              // Symbol not found in library
              log.warn(`Unknown component type: ${comp.type}`);
            }
          }
        }

        // Draw Connections
        if (page.connections?.length > 0) {
          const symbolMap = new Map<string, SchematicSymbol>();
          page.symbols.forEach((s) => symbolMap.set(s.id, s));

          const getComponent = (id: string) => components.find((c) => c.name === id);

          // Helper to get pin coordinates
          const getPinCoord = (
            compId: string,
            pin: string | undefined
          ): { x: number; y: number } | null => {
            // First try to get from ELK layout data
            const sym = symbolMap.get(compId);
            if (sym?.electrical?.pins && Array.isArray(sym.electrical.pins)) {
              // Try to find the pin
              // Normalized pin ID lookup could be tricky if pin names vary (0 vs left)
              // But let's assume standard names first
              const targetPin = pin;
              if (!targetPin) {
                // Default to pin 0 if not specified? Or center?
                // If undefined, maybe we want center.
              } else {
                // Try exact match
                let pinData = sym.electrical.pins.find((p: any) => p.id === targetPin);

                // Try aliases if not found
                if (!pinData) {
                  let alias = targetPin;
                  if (
                    alias === 'left' ||
                    alias === 'in' ||
                    alias === 'negative' ||
                    alias === 'anode'
                  ) {
                    alias = '0';
                  } else if (
                    alias === 'right' ||
                    alias === 'out' ||
                    alias === 'positive' ||
                    alias === 'cathode'
                  ) {
                    alias = '1';
                  }

                  pinData = sym.electrical.pins.find((p: any) => p.id === alias);
                }

                if (pinData) {
                  return { x: pinData.x, y: pinData.y };
                }
              }
            }

            // Fallback to old calculation logic
            const comp = getComponent(compId);
            if (comp?.x === undefined || comp.y === undefined) {
              return null;
            }

            // Default pin offsets for simple components (width=60, center at 0,0)
            // Pin 0: left (-30, 0), Pin 1: right (30, 0)
            // Rotation is applied around 0,0
            // Note: Components are drawn centered at (0,0) in their group, then translated to comp.x, comp.y
            // So comp.x, comp.y IS the center of the component in the page group.

            const halfSize = 30;
            let dx = 0;
            const dy = 0;

            // Normalize pin names to standard 0/1 for 2-pin components if possible
            // or trust the pin ID if it matches 0/1 directly
            let effectivePin = pin;

            // Map common aliases
            if (pin === 'left' || pin === 'in' || pin === 'negative' || pin === 'anode') {
              effectivePin = '0';
            } else if (
              pin === 'right' ||
              pin === 'out' ||
              pin === 'positive' ||
              pin === 'cathode'
            ) {
              effectivePin = '1';
            }

            if (effectivePin === '0') {
              dx = -halfSize;
            } else if (effectivePin === '1') {
              dx = halfSize;
            } else {
              // Fallback for unknown pins or if layout engine provided specific coords?
              // For now, default to 0/1 behavior if not specified, or center if completely unknown
              // But wait, we have pin definitions in the symbol, we should use those if available!
              // However, `components` array here is `DemoComponent` which is simplified.
              // We should probably look up the original symbol if we want exact coords.
              // For now, the hardcoded +/- 30 works for Resistor/Capacitor/Inductor.
              if (!pin) {
                return { x: comp.x, y: comp.y }; // Center fallback
              }
            }

            // Apply rotation
            const rad = (comp.rotation * Math.PI) / 180;
            const rx = dx * Math.cos(rad) - dy * Math.sin(rad);
            const ry = dx * Math.sin(rad) + dy * Math.cos(rad);

            return {
              x: comp.x + rx,
              y: comp.y + ry,
            };
          };

          page.connections.forEach((conn: SchematicConnection) => {
            const showEndpointHighlights =
              config.schematic?.showEndpointHighlights ?? config.schematic?.showPinHighlights;

            // If connection has pre-calculated points from layout, use them
            if (conn.points && conn.points.length > 0) {
              drawPolyline(pageGroup, conn.points, {
                stroke: 'rgb(0,0,255)',
                strokeWidth: 1,
                fill: 'none',
              });

              if (showEndpointHighlights && conn.points.length >= 2) {
                const start = conn.points[0];
                const end = conn.points[conn.points.length - 1];
                drawPinHighlight(pageGroup, {
                  x: start.x,
                  y: start.y,
                  radius: PIN_HIGHLIGHT_RADIUS,
                  fill: PIN_HIGHLIGHT_FILL,
                  stroke: PIN_HIGHLIGHT_STROKE,
                  fillOpacity: PIN_HIGHLIGHT_FILL_OPACITY,
                  className: 'endpoint-highlight',
                });
                drawPinHighlight(pageGroup, {
                  x: end.x,
                  y: end.y,
                  radius: PIN_HIGHLIGHT_RADIUS,
                  fill: PIN_HIGHLIGHT_FILL,
                  stroke: PIN_HIGHLIGHT_STROKE,
                  fillOpacity: PIN_HIGHLIGHT_FILL_OPACITY,
                  className: 'endpoint-highlight',
                });
              }

              // Draw Net Labels if positions are available from layout
              if (conn.source.labelPosition) {
                drawText(
                  pageGroup,
                  conn.source.id,
                  conn.source.labelPosition.x,
                  conn.source.labelPosition.y,
                  {
                    fontSize: 12,
                    fill: 'rgb(255,0,0)',
                    textAnchor: 'middle',
                    dominantBaseline: 'middle',
                  }
                );
              }
              if (conn.target.labelPosition) {
                drawText(
                  pageGroup,
                  conn.target.id,
                  conn.target.labelPosition.x,
                  conn.target.labelPosition.y,
                  {
                    fontSize: 12,
                    fill: 'rgb(255,0,0)',
                    textAnchor: 'middle',
                    dominantBaseline: 'middle',
                  }
                );
              }
              return;
            }

            // For now, only draw if both ends are components with valid pins
            // If one end is a net label (isPin=false), we might skip or draw to label
            if (conn.source.isPin && conn.target.isPin) {
              const start = getPinCoord(conn.source.id, conn.source.pin);
              const end = getPinCoord(conn.target.id, conn.target.pin);

              if (start && end) {
                drawLine(pageGroup, start, end, { stroke: 'rgb(0,0,255)', strokeWidth: 1 });
                if (showEndpointHighlights) {
                  drawPinHighlight(pageGroup, {
                    x: start.x,
                    y: start.y,
                    radius: PIN_HIGHLIGHT_RADIUS,
                    fill: PIN_HIGHLIGHT_FILL,
                    stroke: PIN_HIGHLIGHT_STROKE,
                    fillOpacity: PIN_HIGHLIGHT_FILL_OPACITY,
                    className: 'endpoint-highlight',
                  });
                  drawPinHighlight(pageGroup, {
                    x: end.x,
                    y: end.y,
                    radius: PIN_HIGHLIGHT_RADIUS,
                    fill: PIN_HIGHLIGHT_FILL,
                    stroke: PIN_HIGHLIGHT_STROKE,
                    fillOpacity: PIN_HIGHLIGHT_FILL_OPACITY,
                    className: 'endpoint-highlight',
                  });
                }
              }
            } else if (!conn.source.isPin && conn.target.isPin) {
              // Source is net label, Target is component pin
              // Draw a stub and label
              const end = getPinCoord(conn.target.id, conn.target.pin);
              if (end) {
                // Determine direction based on pin? For now just go left or up?
                // A simple heuristic: extend in direction of pin normal
                // But we don't know pin normal easily without checking pin number again.
                // Let's just draw a small text at the pin location for the Net Name
                drawText(pageGroup, conn.source.id, end.x, end.y - 10, {
                  fontSize: 10,
                  fill: 'rgb(255,0,0)',
                  textAnchor: 'middle',
                });
              }
            } else if (conn.source.isPin && !conn.target.isPin) {
              // Source is component pin, Target is net label
              const start = getPinCoord(conn.source.id, conn.source.pin);
              if (start) {
                drawText(pageGroup, conn.target.id, start.x, start.y - 10, {
                  fontSize: 10,
                  fill: 'rgb(255,0,0)',
                  textAnchor: 'middle',
                });
              }
            }
          });

          // Draw Pin Highlights (Debug / Feature)
          if (config.schematic?.showPinHighlights) {
            page.symbols.forEach((sym) => {
              if (sym.electrical?.pins && Array.isArray(sym.electrical.pins)) {
                sym.electrical.pins.forEach((pin: any) => {
                  drawPinHighlight(pageGroup, {
                    x: pin.x,
                    y: pin.y,
                    radius: PIN_HIGHLIGHT_RADIUS,
                    fill: PIN_HIGHLIGHT_FILL,
                    stroke: PIN_HIGHLIGHT_STROKE,
                    fillOpacity: PIN_HIGHLIGHT_FILL_OPACITY,
                    className: 'pin-highlight',
                  });

                  // Optional: Draw pin ID for debugging
                  /*
                        drawText(pageGroup, pin.id, pin.x, pin.y - 5, {
                            fontSize: 8,
                            fill: 'black',
                            textAnchor: 'middle'
                        });
                        */
                });
              }
            });
          }
        }
      }
    }
  }

  // Setup ViewPort
  try {
    // @ts-ignore: getBBox is missing in some d3 types or dom types in test env
    const bounds = g.node().getBBox();
    const config = data.config as SchematicConfig;
    setupViewPortForSVG(svg as unknown as any, config.schematic?.padding ?? 10, 'schematic', false);
    svg.attr(
      'viewBox',
      `${bounds.x - 10} ${bounds.y - 10} ${bounds.width + 20} ${bounds.height + 20}`
    );
  } catch {
    log.warn('Could not calculate BBox for schematic');
  }
};

export default { draw };
