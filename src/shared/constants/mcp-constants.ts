// MCP Protocol Constants

export const MCP_VERSION = '2024-11-05';
export const MCP_SERVER_NAME = 'eaight';
export const MCP_SERVER_VERSION = '0.1.0';

export const DEFAULT_MCP_PORT = 9222;
export const FALLBACK_MCP_PORTS = [9223, 9224];

export const MCP_SOCKET_FILENAME = 'mcp-server.json';

// Windows: %APPDATA%\eaight\mcp-server.json
// macOS/Linux: ~/.eaight/mcp-server.json
export const getSocketPath = (): string => {
  if (process.platform === 'win32') {
    return `${process.env.APPDATA}\\eaight\\${MCP_SOCKET_FILENAME}`;
  }
  return `${process.env.HOME}/.eaight/${MCP_SOCKET_FILENAME}`;
};

export const getTokenPath = (): string => {
  if (process.platform === 'win32') {
    return `${process.env.APPDATA}\\eaight\\auth-token`;
  }
  return `${process.env.HOME}/.eaight/auth-token`;
};

// MCP Method names
export const MCPMethods = {
  // Lifecycle
  INITIALIZE: 'initialize',
  INITIALIZED: 'notifications/initialized',
  SHUTDOWN: 'shutdown',

  // Resources
  RESOURCES_LIST: 'resources/list',
  RESOURCES_READ: 'resources/read',
  RESOURCES_SUBSCRIBE: 'resources/subscribe',
  RESOURCES_UNSUBSCRIBE: 'resources/unsubscribe',

  // Tools
  TOOLS_LIST: 'tools/list',
  TOOLS_CALL: 'tools/call',

  // Prompts
  PROMPTS_LIST: 'prompts/list',
  PROMPTS_GET: 'prompts/get',

  // Notifications
  RESOURCE_UPDATED: 'notifications/resources/updated',
  TOOL_RESULT: 'notifications/tools/result',
} as const;

// Resource URIs
export const MCPResources = {
  STATE: 'browser://state',
  DOM: 'browser://dom',
  TEXT: 'browser://text',
  SCREENSHOT: 'browser://screenshot',
  ACCESSIBILITY: 'browser://accessibility',
  NETWORK: 'browser://network',
  CONSOLE: 'browser://console',
  COOKIES: 'browser://cookies',
  TABS: 'browser://tabs',
} as const;

// Tool names
export const MCPTools = {
  NAVIGATE: 'browser_navigate',
  BACK: 'browser_back',
  FORWARD: 'browser_forward',
  RELOAD: 'browser_reload',
  NEW_TAB: 'browser_new_tab',
  CLOSE_TAB: 'browser_close_tab',
  SWITCH_TAB: 'browser_switch_tab',
  CLICK: 'browser_click',
  TYPE: 'browser_type',
  SCROLL: 'browser_scroll',
  HOVER: 'browser_hover',
  SELECT: 'browser_select',
  UPLOAD: 'browser_upload',
  EXECUTE_JS: 'browser_execute_js',
  GET_ELEMENTS: 'browser_get_elements',
  GET_ATTRIBUTE: 'browser_get_attribute',
  WAIT: 'browser_wait',
  SCREENSHOT: 'browser_screenshot',
  PDF: 'browser_pdf',
} as const;
