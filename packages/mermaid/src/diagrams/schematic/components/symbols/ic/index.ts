/**
 * IC Package Symbols - Index
 *
 * This module provides dynamically generated IC package SVG symbols
 * for use in schematic diagrams.
 *
 * Usage:
 * ```typescript
 * import { generateDualSidePackage, generateQuadPackage, PACKAGE_PRESETS } from './ic/index.js';
 *
 * // Generate a custom SOP16 package
 * const sop16 = generateDualSidePackage({ type: 'sop', pinsPerSide: 8 });
 *
 * // Generate a custom QFN64 package
 * const qfn64 = generateQuadPackage({ type: 'qfn', pinsPerSide: 16 });
 *
 * // Use preset packages
 * const ssop20 = PACKAGE_PRESETS.SSOP20();
 * ```
 */
// cspell:ignore ssop,lqfp

export {
  generateDualSidePackage,
  generateQuadPackage,
  generateDualSideSymbolDefinition,
  generateQuadSymbolDefinition,
  PACKAGE_PRESETS,
  getPresetPackage,
  listPresetPackages,
} from './icPackageGenerator.js';

export type { PackageType, PackageConfig } from './icPackageGenerator.js';
