// @ts-ignore: JISON doesn't support types
import parser from './parser/schematicParser.js';
import { SchematicDB } from './schematicDb.js';
import renderer from './schematicRenderer.js';
import styles from './styles.js';
import type { DiagramDefinition } from '../../diagram-api/types.js';

export const diagram: DiagramDefinition = {
  get db() {
    return new SchematicDB();
  },
  renderer,
  parser,
  styles,
};
