"use strict";
// IPC Channels for Electron communication
Object.defineProperty(exports, "__esModule", { value: true });
exports.IPCChannel = void 0;
var IPCChannel;
(function (IPCChannel) {
    // Navigation
    IPCChannel["NAVIGATE"] = "navigate";
    IPCChannel["GO_BACK"] = "go-back";
    IPCChannel["GO_FORWARD"] = "go-forward";
    IPCChannel["RELOAD"] = "reload";
    IPCChannel["STOP"] = "stop";
    // State
    IPCChannel["GET_STATE"] = "get-state";
    IPCChannel["STATE_CHANGED"] = "state-changed";
    // Content
    IPCChannel["GET_DOM"] = "get-dom";
    IPCChannel["GET_TEXT"] = "get-text";
    IPCChannel["GET_SCREENSHOT"] = "get-screenshot";
    IPCChannel["EXECUTE_JS"] = "execute-js";
    // Tabs
    IPCChannel["CREATE_TAB"] = "create-tab";
    IPCChannel["CLOSE_TAB"] = "close-tab";
    IPCChannel["SWITCH_TAB"] = "switch-tab";
    IPCChannel["UPDATE_TAB"] = "update-tab";
    IPCChannel["GET_TABS"] = "get-tabs";
    // AI/MCP
    IPCChannel["AI_ACTION"] = "ai-action";
    IPCChannel["AI_EVENT"] = "ai-event";
    IPCChannel["MCP_STATUS"] = "mcp-status";
    // Settings
    IPCChannel["GET_SETTINGS"] = "get-settings";
    IPCChannel["SET_SETTINGS"] = "set-settings";
    IPCChannel["SETTINGS_CHANGED"] = "settings-changed";
    // Window
    IPCChannel["MINIMIZE"] = "minimize";
    IPCChannel["MAXIMIZE"] = "maximize";
    IPCChannel["CLOSE"] = "close";
    IPCChannel["TOGGLE_FULLSCREEN"] = "toggle-fullscreen";
    // DevTools
    IPCChannel["TOGGLE_DEVTOOLS"] = "toggle-devtools";
    // Theme
    IPCChannel["GET_THEME"] = "get-theme";
    IPCChannel["SET_THEME"] = "set-theme";
    IPCChannel["THEME_CHANGED"] = "theme-changed";
})(IPCChannel || (exports.IPCChannel = IPCChannel = {}));
exports.default = IPCChannel;
//# sourceMappingURL=ipc-channels.js.map