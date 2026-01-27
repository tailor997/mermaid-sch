import type {
  DiagramDetector,
  DiagramLoader,
  ExternalDiagramDefinition,
} from '../../diagram-api/types.js';
const id = 'schematic';

const detector: DiagramDetector = (txt) => {
  return /^\s*schematic/.test(txt);
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
