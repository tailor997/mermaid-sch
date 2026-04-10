import type { D3Element } from '../../../types.js';
import { log } from '../../../logger.js';
import { drawText } from '../elements/index.js';
import type { ComponentProps } from './types.js';
import { applyTransform } from './utils.js';

export interface SvgSymbolProps extends ComponentProps {
  svgContent: string;
  pins?: Record<string, { x: number; y: number }>;
}

/**
 * SVG Symbol Cache to avoid repeated fetches
 */
const svgCache = new Map<string, string>();

/**
 * Load SVG content from URL or cache
 */
export const loadSvg = async (url: string): Promise<string> => {
  if (svgCache.has(url)) {
    return svgCache.get(url)!;
  }

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to load SVG: ${url}`);
    }
    const content = await response.text();
    svgCache.set(url, content);
    return content;
  } catch (error) {
    log.error('Error loading SVG:', error);
    return '';
  }
};

/**
 * Load symbol library index
 */
export const loadSymbolIndex = async (basePath: string): Promise<SymbolIndex | null> => {
  try {
    const response = await fetch(`${basePath}/index.json`);
    if (!response.ok) {
      return null;
    }
    return (await response.json()) as SymbolIndex;
  } catch {
    return null;
  }
};

/**
 * Interface for symbol library index
 */
export interface SymbolIndex {
  version: string;
  symbols: Record<string, SymbolDefinition>;
}

/**
 * Interface for individual symbol definition
 */
export interface SymbolDefinition {
  category: string;
  name: string;
  file: string;
  description?: string;
  pins: Record<string, PinDefinition>;
  bbox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  defaults?: {
    rotation?: number;
    labelPosition?: 'above' | 'below' | 'left' | 'right';
  };
}

/**
 * Interface for pin definition
 */
export interface PinDefinition {
  id: string;
  name: string;
  x: number;
  y: number;
  type?: string;
}

/**
 * Extract pin positions from SVG content
 * Looks for elements with data-pin-id attribute
 */
export const extractPinPositions = (
  svgContent: string,
  transform?: { x: number; y: number; rotation: number }
): Record<string, { x: number; y: number }> => {
  const pins: Record<string, { x: number; y: number }> = {};

  // Parse SVG content to find pin markers
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgContent, 'image/svg+xml');

  // Find all elements with data-pin-id
  const pinElements = doc.querySelectorAll('[data-pin-id]');
  pinElements.forEach((el) => {
    const pinId = el.getAttribute('data-pin-id');
    if (!pinId) {
      return;
    }

    // Get x, y from element attributes
    let x = 0,
      y = 0;

    if (el instanceof SVGLineElement) {
      // For lines, use the endpoint (x2, y2) as the pin position
      x = parseFloat(el.getAttribute('x2') ?? '0');
      y = parseFloat(el.getAttribute('y2') ?? '0');
    } else if (el instanceof SVGCircleElement) {
      x = parseFloat(el.getAttribute('cx') ?? '0');
      y = parseFloat(el.getAttribute('cy') ?? '0');
    } else {
      // Try to get from bbox
      const rect = (el as SVGGraphicsElement).getBBox?.();
      if (rect) {
        x = rect.x + rect.width / 2;
        y = rect.y + rect.height / 2;
      }
    }

    // Apply transform if provided
    if (transform) {
      const rad = (transform.rotation * Math.PI) / 180;
      const rx = x * Math.cos(rad) - y * Math.sin(rad);
      const ry = x * Math.sin(rad) + y * Math.cos(rad);
      pins[pinId] = {
        x: transform.x + rx,
        y: transform.y + ry,
      };
    } else {
      pins[pinId] = { x, y };
    }
  });

  return pins;
};

/**
 * Draw an SVG symbol
 *
 * @param parent - D3 parent element
 * @param props - Component properties including SVG content
 * @returns Object containing the group element and pin positions
 */
export const drawSvgSymbol = (
  parent: D3Element,
  props: SvgSymbolProps
): { group: D3Element; pins: Record<string, { x: number; y: number }> } => {
  const { x, y, rotation = 0, label, name, svgContent, pins: predefinedPins } = props;

  // Create group with transform
  const group = parent
    .append('g')
    .attr('class', 'component svg-symbol')
    .attr('data-component-name', name ?? '');

  applyTransform(group, x, y, rotation);

  // Insert SVG content
  // Extract inner content from SVG (remove svg tag wrapper)
  const innerContent = svgContent
    .replace(/<\?xml[^?]*\?>/gi, '')
    .replace(/<svg[^>]*>/i, '')
    .replace(/<\/svg>/i, '');

  // Use D3 to insert the content
  group.html(innerContent);

  // Extract or use predefined pin positions
  const pins = predefinedPins ?? extractPinPositions(svgContent);

  // Transform pins to absolute coordinates
  const transformedPins: Record<string, { x: number; y: number }> = {};
  const rad = (rotation * Math.PI) / 180;

  Object.entries(pins).forEach(([pinId, pos]) => {
    const rx = pos.x * Math.cos(rad) - pos.y * Math.sin(rad);
    const ry = pos.x * Math.sin(rad) + pos.y * Math.cos(rad);
    transformedPins[pinId] = {
      x: x + rx,
      y: y + ry,
    };
  });

  // Draw name and label
  if (name) {
    drawText(group, name, 0, -18, {
      textAnchor: 'middle',
      fontSize: 10,
      className: 'symbol-name',
    });
  }

  if (label) {
    drawText(group, label, 0, 28, {
      textAnchor: 'middle',
      fontSize: 10,
      className: 'symbol-value',
    });
  }

  return { group, pins: transformedPins };
};

/**
 * Symbol Library Manager
 */
export class SymbolLibrary {
  private basePath: string;
  private index: SymbolIndex | null = null;
  private cache = new Map<string, SymbolDefinition>();

  constructor(basePath = './symbols') {
    this.basePath = basePath;
  }

  /**
   * Initialize library by loading index
   */
  async init(): Promise<void> {
    log.info(`[SymbolLibrary] Initializing with basePath: ${this.basePath}`);
    this.index = await loadSymbolIndex(this.basePath);
    if (this.index) {
      log.info(`[SymbolLibrary] Loaded ${Object.keys(this.index.symbols).length} symbols`);
    } else {
      log.error(`[SymbolLibrary] Failed to load index from ${this.basePath}/index.json`);
    }
  }

  /**
   * Get symbol definition
   */
  getSymbol(id: string): SymbolDefinition | null {
    return this.index?.symbols[id] ?? null;
  }

  /**
   * Load and draw a symbol
   */
  async drawSymbol(
    parent: D3Element,
    symbolId: string,
    props: Omit<ComponentProps, 'svgContent'>
  ): Promise<{ group: D3Element; pins: Record<string, { x: number; y: number }> } | null> {
    const symbol = this.getSymbol(symbolId);
    if (!symbol) {
      log.warn(`Symbol not found: ${symbolId}`);
      return null;
    }

    const svgUrl = `${this.basePath}/${symbol.file}`;
    const svgContent = await loadSvg(svgUrl);

    if (!svgContent) {
      return null;
    }

    // Use predefined pins from index if available
    const predefinedPins = symbol.pins
      ? Object.fromEntries(Object.entries(symbol.pins).map(([k, v]) => [k, { x: v.x, y: v.y }]))
      : undefined;

    return drawSvgSymbol(parent, {
      ...props,
      svgContent,
      pins: predefinedPins,
    });
  }
}

export default {
  drawSvgSymbol,
  loadSvg,
  loadSymbolIndex,
  extractPinPositions,
  SymbolLibrary,
};
