import parser from './schematicParser.js';
import { SchematicDB } from '../schematicDb.js';

describe('schematic parser', () => {
  let db: SchematicDB;

  beforeEach(() => {
    db = new SchematicDB();
    parser.parser.yy = db;
    db.clear();
  });

  it('should parse a simple schematic', () => {
    const input = `schematic LR
    subgraph main["Main"]
        
    end
`;

    expect(() => parser.parse(input)).not.toThrow();
  });

  it('should parse meta-data', () => {
    const input = `schematic LR
    subgraph meta-data["Page 1"]
        title_block(
            title: "Test Title"
        )
    end
`;

    parser.parse(input);
    const data = db.getData();

    expect(data.schematicData.pages).toHaveLength(1);
    expect(data.schematicData.pages[0].titleBlock?.title).toBe('Test Title');
  });
});
