import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  MCPMethods,
  MCPResources,
  MCPTools,
  MCP_VERSION,
  MCP_SERVER_NAME,
  MCP_SERVER_VERSION,
} from '../../../src/shared/constants/mcp-constants';

// Mock Electron modules to allow importing MCP modules
vi.mock('electron', () => ({
  app: {
    getPath: vi.fn(() => '/mock/path'),
    on: vi.fn(),
    whenReady: vi.fn(() => Promise.resolve()),
  },
  BrowserWindow: vi.fn(),
  BrowserView: vi.fn(),
  ipcMain: {
    handle: vi.fn(),
    on: vi.fn(),
  },
  nativeTheme: {
    shouldUseDarkColors: false,
  },
}));

vi.mock('../../../src/main/tabs', () => ({
  tabManager: {
    getActiveTab: vi.fn(),
    getAllTabs: vi.fn(() => []),
    createTab: vi.fn(),
    closeTab: vi.fn(),
    switchToTab: vi.fn(),
    navigate: vi.fn(),
    goBack: vi.fn(),
    goForward: vi.fn(),
    reload: vi.fn(),
  },
}));

vi.mock('../../../src/main/window', () => ({
  windowManager: {
    getWindow: vi.fn(),
    getContentBounds: vi.fn(() => ({ x: 0, y: 0, width: 1280, height: 800 })),
  },
}));

// Import after mocking
import { tools } from '../../../src/main/bridge/MCPTools';
import { resources } from '../../../src/main/bridge/MCPResources';
import { prompts } from '../../../src/main/bridge/MCPPrompts';

describe('MCP Protocol Integration', () => {
  describe('Server Info', () => {
    it('should have valid MCP version', () => {
      expect(MCP_VERSION).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('should have server name and version', () => {
      expect(MCP_SERVER_NAME).toBe('eaight');
      expect(MCP_SERVER_VERSION).toMatch(/^\d+\.\d+\.\d+$/);
    });
  });

  describe('Tools', () => {
    it('should export an array of tools', () => {
      expect(Array.isArray(tools)).toBe(true);
      expect(tools.length).toBeGreaterThan(0);
    });

    it('should have all tools with name and description', () => {
      tools.forEach((tool) => {
        expect(tool.name).toBeDefined();
        expect(typeof tool.name).toBe('string');
        expect(tool.description).toBeDefined();
        expect(typeof tool.description).toBe('string');
      });
    });

    it('should have valid inputSchema for tools that require it', () => {
      const toolsWithSchema = tools.filter((t) => t.inputSchema);

      toolsWithSchema.forEach((tool) => {
        expect(tool.inputSchema?.type).toBe('object');
        expect(tool.inputSchema?.properties).toBeDefined();
      });
    });

    it('should have navigation tools', () => {
      const navTools = [MCPTools.NAVIGATE, MCPTools.BACK, MCPTools.FORWARD, MCPTools.RELOAD];

      navTools.forEach((toolName) => {
        const tool = tools.find((t) => t.name === toolName);
        expect(tool).toBeDefined();
      });
    });

    it('should have tab management tools', () => {
      const tabTools = [MCPTools.NEW_TAB, MCPTools.CLOSE_TAB, MCPTools.SWITCH_TAB];

      tabTools.forEach((toolName) => {
        const tool = tools.find((t) => t.name === toolName);
        expect(tool).toBeDefined();
      });
    });

    it('should have interaction tools', () => {
      const interactionTools = [
        MCPTools.CLICK,
        MCPTools.TYPE,
        MCPTools.SCROLL,
        MCPTools.HOVER,
        MCPTools.SELECT,
      ];

      interactionTools.forEach((toolName) => {
        const tool = tools.find((t) => t.name === toolName);
        expect(tool).toBeDefined();
      });
    });

    it('should have browser_navigate with required url parameter', () => {
      const navigateTool = tools.find((t) => t.name === MCPTools.NAVIGATE);

      expect(navigateTool).toBeDefined();
      expect(navigateTool?.inputSchema?.required).toContain('url');
    });

    it('should have browser_type with required selector and text parameters', () => {
      const typeTool = tools.find((t) => t.name === MCPTools.TYPE);

      expect(typeTool).toBeDefined();
      expect(typeTool?.inputSchema?.required).toContain('selector');
      expect(typeTool?.inputSchema?.required).toContain('text');
    });

    it('should have browser_click with selector, text, or coordinates options', () => {
      const clickTool = tools.find((t) => t.name === MCPTools.CLICK);

      expect(clickTool).toBeDefined();
      expect(clickTool?.inputSchema?.properties?.selector).toBeDefined();
      expect(clickTool?.inputSchema?.properties?.text).toBeDefined();
      expect(clickTool?.inputSchema?.properties?.coordinates).toBeDefined();
    });
  });

  describe('Resources', () => {
    it('should export an array of resources', () => {
      expect(Array.isArray(resources)).toBe(true);
      expect(resources.length).toBeGreaterThan(0);
    });

    it('should have all resources with uri, name, and description', () => {
      resources.forEach((resource) => {
        expect(resource.uri).toBeDefined();
        expect(typeof resource.uri).toBe('string');
        expect(resource.uri).toMatch(/^browser:\/\//);

        expect(resource.name).toBeDefined();
        expect(typeof resource.name).toBe('string');

        expect(resource.description).toBeDefined();
        expect(typeof resource.description).toBe('string');
      });
    });

    it('should have all resources with mimeType', () => {
      resources.forEach((resource) => {
        expect(resource.mimeType).toBeDefined();
        expect(typeof resource.mimeType).toBe('string');
      });
    });

    it('should have browser://state resource', () => {
      const stateResource = resources.find((r) => r.uri === MCPResources.STATE);

      expect(stateResource).toBeDefined();
      expect(stateResource?.mimeType).toBe('application/json');
    });

    it('should have browser://dom resource', () => {
      const domResource = resources.find((r) => r.uri === MCPResources.DOM);

      expect(domResource).toBeDefined();
      expect(domResource?.mimeType).toBe('text/html');
    });

    it('should have browser://screenshot resource', () => {
      const screenshotResource = resources.find((r) => r.uri === MCPResources.SCREENSHOT);

      expect(screenshotResource).toBeDefined();
      expect(screenshotResource?.mimeType).toBe('image/png');
    });

    it('should have all expected resources', () => {
      const expectedUris = Object.values(MCPResources);

      expectedUris.forEach((uri) => {
        const resource = resources.find((r) => r.uri === uri);
        expect(resource).toBeDefined();
      });
    });
  });

  describe('Prompts', () => {
    it('should export an array of prompts', () => {
      expect(Array.isArray(prompts)).toBe(true);
      expect(prompts.length).toBeGreaterThan(0);
    });

    it('should have all prompts with name and description', () => {
      prompts.forEach((prompt) => {
        expect(prompt.name).toBeDefined();
        expect(typeof prompt.name).toBe('string');

        expect(prompt.description).toBeDefined();
        expect(typeof prompt.description).toBe('string');
      });
    });

    it('should have analyze_page prompt', () => {
      const analyzePrompt = prompts.find((p) => p.name === 'analyze_page');
      expect(analyzePrompt).toBeDefined();
    });

    it('should have fill_form prompt with data argument', () => {
      const fillFormPrompt = prompts.find((p) => p.name === 'fill_form');

      expect(fillFormPrompt).toBeDefined();
      expect(fillFormPrompt?.arguments).toBeDefined();

      const dataArg = fillFormPrompt?.arguments?.find((a) => a.name === 'data');
      expect(dataArg).toBeDefined();
      expect(dataArg?.required).toBe(true);
    });

    it('should have extract_data prompt with schema argument', () => {
      const extractPrompt = prompts.find((p) => p.name === 'extract_data');

      expect(extractPrompt).toBeDefined();
      expect(extractPrompt?.arguments).toBeDefined();

      const schemaArg = extractPrompt?.arguments?.find((a) => a.name === 'schema');
      expect(schemaArg).toBeDefined();
      expect(schemaArg?.required).toBe(true);
    });

    it('should have navigate_to prompt with goal argument', () => {
      const navigatePrompt = prompts.find((p) => p.name === 'navigate_to');

      expect(navigatePrompt).toBeDefined();
      expect(navigatePrompt?.arguments).toBeDefined();

      const goalArg = navigatePrompt?.arguments?.find((a) => a.name === 'goal');
      expect(goalArg).toBeDefined();
      expect(goalArg?.required).toBe(true);
    });
  });

  describe('MCP Methods', () => {
    it('should have all required lifecycle methods', () => {
      expect(MCPMethods.INITIALIZE).toBe('initialize');
      expect(MCPMethods.SHUTDOWN).toBe('shutdown');
    });

    it('should have all required resource methods', () => {
      expect(MCPMethods.RESOURCES_LIST).toBe('resources/list');
      expect(MCPMethods.RESOURCES_READ).toBe('resources/read');
    });

    it('should have all required tool methods', () => {
      expect(MCPMethods.TOOLS_LIST).toBe('tools/list');
      expect(MCPMethods.TOOLS_CALL).toBe('tools/call');
    });

    it('should have all required prompt methods', () => {
      expect(MCPMethods.PROMPTS_LIST).toBe('prompts/list');
      expect(MCPMethods.PROMPTS_GET).toBe('prompts/get');
    });
  });
});

describe('MCP Message Format', () => {
  describe('Request format', () => {
    it('should validate initialize request structure', () => {
      const request = {
        jsonrpc: '2.0',
        id: 1,
        method: MCPMethods.INITIALIZE,
        params: {
          protocolVersion: MCP_VERSION,
          capabilities: {},
          clientInfo: {
            name: 'test-client',
            version: '1.0.0',
          },
        },
      };

      expect(request.jsonrpc).toBe('2.0');
      expect(request.method).toBe('initialize');
      expect(request.params.protocolVersion).toBeDefined();
      expect(request.params.clientInfo).toBeDefined();
    });

    it('should validate tools/call request structure', () => {
      const request = {
        jsonrpc: '2.0',
        id: 2,
        method: MCPMethods.TOOLS_CALL,
        params: {
          name: MCPTools.NAVIGATE,
          arguments: {
            url: 'https://example.com',
          },
        },
      };

      expect(request.method).toBe('tools/call');
      expect(request.params.name).toBeDefined();
      expect(request.params.arguments).toBeDefined();
    });

    it('should validate resources/read request structure', () => {
      const request = {
        jsonrpc: '2.0',
        id: 3,
        method: MCPMethods.RESOURCES_READ,
        params: {
          uri: MCPResources.STATE,
        },
      };

      expect(request.method).toBe('resources/read');
      expect(request.params.uri).toBeDefined();
    });
  });

  describe('Response format', () => {
    it('should validate success response structure', () => {
      const response = {
        jsonrpc: '2.0',
        id: 1,
        result: {
          protocolVersion: MCP_VERSION,
          serverInfo: {
            name: MCP_SERVER_NAME,
            version: MCP_SERVER_VERSION,
          },
          capabilities: {
            resources: {},
            tools: {},
            prompts: {},
          },
        },
      };

      expect(response.jsonrpc).toBe('2.0');
      expect(response.result).toBeDefined();
      expect(response.result.serverInfo.name).toBe(MCP_SERVER_NAME);
    });

    it('should validate error response structure', () => {
      const response = {
        jsonrpc: '2.0',
        id: 1,
        error: {
          code: -32600,
          message: 'Invalid Request',
        },
      };

      expect(response.error).toBeDefined();
      expect(response.error.code).toBeDefined();
      expect(response.error.message).toBeDefined();
    });
  });
});
