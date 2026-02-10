import ELK from 'elkjs/lib/elk.bundled.js';
import type { ElkNode, ElkPort, ElkPrimitiveEdge } from 'elkjs';
import type { SchematicDB, SchematicPage } from './schematicDb.js';
import { log } from '../../logger.js';
import type { MermaidConfig } from '../../config.type.js';

import { COMPONENT_SIZE, STANDARD_PINS } from './components/constants.js';

export interface SchematicConfig extends MermaidConfig {
  schematic?: {
    padding?: number;
    nodeSpacing?: number;
    rankSpacing?: number;
    direction?: 'RIGHT' | 'LEFT' | 'DOWN' | 'UP';
    engine?: 'elk';
    showPinHighlights?: boolean;
    dumpLayout?: boolean;
  };
}

export interface LayoutReport {
  nodesCount: number;
  edgesCount: number;
  layoutTimeMs: number;
  width: number;
  height: number;
  crossings?: number; // Approximate or from ELK metadata if available
}

const getElk = () => {
  try {
    return new ELK();
  } catch (e) {
    log.error('Failed to initialize ELK', e);
    return null;
  }
};

export const layoutSchematic = async (
  db: SchematicDB,
  config: SchematicConfig
): Promise<LayoutReport> => {
  const elk = getElk();
  if (!elk) {
    log.warn('Schematic: ELK is not available, skipping layout');
    return {
      nodesCount: 0,
      edgesCount: 0,
      layoutTimeMs: 0,
      width: 0,
      height: 0,
    };
  }

  const startTime = Date.now();
  log.info('Schematic: Running ELK layout');
  const data = db.getData();
  const schematicData = data.schematicData;

  let totalNodes = 0;
  let totalEdges = 0;
  let maxWidth = 0;
  let maxHeight = 0;

  // We layout each page independently
  for (const page of schematicData.pages) {
    const report = await layoutPage(page, config, elk);
    totalNodes += report.nodesCount;
    totalEdges += report.edgesCount;
    maxWidth = Math.max(maxWidth, report.width);
    maxHeight = Math.max(maxHeight, report.height);
  }

  const duration = Date.now() - startTime;
  log.info(
    `Schematic Layout completed in ${duration}ms. Nodes: ${totalNodes}, Edges: ${totalEdges}`
  );

  return {
    nodesCount: totalNodes,
    edgesCount: totalEdges,
    layoutTimeMs: duration,
    width: maxWidth,
    height: maxHeight,
  };
};

const layoutPage = async (
  page: SchematicPage,
  config: SchematicConfig,
  elk: ELK
): Promise<LayoutReport> => {
  const nodeSpacing = config.schematic?.nodeSpacing ?? 50;
  const rankSpacing = config.schematic?.rankSpacing ?? 50;
  const direction = config.schematic?.direction ?? 'RIGHT';
  const nodesCount = page.symbols.length;

  // Optimization for large graphs
  const isLarge = nodesCount > 100;
  const algorithm = 'layered';

  const layoutOptions: Record<string, string> = {
    'elk.algorithm': algorithm,
    'elk.direction': direction,
    'elk.spacing.nodeNode': String(nodeSpacing),
    'elk.layered.spacing.nodeNodeBetweenLayers': String(nodeSpacing),
    'elk.layered.spacing.edgeNodeBetweenLayers': String(rankSpacing),
    'elk.edgeRouting': 'ORTHOGONAL',
    'elk.layered.nodePlacement.strategy': 'NETWORK_SIMPLEX',
    // Improve electrical flow appearance
    'elk.layered.mergeEdges': 'true',
    'elk.portConstraints': 'FIXED_POS',
  };

  if (isLarge) {
    // Tune for performance
    layoutOptions['elk.layered.crossingMinimization.strategy'] = 'INTERACTIVE'; // Faster than LAYER_SWEEP sometimes? Or simpler?
    // Actually default is usually fine, maybe disable complex routing features
    // layoutOptions['elk.edgeRouting'] = 'POLYLINE'; // Faster than ORTHOGONAL?
  }

  const elkGraph: ElkNode = {
    id: `root-${page.id}`,
    layoutOptions,
    children: [],
    edges: [],
  };

  // Map Symbols to ELK Nodes
  page.symbols.forEach((sym) => {
    // Ensure ID uniqueness for safety (though DB should handle this)
    // For components like resistors, capacitors, etc., they are standard nodes.
    // Future expansion: sub-circuits or composite components might need recursion.

    // Inject default pins if missing for known components
    if (
      (!sym.pinGroups || sym.pinGroups.length === 0) &&
      ['resistor', 'capacitor', 'inductor', 'diode', 'battery'].includes(sym.name.toLowerCase())
    ) {
      sym.pinGroups = [
        {
          pins: STANDARD_PINS.TWO_TERMINAL.map((p) => ({
            id: p.id,
            x: p.x,
            y: p.y,
          })),
        },
      ];
    }

    const width = sym.width ?? COMPONENT_SIZE;
    const height = sym.height ?? COMPONENT_SIZE;

    const elkNode: ElkNode = {
      id: sym.id,
      width,
      height,
      ports: [],
      layoutOptions: {
        'elk.portConstraints': 'FIXED_POS',
      },
    };

    if (sym.pinGroups) {
      sym.pinGroups.forEach((group) => {
        group.pins.forEach((pin) => {
          // Pin coordinates (pin.x, pin.y) are relative to the symbol center (0,0)
          // ELK Node coordinates are typically top-left based (if ports are children)
          // However, we are setting ports on the node.
          // ELK expects port positions relative to the node's origin (top-left).

          const rotation = (sym.electrical?.rotation as number) ?? 0;
          // Rotate pin.x, pin.y around 0,0
          const rad = (rotation * Math.PI) / 180;
          const rx = pin.x * Math.cos(rad) - pin.y * Math.sin(rad);
          const ry = pin.x * Math.sin(rad) + pin.y * Math.cos(rad);

          // Assuming width/height are 60x60
          // Center is width/2, height/2.

          const portX = rx + width / 2;
          const portY = ry + height / 2;

          const elkPort: ElkPort = {
            id: `${sym.id}:${pin.id}`,
            width: 0,
            height: 0,
            x: portX,
            y: portY,
            layoutOptions: {
              'elk.port.side': getPortSide(rx, ry),
              // Ensure ports are treated as fixed connection points
              'elk.port.borderOffset': '0',
            },
          };
          elkNode.ports?.push(elkPort);
        });
      });
    }

    elkGraph.children?.push(elkNode);
  });

  // Handle Title Block and Page Setting as independent nodes if needed for layout
  // Currently they are drawn absolute, but if we wanted them to participate in layout:
  // We would add them here. However, typically title blocks are fixed frame elements.
  // We'll skip them for auto-layout to avoid them being moved around randomly.

  // Identify Net Labels (nodes that are referenced in connections but not in symbols list)
  const symbolIds = new Set(page.symbols.map((s) => s.id));
  const netLabels = new Set<string>();

  page.connections.forEach((conn) => {
    if (!conn.source.isPin && !symbolIds.has(conn.source.id)) {
      netLabels.add(conn.source.id);
    }
    if (!conn.target.isPin && !symbolIds.has(conn.target.id)) {
      netLabels.add(conn.target.id);
    }
  });

  // Add Net Labels as small nodes
  netLabels.forEach((labelId) => {
    const elkNode: ElkNode = {
      id: labelId,
      width: 40, // Small width for label
      height: 20, // Small height for label
      labels: [{ text: labelId }],
      layoutOptions: {
        'elk.portConstraints': 'FIXED_POS',
      },
    };
    elkGraph.children?.push(elkNode);
  });

  // Map Connections to ELK Edges
  page.connections.forEach((conn) => {
    const edge: ElkPrimitiveEdge = {
      id: conn.id,
      sources: [],
      targets: [],
    };

    if (conn.source.isPin && conn.source.pin) {
      edge.sources.push(conn.source.id);
      (edge as any).sourcePorts = [`${conn.source.id}:${conn.source.pin}`];
    } else {
      edge.sources.push(conn.source.id);
    }

    if (conn.target.isPin && conn.target.pin) {
      edge.targets.push(conn.target.id);
      (edge as any).targetPorts = [`${conn.target.id}:${conn.target.pin}`];
    } else {
      edge.targets.push(conn.target.id);
    }

    elkGraph.edges?.push(edge);
  });

  try {
    const layoutOutput = await elk.layout(elkGraph);
    applyLayout(page, layoutOutput);

    if (config.schematic?.dumpLayout) {
      log.info(
        'Schematic Layout Dump:',
        JSON.stringify(
          {
            nodes: layoutOutput.children,
            edges: layoutOutput.edges,
            width: layoutOutput.width,
            height: layoutOutput.height,
          },
          null,
          2
        )
      );
    }

    return {
      nodesCount: page.symbols.length,
      edgesCount: page.connections.length,
      layoutTimeMs: 0, // Captured at top level
      width: layoutOutput.width ?? 0,
      height: layoutOutput.height ?? 0,
    };
  } catch (e) {
    log.error('Schematic: ELK Layout failed', e);
    return { nodesCount: 0, edgesCount: 0, layoutTimeMs: 0, width: 0, height: 0 };
  }
};

const getPortSide = (x: number, y: number): string => {
  if (Math.abs(x) > Math.abs(y)) {
    return x > 0 ? 'EAST' : 'WEST';
  } else {
    return y > 0 ? 'SOUTH' : 'NORTH';
  }
};

const applyLayout = (page: SchematicPage, graph: ElkNode) => {
  const symbolIds = new Set(page.symbols.map((s) => s.id));

  // Update symbols
  graph.children?.forEach((child) => {
    if (symbolIds.has(child.id)) {
      const sym = page.symbols.find((s) => s.id === child.id);
      if (sym) {
        if (!sym.electrical) {
          sym.electrical = {};
        }

        const width = child.width ?? 60;
        const height = child.height ?? 60;

        sym.electrical.x = (child.x ?? 0) + width / 2;
        sym.electrical.y = (child.y ?? 0) + height / 2;

        // Save absolute pin positions from ELK layout
        if (child.ports) {
          sym.electrical.pins = child.ports.map((p) => {
            // Extract pin ID from "symId:pinId"
            // We assume the format we created earlier
            const pinIdPart = p.id?.substring(child.id.length + 1) ?? '';

            // Check for deviation (Debug)
            // We can't easily check against original requested X/Y here without recalculating or storing it map
            // But we can trust ELK returned what it used.

            return {
              id: pinIdPart,
              x: (child.x ?? 0) + (p.x ?? 0),
              y: (child.y ?? 0) + (p.y ?? 0),
            };
          });
        }
      }
    } else {
      // This is a Net Label node (not a symbol)
      const labelId = child.id;
      const width = child.width ?? 40;
      const height = child.height ?? 20;
      const centerX = (child.x ?? 0) + width / 2;
      const centerY = (child.y ?? 0) + height / 2;

      // Update connections that reference this label
      page.connections.forEach((conn) => {
        if (conn.source.id === labelId && !conn.source.isPin) {
          conn.source.labelPosition = { x: centerX, y: centerY };
        }
        if (conn.target.id === labelId && !conn.target.isPin) {
          conn.target.labelPosition = { x: centerX, y: centerY };
        }
      });
    }
  });

  // Update connections
  graph.edges?.forEach((edge) => {
    const conn = page.connections.find((c) => c.id === edge.id);
    if (conn && edge.sections && edge.sections.length > 0) {
      const points: { x: number; y: number }[] = [];

      edge.sections.forEach((section) => {
        // Start Point
        points.push({ x: section.startPoint.x, y: section.startPoint.y });

        // Bend Points
        if (section.bendPoints) {
          section.bendPoints.forEach((bp) => points.push({ x: bp.x, y: bp.y }));
        }

        // End Point
        points.push({ x: section.endPoint.x, y: section.endPoint.y });
      });

      // Filter out duplicate consecutive points (which happens where sections join)
      const uniquePoints: { x: number; y: number }[] = [];
      if (points.length > 0) {
        uniquePoints.push(points[0]);
        for (let i = 1; i < points.length; i++) {
          const prev = uniquePoints[uniquePoints.length - 1];
          const curr = points[i];
          if (Math.abs(prev.x - curr.x) > 0.1 || Math.abs(prev.y - curr.y) > 0.1) {
            uniquePoints.push(curr);
          }
        }
      }

      conn.points = uniquePoints;
    }
  });
};
