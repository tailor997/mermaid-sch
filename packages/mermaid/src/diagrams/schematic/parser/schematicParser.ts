// @ts-ignore: JISON doesn't support types
import schematicJisonParser from './schematic.jison';

const parser = {
  parse: (input: string) => {
    return schematicJisonParser.parse(input);
  },
  // Expose the JISON parser as 'parser' property so that Diagram.ts can access 'parser.yy'
  // See packages/mermaid/src/Diagram.ts:34-37
  parser: schematicJisonParser,
};

export default parser;
