"use strict";
// MCP Protocol Constants
Object.defineProperty(exports, "__esModule", { value: true });
exports.MCPTools = exports.MCPResources = exports.MCPMethods = exports.getTokenPath = exports.getSocketPath = exports.MCP_SOCKET_FILENAME = exports.FALLBACK_MCP_PORTS = exports.DEFAULT_MCP_PORT = exports.MCP_SERVER_VERSION = exports.MCP_SERVER_NAME = exports.MCP_VERSION = void 0;
exports.MCP_VERSION = '2024-11-05';
exports.MCP_SERVER_NAME = 'eaight';
exports.MCP_SERVER_VERSION = '0.1.0';
exports.DEFAULT_MCP_PORT = 9222;
exports.FALLBACK_MCP_PORTS = [9223, 9224];
exports.MCP_SOCKET_FILENAME = 'mcp-server.json';
// Windows: %APPDATA%\eaight\mcp-server.json
// macOS/Linux: ~/.eaight/mcp-server.json
const getSocketPath = () => {
    if (process.platform === 'win32') {
        return `${process.env.APPDATA}\\eaight\\${exports.MCP_SOCKET_FILENAME}`;
    }
    return `${process.env.HOME}/.eaight/${exports.MCP_SOCKET_FILENAME}`;
};
exports.getSocketPath = getSocketPath;
const getTokenPath = () => {
    if (process.platform === 'win32') {
        return `${process.env.APPDATA}\\eaight\\auth-token`;
    }
    return `${process.env.HOME}/.eaight/auth-token`;
};
exports.getTokenPath = getTokenPath;
// MCP Method names
exports.MCPMethods = {
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
};
// Resource URIs
exports.MCPResources = {
    STATE: 'browser://state',
    DOM: 'browser://dom',
    TEXT: 'browser://text',
    SCREENSHOT: 'browser://screenshot',
    ACCESSIBILITY: 'browser://accessibility',
    NETWORK: 'browser://network',
    CONSOLE: 'browser://console',
    COOKIES: 'browser://cookies',
    TABS: 'browser://tabs',
};
// Tool names
exports.MCPTools = {
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
};
//# sourceMappingURL=mcp-constants.js.map