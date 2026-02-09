import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SchematicDB } from './schematicDb.js';
import type { PageSetting, TitleBlock } from './schematicDb.js';
// @ts-ignore: Jison parser doesn't have types
import parser from './parser/schematicParser.js';

// Mock the getConfig function
vi.mock('../../diagram-api/diagramAPI.js', () => ({
  getConfig: vi.fn(() => ({
    schematic: {
      layoutAlgorithm: 'cose-bilkent',
      padding: 10,
      maxNodeWidth: 200,
      useMaxWidth: true,
    },
  })),
}));

describe('SchematicDB getData function', () => {
  let db: SchematicDB;

  beforeEach(() => {
    db = new SchematicDB();
    parser.parser.yy = db;
    // Clear the database before each test
    db.clear();
  });

  describe('Integration Test with Parser', () => {
    it('should parse meta-data subgraph with page_setting and title_block', () => {
      const input = `schematic LR
    subgraph meta-data["Page 1: 架构"]
        page_setting{
            paper: A4,
            paper-dir: landscape,
            scale: 1.0,
            dpi: 300
        }
        
        title_block{
            title: "STM32F103C8T6最小系统",
            date: "2026-01-20",
            rev: "V1.0",
            company: "示例科技有限公司",
            comment: "基于mermaid语法的原理图设计"
        }
    end
`;

      parser.parse(input);
      const result = db.getData();

      expect(result.schematicData.pages).toHaveLength(1);
      const page = result.schematicData.pages[0];

      expect(page.id).toBe('meta-data');
      expect(page.name).toBe('Page 1: 架构');

      // Check page_setting
      expect(page.pageSetting).toBeDefined();
      expect(page.pageSetting?.paper).toBe('A4');
      expect(page.pageSetting?.paperDir).toBe('landscape');
      expect(page.pageSetting?.scale).toBe(1.0);
      expect(page.pageSetting?.dpi).toBe(300);

      // Check title_block
      expect(page.titleBlock).toBeDefined();
      expect(page.titleBlock?.title).toBe('STM32F103C8T6最小系统');
      expect(page.titleBlock?.date).toBe('2026-01-20');
      expect(page.titleBlock?.rev).toBe('V1.0');
      expect(page.titleBlock?.company).toBe('示例科技有限公司');
      expect(page.titleBlock?.comment).toBe('基于mermaid语法的原理图设计');
    });

    it('should parse simplified page_setting', () => {
      const input = `schematic LR
    subgraph page1["Simple Page"]
        page_setting{
            paper: A3
        }
    end
`;

      parser.parse(input);
      const result = db.getData();

      expect(result.schematicData.pages).toHaveLength(1);
      const page = result.schematicData.pages[0];

      expect(page.pageSetting?.paper).toBe('A3');
      expect(page.pageSetting?.paperDir).toBeUndefined();
    });
  });

  describe('getData', () => {
    it('should return empty data when no schematic is set', () => {
      const result = db.getData();

      expect(result.nodes).toEqual([]);
      expect(result.edges).toEqual([]);
      expect(result.config).toBeDefined();
      expect(result.schematicData).toBeDefined();
      expect(result.schematicData.pages).toEqual([]);
    });

    it('should return structured data with title_block and page_setting', () => {
      // Create a simple schematic with page_setting and title_block
      db.addPage('Page1', 'Page 1: Architecture');

      // Add page_setting
      const pageSetting: PageSetting = {
        paper: 'A4',
        paperDir: 'landscape',
        scale: 1.0,
        dpi: 300,
      };
      db.setPageSetting(pageSetting);

      // Add title_block
      const titleBlock: TitleBlock = {
        title: 'STM32F103C8T6最小系统',
        date: '2026-01-20',
        rev: 'V1.0',
        company: '示例科技有限公司',
        comment: '基于mermaid语法的原理图设计',
      };
      db.setTitleBlock(titleBlock);

      const result = db.getData();

      // Check basic structure
      expect(result.nodes).toHaveLength(3); // 1 page node, 1 title block node, 1 page setting node
      expect(result.edges).toEqual([]);
      expect(result.config).toBeDefined();
      expect(result.schematicData).toBeDefined();
      expect(result.schematicData.pages).toHaveLength(1);

      // Check page data
      const page = result.schematicData.pages[0];
      expect(page.id).toBe('Page1');
      expect(page.name).toBe('Page 1: Architecture');

      // Check page_setting
      expect(page.pageSetting).toBeDefined();
      expect(page.pageSetting?.paper).toBe('A4');
      expect(page.pageSetting?.paperDir).toBe('landscape');
      expect(page.pageSetting?.scale).toBe(1.0);
      expect(page.pageSetting?.dpi).toBe(300);

      // Check title_block
      expect(page.titleBlock).toBeDefined();
      expect(page.titleBlock?.title).toBe('STM32F103C8T6最小系统');
      expect(page.titleBlock?.date).toBe('2026-01-20');
      expect(page.titleBlock?.rev).toBe('V1.0');
      expect(page.titleBlock?.company).toBe('示例科技有限公司');
      expect(page.titleBlock?.comment).toBe('基于mermaid语法的原理图设计');

      // Check nodes generated for visualization
      const pageNode = result.nodes.find((n) => n.id === 'page_Page1');
      expect(pageNode).toBeDefined();
      expect(pageNode?.label).toBe('Page 1: Architecture');

      const titleNode = result.nodes.find((n) => n.id === 'title_Page1');
      expect(titleNode).toBeDefined();
      expect(titleNode?.label).toBe('Title: STM32F103C8T6最小系统');

      const settingNode = result.nodes.find((n) => n.id === 'setting_Page1');
      expect(settingNode).toBeDefined();
      expect(settingNode?.label).toBe('Paper: A4');
    });

    it('should handle missing optional properties in page_setting and title_block', () => {
      // Create a schematic with minimal page_setting and title_block
      db.addPage('Page1', 'Page 1: Minimal');

      // Add minimal page_setting
      const pageSetting: PageSetting = {
        paper: 'A4',
      };
      db.setPageSetting(pageSetting);

      // Add minimal title_block
      const titleBlock: TitleBlock = {
        title: 'Minimal Schematic',
      };
      db.setTitleBlock(titleBlock);

      const result = db.getData();

      expect(result.schematicData.pages).toHaveLength(1);

      const page = result.schematicData.pages[0];

      // Check minimal page_setting
      expect(page.pageSetting).toBeDefined();
      expect(page.pageSetting?.paper).toBe('A4');
      expect(page.pageSetting?.paperDir).toBeUndefined();
      expect(page.pageSetting?.scale).toBeUndefined();
      expect(page.pageSetting?.dpi).toBeUndefined();

      // Check minimal title_block
      expect(page.titleBlock).toBeDefined();
      expect(page.titleBlock?.title).toBe('Minimal Schematic');
      expect(page.titleBlock?.date).toBeUndefined();
      expect(page.titleBlock?.rev).toBeUndefined();
      expect(page.titleBlock?.company).toBeUndefined();
      expect(page.titleBlock?.comment).toBeUndefined();
    });

    it('should handle multiple pages with different settings', () => {
      // Create first page with settings
      db.addPage('Page1', 'Page 1: Architecture');
      db.setPageSetting({
        paper: 'A4',
        paperDir: 'landscape',
      });
      db.setTitleBlock({
        title: 'Page 1 Title',
      });

      // Create second page with different settings
      db.addPage('Page2', 'Page 2: IO Interface');
      db.setPageSetting({
        paper: 'A3',
        paperDir: 'portrait',
        scale: 1.5,
      });
      db.setTitleBlock({
        title: 'Page 2 Title',
        date: '2026-01-21',
      });

      const result = db.getData();

      expect(result.schematicData.pages).toHaveLength(2);
      expect(result.nodes).toHaveLength(6); // 2 pages * 3 nodes each

      // Check first page
      const page1 = result.schematicData.pages[0];
      expect(page1.id).toBe('Page1');
      expect(page1.pageSetting?.paper).toBe('A4');
      expect(page1.titleBlock?.title).toBe('Page 1 Title');

      // Check second page
      const page2 = result.schematicData.pages[1];
      expect(page2.id).toBe('Page2');
      expect(page2.pageSetting?.paper).toBe('A3');
      expect(page2.pageSetting?.scale).toBe(1.5);
      expect(page2.titleBlock?.title).toBe('Page 2 Title');
      expect(page2.titleBlock?.date).toBe('2026-01-21');
    });
  });
});
