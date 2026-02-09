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
        title_block{
            title: "Test Title"
        }
    end
`;

    parser.parse(input);
    const data = db.getData();

    expect(data.schematicData.pages).toHaveLength(1);
    expect(data.schematicData.pages[0].titleBlock?.title).toBe('Test Title');
  });

  it('should parse RC Low Pass & LC Resonant example', () => {
    const input = `schematic LR
    subgraph main["RC Low Pass & LC Resonant"]
        page_setting{width: 500, height: 400}
        title_block{
            title: "Basic Circuits",
            date: "2026-01-28",
            company: "Demo Corp"
        }
        
        # RC Low Pass Filter
        [resistor R1]{label: "1k", rotation: 0}
        [capacitor C1]{label: "10uF", rotation: 90}
        
        # LC Series Resonant
        [inductor L1]{label: "100uH", rotation: 0}
        [capacitor C2]{label: "10nF", rotation: 0}

        (Ui+) (--) (0).[R1]
                        [R1].(1) (--) (Uo+)
                        [R1].(1) (--) [C1].(0)
        (Ui-) (--)      (1).[C1]
                        [C1].(1) (--) (Uo-) 

    end
`;
    expect(() => parser.parse(input)).not.toThrow();
    const data = db.getData();
    expect(data.schematicData.pages).toHaveLength(1);
    expect(data.schematicData.pages[0].symbols).toHaveLength(4);

    // Check connections
    const connections = data.schematicData.pages[0].connections;

    const c1 = connections.find((c: any) => c.source.id === 'Ui+' && c.target.id === 'R1');
    expect(c1).toBeDefined();
    expect(c1?.target.pin).toBe('0');

    // [R1].(1) (--) (Uo+)
    const c2 = connections.find((c: any) => c.source.id === 'R1' && c.target.id === 'Uo+');
    expect(c2).toBeDefined();
    expect(c2?.source.pin).toBe('1');
  });
});
