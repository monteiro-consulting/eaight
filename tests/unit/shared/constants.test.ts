import { describe, it, expect } from 'vitest';
import {
  DEFAULT_WINDOW_WIDTH,
  DEFAULT_WINDOW_HEIGHT,
  MIN_WINDOW_WIDTH,
  MIN_WINDOW_HEIGHT,
  DEFAULT_AI_PANEL_WIDTH,
  MAX_TABS,
  NEW_TAB_URL,
  DEFAULT_START_PAGE,
  SEARCH_ENGINES,
} from '../../../src/shared/constants/defaults';
import {
  MCP_VERSION,
  MCP_SERVER_NAME,
  DEFAULT_MCP_PORT,
  FALLBACK_MCP_PORTS,
  MCPMethods,
  MCPResources,
  MCPTools,
} from '../../../src/shared/constants/mcp-constants';

describe('Default Constants', () => {
  describe('Window dimensions', () => {
    it('should have valid default window size', () => {
      expect(DEFAULT_WINDOW_WIDTH).toBeGreaterThan(0);
      expect(DEFAULT_WINDOW_HEIGHT).toBeGreaterThan(0);
      expect(DEFAULT_WINDOW_WIDTH).toBeGreaterThanOrEqual(MIN_WINDOW_WIDTH);
      expect(DEFAULT_WINDOW_HEIGHT).toBeGreaterThanOrEqual(MIN_WINDOW_HEIGHT);
    });

    it('should have minimum sizes smaller than defaults', () => {
      expect(MIN_WINDOW_WIDTH).toBeLessThan(DEFAULT_WINDOW_WIDTH);
      expect(MIN_WINDOW_HEIGHT).toBeLessThan(DEFAULT_WINDOW_HEIGHT);
    });
  });

  describe('AI Panel', () => {
    it('should have valid AI panel width', () => {
      expect(DEFAULT_AI_PANEL_WIDTH).toBeGreaterThan(0);
      expect(DEFAULT_AI_PANEL_WIDTH).toBe(350);
    });
  });

  describe('Tabs', () => {
    it('should have reasonable max tabs limit', () => {
      expect(MAX_TABS).toBeGreaterThan(0);
      expect(MAX_TABS).toBeLessThanOrEqual(1000);
    });

    it('should have valid new tab URL', () => {
      expect(NEW_TAB_URL).toBe('about:blank');
    });

    it('should have valid start page URL', () => {
      expect(DEFAULT_START_PAGE).toMatch(/^https?:\/\//);
    });
  });

  describe('Search Engines', () => {
    it('should have Google as default', () => {
      expect(SEARCH_ENGINES.google).toContain('google.com');
    });

    it('should have query parameter in URLs', () => {
      Object.values(SEARCH_ENGINES).forEach((url) => {
        expect(url).toContain('?q=');
      });
    });
  });
});

describe('MCP Constants', () => {
  describe('Server info', () => {
    it('should have valid version format', () => {
      expect(MCP_VERSION).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('should have server name', () => {
      expect(MCP_SERVER_NAME).toBe('eaight');
    });
  });

  describe('Ports', () => {
    it('should have default port 9222', () => {
      expect(DEFAULT_MCP_PORT).toBe(9222);
    });

    it('should have fallback ports', () => {
      expect(FALLBACK_MCP_PORTS).toContain(9223);
      expect(FALLBACK_MCP_PORTS).toContain(9224);
    });

    it('should have valid port range', () => {
      expect(DEFAULT_MCP_PORT).toBeGreaterThan(0);
      expect(DEFAULT_MCP_PORT).toBeLessThanOrEqual(65535);
      FALLBACK_MCP_PORTS.forEach((port) => {
        expect(port).toBeGreaterThan(0);
        expect(port).toBeLessThanOrEqual(65535);
      });
    });
  });

  describe('MCP Methods', () => {
    it('should have lifecycle methods', () => {
      expect(MCPMethods.INITIALIZE).toBe('initialize');
      expect(MCPMethods.SHUTDOWN).toBe('shutdown');
    });

    it('should have resource methods', () => {
      expect(MCPMethods.RESOURCES_LIST).toBe('resources/list');
      expect(MCPMethods.RESOURCES_READ).toBe('resources/read');
    });

    it('should have tool methods', () => {
      expect(MCPMethods.TOOLS_LIST).toBe('tools/list');
      expect(MCPMethods.TOOLS_CALL).toBe('tools/call');
    });

    it('should have prompt methods', () => {
      expect(MCPMethods.PROMPTS_LIST).toBe('prompts/list');
      expect(MCPMethods.PROMPTS_GET).toBe('prompts/get');
    });
  });

  describe('MCP Resources', () => {
    it('should have browser:// URI scheme', () => {
      Object.values(MCPResources).forEach((uri) => {
        expect(uri).toMatch(/^browser:\/\//);
      });
    });

    it('should have all required resources', () => {
      expect(MCPResources.STATE).toBe('browser://state');
      expect(MCPResources.DOM).toBe('browser://dom');
      expect(MCPResources.TEXT).toBe('browser://text');
      expect(MCPResources.SCREENSHOT).toBe('browser://screenshot');
      expect(MCPResources.ACCESSIBILITY).toBe('browser://accessibility');
      expect(MCPResources.NETWORK).toBe('browser://network');
      expect(MCPResources.CONSOLE).toBe('browser://console');
      expect(MCPResources.COOKIES).toBe('browser://cookies');
      expect(MCPResources.TABS).toBe('browser://tabs');
    });
  });

  describe('MCP Tools', () => {
    it('should have browser_ prefix for all tools', () => {
      Object.values(MCPTools).forEach((tool) => {
        expect(tool).toMatch(/^browser_/);
      });
    });

    it('should have navigation tools', () => {
      expect(MCPTools.NAVIGATE).toBe('browser_navigate');
      expect(MCPTools.BACK).toBe('browser_back');
      expect(MCPTools.FORWARD).toBe('browser_forward');
      expect(MCPTools.RELOAD).toBe('browser_reload');
    });

    it('should have tab tools', () => {
      expect(MCPTools.NEW_TAB).toBe('browser_new_tab');
      expect(MCPTools.CLOSE_TAB).toBe('browser_close_tab');
      expect(MCPTools.SWITCH_TAB).toBe('browser_switch_tab');
    });

    it('should have interaction tools', () => {
      expect(MCPTools.CLICK).toBe('browser_click');
      expect(MCPTools.TYPE).toBe('browser_type');
      expect(MCPTools.SCROLL).toBe('browser_scroll');
      expect(MCPTools.HOVER).toBe('browser_hover');
      expect(MCPTools.SELECT).toBe('browser_select');
    });

    it('should have extraction tools', () => {
      expect(MCPTools.GET_ELEMENTS).toBe('browser_get_elements');
      expect(MCPTools.GET_ATTRIBUTE).toBe('browser_get_attribute');
      expect(MCPTools.EXECUTE_JS).toBe('browser_execute_js');
    });

    it('should have capture tools', () => {
      expect(MCPTools.SCREENSHOT).toBe('browser_screenshot');
      expect(MCPTools.PDF).toBe('browser_pdf');
    });
  });
});
