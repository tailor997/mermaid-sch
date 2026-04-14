/**
 * IC Package Symbols - Usage Examples
 * 
 * This file demonstrates how to use the dynamically generated IC package symbols
 * in Mermaid Schematic diagrams.
 */

import { 
  generateDualSidePackage, 
  generateQuadPackage, 
  PACKAGE_PRESETS,
  getPresetPackage,
  listPresetPackages,
  type PackageConfig 
} from './icPackageGenerator.js';

// ============================================================================
// Example 1: Using Preset Packages (Most Common Use Case)
// ============================================================================

export function example1_presetPackages() {
  // Get a preset SOP16 package
  const sop16 = PACKAGE_PRESETS.SOP16();
  console.log('SOP16 SVG length:', sop16.svg.length);
  console.log('SOP16 pin count:', Object.keys(sop16.pins).length);
  console.log('SOP16 bounding box:', sop16.bbox);

  // Get a preset QFN64 package
  const qfn64 = PACKAGE_PRESETS.QFN64();
  console.log('QFN64 SVG length:', qfn64.svg.length);
  console.log('QFN64 pin count:', Object.keys(qfn64.pins).length);

  // Get a preset SSOP20 package
  const ssop20 = PACKAGE_PRESETS.SSOP20();
  console.log('SSOP20 SVG length:', ssop20.svg.length);

  // List all available presets
  const allPresets = listPresetPackages();
  console.log('Available presets:', allPresets);

  // Get by name
  const lqfp100 = getPresetPackage('LQFP100');
  if (lqfp100) {
    console.log('LQFP100 loaded successfully');
  }
}

// ============================================================================
// Example 2: Custom Dual-Side Package (SOP/SSOP style)
// ============================================================================

export function example2_customDualSidePackage() {
  // Generate a custom 2×5 pin package (10 pins total)
  const customSOP: PackageConfig = {
    type: 'sop',
    pinsPerSide: 5,           // 5 pins per side = 10 pins total
    pinPitch: 12,             // 12px spacing between pins
    pinLength: 8,             // 8px pin length
    bodyWidth: 50,            // 50px body width
    cornerRadius: 2,          // 2px corner radius
    showPinNumbers: true,     // Show pin numbers
    pinStartCorner: 'tl',     // Start numbering from top-left
  };

  const result = generateDualSidePackage(customSOP);
  
  console.log('Custom SOP10 generated:');
  console.log('- SVG length:', result.svg.length);
  console.log('- Pin positions:', Object.entries(result.pins).map(([id, pin]) => 
    `Pin ${pin.name}: (${pin.x}, ${pin.y})`
  ));
  console.log('- Bounding box:', result.bbox);

  return result;
}

// ============================================================================
// Example 3: Custom Quad Package (QFN/QFP style)
// ============================================================================

export function example3_customQuadPackage() {
  // Generate a custom 4×6 pin package (24 pins total)
  const customQFN: PackageConfig = {
    type: 'qfn',
    pinsPerSide: 6,           // 6 pins per side = 24 pins total
    pinPitch: 8,              // 8px spacing (fine pitch)
    pinLength: 6,             // 6px pin length (shorter for QFN)
    bodyWidth: 48,            // 48px body width
    cornerRadius: 2,
    showPinNumbers: true,
    pinStartCorner: 'tl',     // Start from top-left, go counter-clockwise
  };

  const result = generateQuadPackage(customQFN);
  
  console.log('Custom QFN24 generated:');
  console.log('- SVG length:', result.svg.length);
  console.log('- Pin count:', Object.keys(result.pins).length);
  console.log('- Bounding box:', result.bbox);

  return result;
}

// ============================================================================
// Example 4: Using with drawSvgSymbol
// ============================================================================

import type { D3Element } from '../../../../../types.js';
import { drawSvgSymbol } from '../../svgSymbol.js';

export function example4_drawInSchematic(parent: D3Element) {
  // Get preset package
  const { svg, pins } = PACKAGE_PRESETS.SOP16();

  // Draw the symbol
  const result = drawSvgSymbol(parent, {
    x: 100,
    y: 200,
    rotation: 0,
    name: 'U1',
    label: 'ATmega328P',
    svgContent: svg,
    pins: Object.fromEntries(
      Object.entries(pins).map(([k, v]) => [k, { x: v.x, y: v.y }])
    ),
  });

  console.log('Symbol drawn at position:', result.pins);
  return result;
}

// ============================================================================
// Example 5: Batch Generation for Custom Library
// ============================================================================

export function example5_batchGeneration() {
  const customPackages = [
    { name: 'SOP10', type: 'sop' as const, pinsPerSide: 5 },
    { name: 'SOP12', type: 'sop' as const, pinsPerSide: 6 },
    { name: 'SSOP14', type: 'ssop' as const, pinsPerSide: 7 },
    { name: 'QFN20', type: 'qfn' as const, pinsPerSide: 5 },
    { name: 'QFN28', type: 'qfn' as const, pinsPerSide: 7 },
  ];

  const generated = customPackages.map(pkg => {
    const isDualSide = pkg.type === 'sop' || pkg.type === 'ssop' || pkg.type === 'tsop';
    const generator = isDualSide ? generateDualSidePackage : generateQuadPackage;
    
    const result = generator({
      type: pkg.type,
      pinsPerSide: pkg.pinsPerSide,
    });

    return {
      name: pkg.name,
      ...result,
    };
  });

  console.log('Batch generated packages:');
  generated.forEach(pkg => {
    console.log(`- ${pkg.name}: ${Object.keys(pkg.pins).length} pins`);
  });

  return generated;
}

// ============================================================================
// Example 6: Different Pin Numbering Schemes
// ============================================================================

export function example6_pinNumberingSchemes() {
  // Standard: top-left, counter-clockwise (default)
  const standard = generateDualSidePackage({
    type: 'sop',
    pinsPerSide: 4,
    pinStartCorner: 'tl',
  });

  // Top-right start
  const topRight = generateDualSidePackage({
    type: 'sop',
    pinsPerSide: 4,
    pinStartCorner: 'tr',
  });

  console.log('Standard numbering (TL):', 
    Object.entries(standard.pins).map(([id, pin]) => pin.name).join(', ')
  );
  console.log('Top-right numbering (TR):', 
    Object.entries(topRight.pins).map(([id, pin]) => pin.name).join(', ')
  );
}

// ============================================================================
// Default export with all examples
// ============================================================================

export default {
  example1_presetPackages,
  example2_customDualSidePackage,
  example3_customQuadPackage,
  example4_drawInSchematic,
  example5_batchGeneration,
  example6_pinNumberingSchemes,
};
