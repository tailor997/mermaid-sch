/**
 * IC Package SVG Generator
 *
 * Generates reusable, dynamically adjustable electronic component package SVGs
 * - Dual-side packages (SOP/SSOP): Supports 2xN pin configuration
 * - Quad packages (QFN/QFP): Supports 4xN pin configuration
 */
// cspell:ignore SSOP,TSOP,LQFP,SOIC,TSSOP,JEDEC,ssop,tsop,lqfp

import type { SymbolDefinition } from '../../svgSymbol.js';

// Package type definitions
export type PackageType = 'sop' | 'ssop' | 'tsop' | 'qfn' | 'qfp' | 'lqfp';

// Package configuration interface
export interface PackageConfig {
  /** Package type */
  type: PackageType;
  /** Number of pins per side (dual-side: pins per side; quad: pins per edge) */
  pinsPerSide: number;
  /** Pin pitch (pixels) */
  pinPitch?: number;
  /** Pin length (pixels) */
  pinLength?: number;
  /** Package body width (pixels) */
  bodyWidth?: number;
  /** Package body height/length (pixels) - optional, auto-calculated if not specified */
  bodyHeight?: number;
  /** Corner radius (pixels) */
  cornerRadius?: number;
  /** Show pin numbers */
  showPinNumbers?: boolean;
  /** Pin numbering start corner: 'tl'=top-left, 'tr'=top-right, 'bl'=bottom-left, 'br'=bottom-right */
  pinStartCorner?: 'tl' | 'tr' | 'bl' | 'br';
  /** Package orientation: 'horizontal' | 'vertical' */
  orientation?: 'horizontal' | 'vertical';
  /** Show thermal pad (for QFN-like packages) */
  showThermalPad?: boolean;
}

// Default configuration
const DEFAULT_CONFIG: Required<Omit<PackageConfig, 'type' | 'pinsPerSide' | 'bodyHeight'>> = {
  pinPitch: 10,
  pinLength: 8,
  bodyWidth: 40,
  cornerRadius: 2,
  showPinNumbers: true,
  pinStartCorner: 'tl',
  orientation: 'horizontal',
  showThermalPad: false,
};

// Package type specific default configurations
const PACKAGE_DEFAULTS: Record<PackageType, Partial<PackageConfig>> = {
  sop: { pinPitch: 12, bodyWidth: 50 },
  ssop: { pinPitch: 8, bodyWidth: 40 },
  tsop: { pinPitch: 6, bodyWidth: 35 },
  qfn: { pinPitch: 8, bodyWidth: 60, pinLength: 6, showThermalPad: true },
  qfp: { pinPitch: 10, bodyWidth: 70, pinLength: 10 },
  lqfp: { pinPitch: 10, bodyWidth: 70, pinLength: 10 },
};

/**
 * Merge configurations
 */
function mergeConfig(config: PackageConfig): Required<PackageConfig> {
  const typeDefaults = PACKAGE_DEFAULTS[config.type] ?? {};
  return {
    ...DEFAULT_CONFIG,
    ...typeDefaults,
    ...config,
    bodyHeight:
      config.bodyHeight ?? config.pinsPerSide * (config.pinPitch ?? DEFAULT_CONFIG.pinPitch),
  } as Required<PackageConfig>;
}

/**
 * Generate pin numbers following JEDEC standard
 * Pin numbering typically starts from top-left and goes counter-clockwise
 */
function generatePinNumbers(
  pinsPerSide: number,
  pinStartCorner: 'tl' | 'tr' | 'bl' | 'br',
  isDualSide: boolean
): { left: number[]; right: number[]; top?: number[]; bottom?: number[] } {
  const totalPins = isDualSide ? pinsPerSide * 2 : pinsPerSide * 4;

  if (isDualSide) {
    const leftPins: number[] = [];
    const rightPins: number[] = [];

    if (pinStartCorner === 'tl') {
      for (let i = 0; i < pinsPerSide; i++) {
        leftPins.push(i + 1);
        rightPins.push(totalPins - i);
      }
    } else if (pinStartCorner === 'tr') {
      for (let i = 0; i < pinsPerSide; i++) {
        rightPins.push(i + 1);
        leftPins.push(totalPins - i);
      }
    } else if (pinStartCorner === 'bl') {
      for (let i = 0; i < pinsPerSide; i++) {
        leftPins.push(pinsPerSide - i);
        rightPins.push(pinsPerSide + i + 1);
      }
    } else {
      for (let i = 0; i < pinsPerSide; i++) {
        rightPins.push(pinsPerSide - i);
        leftPins.push(pinsPerSide + i + 1);
      }
    }

    return { left: leftPins, right: rightPins };
  } else {
    const topPins: number[] = [];
    const rightPins: number[] = [];
    const bottomPins: number[] = [];
    const leftPins: number[] = [];

    let currentPin = 1;

    if (pinStartCorner === 'tl') {
      for (let i = 0; i < pinsPerSide; i++) {
        topPins.push(currentPin++);
      }
      for (let i = 0; i < pinsPerSide; i++) {
        rightPins.push(currentPin++);
      }
      for (let i = pinsPerSide - 1; i >= 0; i--) {
        bottomPins.push(currentPin++);
      }
      for (let i = pinsPerSide - 1; i >= 0; i--) {
        leftPins.push(currentPin++);
      }
    } else if (pinStartCorner === 'tr') {
      for (let i = pinsPerSide - 1; i >= 0; i--) {
        topPins.push(currentPin++);
      }
      for (let i = 0; i < pinsPerSide; i++) {
        leftPins.push(currentPin++);
      }
      for (let i = 0; i < pinsPerSide; i++) {
        bottomPins.push(currentPin++);
      }
      for (let i = pinsPerSide - 1; i >= 0; i--) {
        rightPins.push(currentPin++);
      }
    } else if (pinStartCorner === 'bl') {
      for (let i = pinsPerSide - 1; i >= 0; i--) {
        leftPins.push(currentPin++);
      }
      for (let i = 0; i < pinsPerSide; i++) {
        bottomPins.push(currentPin++);
      }
      for (let i = 0; i < pinsPerSide; i++) {
        rightPins.push(currentPin++);
      }
      for (let i = pinsPerSide - 1; i >= 0; i--) {
        topPins.push(currentPin++);
      }
    } else {
      for (let i = 0; i < pinsPerSide; i++) {
        bottomPins.push(currentPin++);
      }
      for (let i = pinsPerSide - 1; i >= 0; i--) {
        rightPins.push(currentPin++);
      }
      for (let i = pinsPerSide - 1; i >= 0; i--) {
        topPins.push(currentPin++);
      }
      for (let i = 0; i < pinsPerSide; i++) {
        leftPins.push(currentPin++);
      }
    }

    return { left: leftPins, right: rightPins, top: topPins, bottom: bottomPins };
  }
}

/**
 * Generate dual-side package SVG (SOP, SSOP, TSOP, etc.)
 * Default: 2x8 pins (16-pin), can be adjusted to 2x5, 2x10, etc.
 */
export function generateDualSidePackage(config: PackageConfig): {
  svg: string;
  pins: Record<string, { x: number; y: number; name: string; type: string }>;
  bbox: { x: number; y: number; width: number; height: number };
} {
  const cfg = mergeConfig(config);
  const pinNumbers = generatePinNumbers(cfg.pinsPerSide, cfg.pinStartCorner, true);

  const halfBodyWidth = cfg.bodyWidth / 2;
  const halfBodyHeight = cfg.bodyHeight / 2;
  const totalWidth = cfg.bodyWidth + cfg.pinLength * 2;
  const totalHeight = cfg.bodyHeight;

  // Calculate viewBox
  const viewBoxX = -totalWidth / 2 - 15;
  const viewBoxY = -totalHeight / 2 - 15;
  const viewBoxW = totalWidth + 30;
  const viewBoxH = totalHeight + 30;

  let svg = `<svg viewBox="${viewBoxX} ${viewBoxY} ${viewBoxW} ${viewBoxH}" xmlns="http://www.w3.org/2000/svg">\n`;
  svg += `  <defs>\n`;
  svg += `    <style>\n`;
  svg += `      .body { stroke: #333; stroke-width: 1.5; fill: #f5f5dc; }\n`;
  svg += `      .pin { stroke: #333; stroke-width: 1.2; }\n`;
  svg += `      .pin-number { font-family: sans-serif; font-size: 7px; fill: #666; text-anchor: middle; }\n`;
  svg += `      .pin-dot { fill: #dc3545; opacity: 0; }\n`;
  svg += `      .marker { fill: #333; }\n`;
  svg += `      .pin-name-anchor { fill: none; opacity: 0; }\n`;
  svg += `    </style>\n`;
  svg += `  </defs>\n\n`;

  // IC body
  svg += `  <!-- IC Body -->\n`;
  svg += `  <rect x="${-halfBodyWidth}" y="${-halfBodyHeight}" width="${cfg.bodyWidth}" height="${cfg.bodyHeight}" class="body" rx="${cfg.cornerRadius}"/>\n`;

  // Pin 1 marker (notch or dot)
  const markerY = -halfBodyHeight + 5;
  svg += `  <!-- Pin 1 Marker -->\n`;
  svg += `  <circle cx="${-halfBodyWidth + 8}" cy="${markerY}" r="2" class="marker"/>\n\n`;

  const pins: Record<string, { x: number; y: number; name: string; type: string }> = {};

  // Left side pins
  svg += `  <!-- Left Side Pins -->\n`;
  for (let i = 0; i < cfg.pinsPerSide; i++) {
    const pinY = -halfBodyHeight + (i + 0.5) * cfg.pinPitch;
    const pinNum = pinNumbers.left[i];
    const x1 = -halfBodyWidth - cfg.pinLength;
    const x2 = -halfBodyWidth;

    svg += `  <line x1="${x1}" y1="${pinY}" x2="${x2}" y2="${pinY}" class="pin" data-pin-id="${pinNum - 1}" data-pin-name="${pinNum}"/>\n`;
    if (cfg.showPinNumbers) {
      svg += `  <text x="${x1 - 2}" y="${pinY + 2}" class="pin-number" text-anchor="end">${pinNum}</text>\n`;
    }
    svg += `  <circle cx="${x1}" cy="${pinY}" r="2" class="pin-dot" data-pin-id="${pinNum - 1}"/>\n`;
    svg += `  <circle cx="${x1}" cy="${pinY}" r="1" class="pin-name-anchor" data-pin-name-anchor="${pinNum}"/>\n`;

    pins[(pinNum - 1).toString()] = { x: x1, y: pinY, name: pinNum.toString(), type: 'passive' };
  }

  // Right side pins
  svg += `\n  <!-- Right Side Pins -->\n`;
  for (let i = 0; i < cfg.pinsPerSide; i++) {
    const pinY = -halfBodyHeight + (i + 0.5) * cfg.pinPitch;
    const pinNum = pinNumbers.right[i];
    const x1 = halfBodyWidth;
    const x2 = halfBodyWidth + cfg.pinLength;

    svg += `  <line x1="${x1}" y1="${pinY}" x2="${x2}" y2="${pinY}" class="pin" data-pin-id="${pinNum - 1}" data-pin-name="${pinNum}"/>\n`;
    if (cfg.showPinNumbers) {
      svg += `  <text x="${x2 + 2}" y="${pinY + 2}" class="pin-number" text-anchor="start">${pinNum}</text>\n`;
    }
    svg += `  <circle cx="${x2}" cy="${pinY}" r="2" class="pin-dot" data-pin-id="${pinNum - 1}"/>\n`;
    svg += `  <circle cx="${x2}" cy="${pinY}" r="1" class="pin-name-anchor" data-pin-name-anchor="${pinNum}"/>\n`;

    pins[(pinNum - 1).toString()] = { x: x2, y: pinY, name: pinNum.toString(), type: 'passive' };
  }

  svg += `</svg>`;

  return {
    svg,
    pins,
    bbox: { x: viewBoxX, y: viewBoxY, width: viewBoxW, height: viewBoxH },
  };
}

/**
 * Generate quad package SVG (QFN, QFP, LQFP, etc.)
 * Default: 4x8 pins (32-pin), can be adjusted to 4x4, 4x16, etc.
 */
export function generateQuadPackage(config: PackageConfig): {
  svg: string;
  pins: Record<string, { x: number; y: number; name: string; type: string }>;
  bbox: { x: number; y: number; width: number; height: number };
} {
  const cfg = mergeConfig(config);
  const pinNumbers = generatePinNumbers(cfg.pinsPerSide, cfg.pinStartCorner, false);

  const halfBodyWidth = cfg.bodyWidth / 2;
  const halfBodyHeight = cfg.bodyHeight / 2;
  const totalWidth = cfg.bodyWidth + cfg.pinLength * 2;
  const totalHeight = cfg.bodyHeight + cfg.pinLength * 2;

  // Calculate viewBox
  const viewBoxX = -totalWidth / 2 - 15;
  const viewBoxY = -totalHeight / 2 - 15;
  const viewBoxW = totalWidth + 30;
  const viewBoxH = totalHeight + 30;

  let svg = `<svg viewBox="${viewBoxX} ${viewBoxY} ${viewBoxW} ${viewBoxH}" xmlns="http://www.w3.org/2000/svg">\n`;
  svg += `  <defs>\n`;
  svg += `    <style>\n`;
  svg += `      .body { stroke: #333; stroke-width: 1.5; fill: #f5f5dc; }\n`;
  svg += `      .pin { stroke: #333; stroke-width: 1.2; }\n`;
  svg += `      .pin-number { font-family: sans-serif; font-size: 7px; fill: #666; text-anchor: middle; }\n`;
  svg += `      .pin-dot { fill: #dc3545; opacity: 0; }\n`;
  svg += `      .marker { fill: #333; }\n`;
  svg += `      .thermal-pad { stroke: #333; stroke-width: 1; fill: #e0e0e0; }\n`;
  svg += `      .pin-name-anchor { fill: none; opacity: 0; }\n`;
  svg += `    </style>\n`;
  svg += `  </defs>\n\n`;

  // IC body
  svg += `  <!-- IC Body -->\n`;
  svg += `  <rect x="${-halfBodyWidth}" y="${-halfBodyHeight}" width="${cfg.bodyWidth}" height="${cfg.bodyHeight}" class="body" rx="${cfg.cornerRadius}"/>\n`;

  // Thermal pad for QFN (center pad)
  if (cfg.showThermalPad) {
    const thermalSize = Math.min(cfg.bodyWidth, cfg.bodyHeight) * 0.4;
    svg += `  <!-- Thermal Pad -->\n`;
    svg += `  <rect x="${-thermalSize / 2}" y="${-thermalSize / 2}" width="${thermalSize}" height="${thermalSize}" class="thermal-pad"/>\n`;
  }

  // Pin 1 marker
  const markerY = -halfBodyHeight + 5;
  svg += `  <!-- Pin 1 Marker -->\n`;
  svg += `  <circle cx="${-halfBodyWidth + 8}" cy="${markerY}" r="2" class="marker"/>\n\n`;

  const pins: Record<string, { x: number; y: number; name: string; type: string }> = {};

  // Top side pins
  svg += `  <!-- Top Side Pins -->\n`;
  for (let i = 0; i < cfg.pinsPerSide; i++) {
    const pinX = -halfBodyWidth + (i + 0.5) * cfg.pinPitch;
    const pinNum = pinNumbers.top![i];
    const y1 = -halfBodyHeight - cfg.pinLength;
    const y2 = -halfBodyHeight;

    svg += `  <line x1="${pinX}" y1="${y1}" x2="${pinX}" y2="${y2}" class="pin" data-pin-id="${pinNum - 1}" data-pin-name="${pinNum}"/>\n`;
    if (cfg.showPinNumbers) {
      svg += `  <text x="${pinX}" y="${y1 - 3}" class="pin-number">${pinNum}</text>\n`;
    }
    svg += `  <circle cx="${pinX}" cy="${y1}" r="2" class="pin-dot" data-pin-id="${pinNum - 1}"/>\n`;
    svg += `  <circle cx="${pinX}" cy="${y1}" r="1" class="pin-name-anchor" data-pin-name-anchor="${pinNum}"/>\n`;

    pins[(pinNum - 1).toString()] = { x: pinX, y: y1, name: pinNum.toString(), type: 'passive' };
  }

  // Right side pins
  svg += `\n  <!-- Right Side Pins -->\n`;
  for (let i = 0; i < cfg.pinsPerSide; i++) {
    const pinY = -halfBodyHeight + (i + 0.5) * cfg.pinPitch;
    const pinNum = pinNumbers.right[i];
    const x1 = halfBodyWidth;
    const x2 = halfBodyWidth + cfg.pinLength;

    svg += `  <line x1="${x1}" y1="${pinY}" x2="${x2}" y2="${pinY}" class="pin" data-pin-id="${pinNum - 1}" data-pin-name="${pinNum}"/>\n`;
    if (cfg.showPinNumbers) {
      svg += `  <text x="${x2 + 2}" y="${pinY + 2}" class="pin-number" text-anchor="start">${pinNum}</text>\n`;
    }
    svg += `  <circle cx="${x2}" cy="${pinY}" r="2" class="pin-dot" data-pin-id="${pinNum - 1}"/>\n`;
    svg += `  <circle cx="${x2}" cy="${pinY}" r="1" class="pin-name-anchor" data-pin-name-anchor="${pinNum}"/>\n`;

    pins[(pinNum - 1).toString()] = { x: x2, y: pinY, name: pinNum.toString(), type: 'passive' };
  }

  // Bottom side pins
  svg += `\n  <!-- Bottom Side Pins -->\n`;
  for (let i = 0; i < cfg.pinsPerSide; i++) {
    const pinX = halfBodyWidth - (i + 0.5) * cfg.pinPitch;
    const pinNum = pinNumbers.bottom![i];
    const y1 = halfBodyHeight;
    const y2 = halfBodyHeight + cfg.pinLength;

    svg += `  <line x1="${pinX}" y1="${y1}" x2="${pinX}" y2="${y2}" class="pin" data-pin-id="${pinNum - 1}" data-pin-name="${pinNum}"/>\n`;
    if (cfg.showPinNumbers) {
      svg += `  <text x="${pinX}" y="${y2 + 8}" class="pin-number">${pinNum}</text>\n`;
    }
    svg += `  <circle cx="${pinX}" cy="${y2}" r="2" class="pin-dot" data-pin-id="${pinNum - 1}"/>\n`;
    svg += `  <circle cx="${pinX}" cy="${y2}" r="1" class="pin-name-anchor" data-pin-name-anchor="${pinNum}"/>\n`;

    pins[(pinNum - 1).toString()] = { x: pinX, y: y2, name: pinNum.toString(), type: 'passive' };
  }

  // Left side pins
  svg += `\n  <!-- Left Side Pins -->\n`;
  for (let i = 0; i < cfg.pinsPerSide; i++) {
    const pinY = halfBodyHeight - (i + 0.5) * cfg.pinPitch;
    const pinNum = pinNumbers.left[i];
    const x1 = -halfBodyWidth - cfg.pinLength;
    const x2 = -halfBodyWidth;

    svg += `  <line x1="${x1}" y1="${pinY}" x2="${x2}" y2="${pinY}" class="pin" data-pin-id="${pinNum - 1}" data-pin-name="${pinNum}"/>\n`;
    if (cfg.showPinNumbers) {
      svg += `  <text x="${x1 - 2}" y="${pinY + 2}" class="pin-number" text-anchor="end">${pinNum}</text>\n`;
    }
    svg += `  <circle cx="${x1}" cy="${pinY}" r="2" class="pin-dot" data-pin-id="${pinNum - 1}"/>\n`;
    svg += `  <circle cx="${x1}" cy="${pinY}" r="1" class="pin-name-anchor" data-pin-name-anchor="${pinNum}"/>\n`;

    pins[(pinNum - 1).toString()] = { x: x1, y: pinY, name: pinNum.toString(), type: 'passive' };
  }

  svg += `</svg>`;

  return {
    svg,
    pins,
    bbox: { x: viewBoxX, y: viewBoxY, width: viewBoxW, height: viewBoxH },
  };
}

/**
 * Generate a generic 4xN quad package that can be used for QFN, QFP, LQFP with same pin count
 * This is useful for creating a single prototype that works for multiple package types
 */
export function generateQuad64Prototype(variant: 'qfn' | 'qfp' | 'lqfp' = 'qfp'): {
  svg: string;
  pins: Record<string, { x: number; y: number; name: string; type: string }>;
  bbox: { x: number; y: number; width: number; height: number };
} {
  const baseConfig: PackageConfig = {
    type: variant,
    pinsPerSide: 16,
  };

  // Generate base package
  const result = generateQuadPackage(baseConfig);

  // Add prototype metadata as SVG comment
  const prototypeComment = `<!-- QUAD64_PROTOTYPE variant="${variant}" pinsPerSide=16 totalPins=64 -->\n`;
  result.svg = result.svg.replace('<svg ', `${prototypeComment}<svg `);

  return result;
}

/**
 * Generate SymbolDefinition for dual-side package
 * Suitable for use in symbol library index.json
 */
export function generateDualSideSymbolDefinition(
  id: string,
  name: string,
  config: PackageConfig
): SymbolDefinition & { svg: string } {
  const { svg, pins, bbox } = generateDualSidePackage(config);

  return {
    category: 'ic',
    name,
    file: `ic/${id}.svg`,
    description: `${config.type.toUpperCase()} ${config.pinsPerSide * 2}-pin package`,
    pins: Object.fromEntries(
      Object.entries(pins).map(([k, v]) => [
        k,
        { id: k, name: v.name, x: v.x, y: v.y, type: v.type },
      ])
    ),
    bbox,
    defaults: { rotation: 0, labelPosition: 'below' },
    svg,
  };
}

/**
 * Generate SymbolDefinition for quad package
 * Suitable for use in symbol library index.json
 */
export function generateQuadSymbolDefinition(
  id: string,
  name: string,
  config: PackageConfig
): SymbolDefinition & { svg: string } {
  const { svg, pins, bbox } = generateQuadPackage(config);

  return {
    category: 'ic',
    name,
    file: `ic/${id}.svg`,
    description: `${config.type.toUpperCase()} ${config.pinsPerSide * 4}-pin package`,
    pins: Object.fromEntries(
      Object.entries(pins).map(([k, v]) => [
        k,
        { id: k, name: v.name, x: v.x, y: v.y, type: v.type },
      ])
    ),
    bbox,
    defaults: { rotation: 0, labelPosition: 'below' },
    svg,
  };
}

// Preset configurations for common packages
export const PACKAGE_PRESETS = {
  // Dual-side packages
  SOP8: () => generateDualSidePackage({ type: 'sop', pinsPerSide: 4 }),
  SOP16: () => generateDualSidePackage({ type: 'sop', pinsPerSide: 8 }),
  SOP20: () => generateDualSidePackage({ type: 'sop', pinsPerSide: 10 }),
  SOP24: () => generateDualSidePackage({ type: 'sop', pinsPerSide: 12 }),
  SOP28: () => generateDualSidePackage({ type: 'sop', pinsPerSide: 14 }),

  SSOP8: () => generateDualSidePackage({ type: 'ssop', pinsPerSide: 4 }),
  SSOP16: () => generateDualSidePackage({ type: 'ssop', pinsPerSide: 8 }),
  SSOP20: () => generateDualSidePackage({ type: 'ssop', pinsPerSide: 10 }),
  SSOP24: () => generateDualSidePackage({ type: 'ssop', pinsPerSide: 12 }),
  SSOP28: () => generateDualSidePackage({ type: 'ssop', pinsPerSide: 14 }),
  SSOP48: () => generateDualSidePackage({ type: 'ssop', pinsPerSide: 24 }),

  TSOP32: () => generateDualSidePackage({ type: 'tsop', pinsPerSide: 16 }),
  TSOP48: () => generateDualSidePackage({ type: 'tsop', pinsPerSide: 24 }),

  // Quad packages - using shared prototype concept
  QFN32: () => generateQuadPackage({ type: 'qfn', pinsPerSide: 8 }),
  QFN48: () => generateQuadPackage({ type: 'qfn', pinsPerSide: 12 }),
  QFN64: () => generateQuad64Prototype('qfn'),
  QFN88: () => generateQuadPackage({ type: 'qfn', pinsPerSide: 22 }),

  QFP32: () => generateQuadPackage({ type: 'qfp', pinsPerSide: 8 }),
  QFP48: () => generateQuadPackage({ type: 'qfp', pinsPerSide: 12 }),
  QFP64: () => generateQuad64Prototype('qfp'),
  QFP100: () => generateQuadPackage({ type: 'qfp', pinsPerSide: 25 }),
  QFP128: () => generateQuadPackage({ type: 'qfp', pinsPerSide: 32 }),

  LQFP32: () => generateQuadPackage({ type: 'lqfp', pinsPerSide: 8 }),
  LQFP48: () => generateQuadPackage({ type: 'lqfp', pinsPerSide: 12 }),
  LQFP64: () => generateQuad64Prototype('lqfp'),
  LQFP100: () => generateQuadPackage({ type: 'lqfp', pinsPerSide: 25 }),
  LQFP128: () => generateQuadPackage({ type: 'lqfp', pinsPerSide: 32 }),
  LQFP144: () => generateQuadPackage({ type: 'lqfp', pinsPerSide: 36 }),
  LQFP176: () => generateQuadPackage({ type: 'lqfp', pinsPerSide: 44 }),
};

/**
 * Get package by common name
 * Examples: 'SOP16', 'QFN64', 'LQFP100', etc.
 */
export function getPresetPackage(name: string): {
  svg: string;
  pins: Record<string, { x: number; y: number; name: string; type: string }>;
  bbox: { x: number; y: number; width: number; height: number };
} | null {
  const preset = PACKAGE_PRESETS[name as keyof typeof PACKAGE_PRESETS];
  return preset ? preset() : null;
}

/**
 * List all available preset package names
 */
export function listPresetPackages(): string[] {
  return Object.keys(PACKAGE_PRESETS);
}

export default {
  generateDualSidePackage,
  generateQuadPackage,
  generateQuad64Prototype,
  generateDualSideSymbolDefinition,
  generateQuadSymbolDefinition,
  PACKAGE_PRESETS,
  getPresetPackage,
  listPresetPackages,
};
