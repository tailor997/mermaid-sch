import type { DiagramMetadata } from '../types.js';

export const schematic: DiagramMetadata = {
  id: 'schematic',
  title: 'Schematic Diagram',
  examples: [
    {
      title: 'Basic Schematic',
      id: 'schematic-basic',
      code: `schematic LR
    subgraph main["Main"]
        title_block(
            title: "Basic Circuit"
        )
    end
`,
      isDefault: true,
    },
  ],
};

export default schematic;
