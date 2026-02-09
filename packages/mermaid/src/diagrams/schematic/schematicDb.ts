import { getConfig } from '../../diagram-api/diagramAPI.js';
import { log } from '../../logger.js';
import { v4 } from 'uuid';
import type { LayoutData, Node, Edge } from '../../rendering-util/types.js';
import { getUserDefinedConfig } from '../../config.js';

// Define types for schematic-specific data structures
export interface TitleBlock {
  title?: string;
  date?: string;
  rev?: string;
  company?: string;
  comment?: string;
}

export interface PageSetting {
  paper?: string;
  width?: number;
  height?: number;
  orientation?: 'landscape' | 'portrait';
  paperDir?: 'landscape' | 'portrait';
  scale?: number;
  dpi?: number;
}

export interface SchematicConnection {
  id: string;
  source: {
    id: string;
    pin?: string;
    isPin: boolean;
  };
  target: {
    id: string;
    pin?: string;
    isPin: boolean;
  };
}

export interface SchematicPage {
  id: string;
  name: string;
  titleBlock?: TitleBlock;
  pageSetting?: PageSetting;
  symbols: SchematicSymbol[];
  connections: SchematicConnection[];
}

export interface SchematicSymbolPin {
  id: string;
  name?: string;
  number?: string;
  type?: 'input' | 'output' | 'bidirectional' | 'power' | 'passive';
  x: number;
  y: number;
  rotation?: number;
}

export interface SchematicSymbolPinGroup {
  name?: string;
  pins: SchematicSymbolPin[];
}

export interface SchematicSymbol {
  id: string;
  name: string;
  description?: string;
  width?: number;
  height?: number;
  shape?: string;
  pinGroups: SchematicSymbolPinGroup[];
  electrical?: Record<string, unknown>;
}

export interface SchematicDBData {
  pages: SchematicPage[];
  config: unknown;
}

export type SchematicLayoutData = LayoutData & {
  schematicData: {
    pages: SchematicPage[];
  };
};

export class SchematicDB {
  private pages: SchematicPage[] = [];
  private currentPage: SchematicPage | null = null;
  private count = 0;

  constructor() {
    this.clear();
    this.addPage = this.addPage.bind(this);
    this.addSymbol = this.addSymbol.bind(this);
    this.addConnection = this.addConnection.bind(this);
    this.setPageSetting = this.setPageSetting.bind(this);
    this.setTitleBlock = this.setTitleBlock.bind(this);
    this.getData = this.getData.bind(this);
    this.getLogger = this.getLogger.bind(this);
  }

  public getLogger() {
    return log;
  }

  public clear(): void {
    this.pages = [];
    this.currentPage = null;
    this.count = 0;
  }

  public addPage(id: string, name: string): void {
    const page: SchematicPage = {
      id,
      name,
      symbols: [],
      connections: [],
    };
    this.pages.push(page);
    this.currentPage = page;
  }

  public addSymbol(symbol: SchematicSymbol): void {
    if (this.currentPage) {
      this.currentPage.symbols.push(symbol);
    }
  }

  public addConnection(
    source: string,
    target: string,
    sourcePin?: string,
    targetPin?: string
  ): void {
    if (this.currentPage) {
      const connection: SchematicConnection = {
        id: v4(),
        source: {
          id: source,
          pin: sourcePin,
          isPin: !!sourcePin,
        },
        target: {
          id: target,
          pin: targetPin,
          isPin: !!targetPin,
        },
      };
      this.currentPage.connections.push(connection);
    }
  }

  public setPageSetting(setting: PageSetting): void {
    if (this.currentPage) {
      this.currentPage.pageSetting = setting;
    }
  }

  public setTitleBlock(titleBlock: TitleBlock): void {
    if (this.currentPage) {
      this.currentPage.titleBlock = titleBlock;
    }
  }

  public getData(): SchematicLayoutData {
    const config = getConfig();
    const userDefinedConfig = getUserDefinedConfig();
    const hasUserDefinedLayout = userDefinedConfig.layout !== undefined;

    const finalConfig = config;
    if (!hasUserDefinedLayout) {
      finalConfig.layout = 'cose-bilkent';
    }

    // For now, we'll just return the pages data as nodes
    // Later, we'll expand this to include symbols, connections, etc.
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    // Add page nodes for visualization
    for (const page of this.pages) {
      nodes.push({
        id: `page_${page.id}`,
        domId: `page_${page.id}`,
        label: page.name,
        isGroup: true,
        shape: 'rect',
        width: 200,
        height: 100,
        padding: 10,
        cssClasses: 'schematic-page',
        cssStyles: [],
        look: 'default',
      });

      // Add title block and page setting info as nodes (for testing)
      if (page.titleBlock) {
        nodes.push({
          id: `title_${page.id}`,
          domId: `title_${page.id}`,
          label: `Title: ${page.titleBlock.title ?? 'Untitled'}`,
          isGroup: false,
          shape: 'rect',
          width: 150,
          height: 50,
          padding: 5,
          cssClasses: 'schematic-title-block',
          cssStyles: [],
          look: 'default',
        });
      }

      if (page.pageSetting) {
        nodes.push({
          id: `setting_${page.id}`,
          domId: `setting_${page.id}`,
          label: `Paper: ${page.pageSetting.paper ?? 'A4'}`,
          isGroup: false,
          shape: 'rect',
          width: 150,
          height: 50,
          padding: 5,
          cssClasses: 'schematic-page-setting',
          cssStyles: [],
          look: 'default',
        });
      }
    }

    return {
      nodes,
      edges,
      config: finalConfig,
      // Store additional schematic-specific data
      schematicData: {
        pages: this.pages,
      },
      type: 'schematic',
      diagramId: 'schematic-' + v4(),
    };
  }
}
