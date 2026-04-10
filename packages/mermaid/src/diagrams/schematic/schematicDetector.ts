import type {
  DiagramDetector,
  DiagramLoader,
  ExternalDiagramDefinition,
} from '../../diagram-api/types.js';
const id = 'schematic';

const detector: DiagramDetector = (txt) => {
  // Remove leading comments (both # and %% style) to detect diagram type
  const cleanText = txt.replace(/^(\s*(#|%%).*$\n?)+/m, '');
  return /^\s*schematic\b/.test(cleanText);
};

const loader: DiagramLoader = async () => {
  const { diagram } = await import('./schematic-definition.js');
  return { id, diagram };
};

export const schematic: ExternalDiagramDefinition = {
  id,
  detector,
  loader,
};
