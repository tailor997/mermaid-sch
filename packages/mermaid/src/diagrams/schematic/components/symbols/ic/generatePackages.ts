/**
 * IC Package SVG Generator Script
 * 
 * This script generates static SVG files for commonly used IC packages.
 * Run this script to regenerate or add new packages:
 * 
 * ```bash
 * node --loader ts-node/esm generatePackages.ts
 * # or
 * npx tsx generatePackages.ts
 * ```
 */

import {
  generateDualSidePackage,
  generateQuadPackage,
  PACKAGE_PRESETS,
  type PackageConfig,
} from './icPackageGenerator.js';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Get current directory in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OUTPUT_DIR = __dirname;

interface PackageEntry {
  id: string;
  name: string;
  category: string;
  description: string;
  pins: Record<string, { id: string; name: string; x: number; y: number; type: string }>;
  bbox: { x: number; y: number; width: number; height: number };
}

/**
 * Generate a single package SVG file
 */
function generatePackageFile(
  id: string,
  config: PackageConfig,
  isDualSide: boolean
): PackageEntry {
  const result = isDualSide 
    ? generateDualSidePackage(config)
    : generateQuadPackage(config);
  
  const totalPins = config.pinsPerSide * (isDualSide ? 2 : 4);
  const name = `${config.type.toUpperCase()}${totalPins}`;
  
  // Write SVG file
  const filename = `${id}.svg`;
  fs.writeFileSync(path.join(OUTPUT_DIR, filename), result.svg, 'utf-8');
  
  console.log(`Generated: ${filename}`);
  
  return {
    id,
    name,
    category: 'ic',
    description: `${config.type.toUpperCase()} ${totalPins}-pin package`,
    pins: Object.fromEntries(
      Object.entries(result.pins).map(([k, v]) => [
        k,
        { id: k, name: v.name, x: v.x, y: v.y, type: v.type },
      ])
    ),
    bbox: result.bbox,
  };
}

/**
 * Generate all preset packages
 */
export function generateAllPackages(): PackageEntry[] {
  const packages: PackageEntry[] = [];
  
  // Dual-side packages
  const dualSideConfigs: Array<{ id: string; type: 'sop' | 'ssop' | 'tsop'; pinsPerSide: number }> = [
    { id: 'sop8', type: 'sop', pinsPerSide: 4 },
    { id: 'sop16', type: 'sop', pinsPerSide: 8 },
    { id: 'sop20', type: 'sop', pinsPerSide: 10 },
    { id: 'sop24', type: 'sop', pinsPerSide: 12 },
    { id: 'sop28', type: 'sop', pinsPerSide: 14 },
    { id: 'ssop8', type: 'ssop', pinsPerSide: 4 },
    { id: 'ssop16', type: 'ssop', pinsPerSide: 8 },
    { id: 'ssop20', type: 'ssop', pinsPerSide: 10 },
    { id: 'ssop24', type: 'ssop', pinsPerSide: 12 },
    { id: 'ssop28', type: 'ssop', pinsPerSide: 14 },
    { id: 'ssop48', type: 'ssop', pinsPerSide: 24 },
    { id: 'tsop32', type: 'tsop', pinsPerSide: 16 },
    { id: 'tsop48', type: 'tsop', pinsPerSide: 24 },
  ];
  
  for (const cfg of dualSideConfigs) {
    packages.push(generatePackageFile(cfg.id, cfg, true));
  }
  
  // Quad packages
  const quadConfigs: Array<{ id: string; type: 'qfn' | 'qfp' | 'lqfp'; pinsPerSide: number }> = [
    { id: 'qfn32', type: 'qfn', pinsPerSide: 8 },
    { id: 'qfn48', type: 'qfn', pinsPerSide: 12 },
    { id: 'qfn64', type: 'qfn', pinsPerSide: 16 },
    { id: 'qfp32', type: 'qfp', pinsPerSide: 8 },
    { id: 'qfp48', type: 'qfp', pinsPerSide: 12 },
    { id: 'qfp64', type: 'qfp', pinsPerSide: 16 },
    { id: 'qfp100', type: 'qfp', pinsPerSide: 25 },
    { id: 'qfp128', type: 'qfp', pinsPerSide: 32 },
    { id: 'lqfp48', type: 'lqfp', pinsPerSide: 12 },
    { id: 'lqfp64', type: 'lqfp', pinsPerSide: 16 },
    { id: 'lqfp100', type: 'lqfp', pinsPerSide: 25 },
    { id: 'lqfp128', type: 'lqfp', pinsPerSide: 32 },
    { id: 'lqfp144', type: 'lqfp', pinsPerSide: 36 },
  ];
  
  for (const cfg of quadConfigs) {
    packages.push(generatePackageFile(cfg.id, cfg, false));
  }
  
  return packages;
}

/**
 * Update index.json with generated packages
 */
function updateIndexJson(packages: PackageEntry[]) {
  const indexPath = path.join(OUTPUT_DIR, '..', 'index.json');
  
  let index: any;
  try {
    const content = fs.readFileSync(indexPath, 'utf-8');
    index = JSON.parse(content);
  } catch {
    // Create new index if not exists
    index = {
      $schema: './schema.json',
      version: '1.1.0',
      description: 'Schematic Symbol Library - Extended',
      categories: {
        passive: {
          name: 'Passive Components',
          description: 'Resistors, capacitors, inductors, crystals'
        },
        semiconductor: {
          name: 'Semiconductors',
          description: 'Diodes, LEDs, transistors'
        },
        mechanical: {
          name: 'Mechanical',
          description: 'Buttons, switches, connectors'
        },
        ic: {
          name: 'Integrated Circuits',
          description: 'IC packages, microcontrollers, op-amps, regulators'
        }
      },
      symbols: {}
    };
  }
  
  // Add package symbols
  for (const pkg of packages) {
    index.symbols[pkg.id] = {
      category: pkg.category,
      name: pkg.name,
      file: `ic/${pkg.id}.svg`,
      description: pkg.description,
      pins: pkg.pins,
      bbox: pkg.bbox,
      defaults: { rotation: 0, labelPosition: 'below' }
    };
  }
  
  fs.writeFileSync(indexPath, JSON.stringify(index, null, 2), 'utf-8');
  console.log(`\nUpdated: ${indexPath}`);
}

// Main execution
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('Generating IC package SVGs...\n');
  const packages = generateAllPackages();
  updateIndexJson(packages);
  console.log(`\nTotal packages generated: ${packages.length}`);
}

export default {
  generateAllPackages,
  generatePackageFile,
};
