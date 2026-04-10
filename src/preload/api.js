"use strict";
// Preload API - Exposes safe APIs to renderer
Object.defineProperty(exports, "__esModule", { value: true });
exports.electronAPI = void 0;
const electron_1 = require("electron");
const ipc_channels_1 = require("../shared/constants/ipc-channels");
exports.electronAPI = {
    // Navigation
    navigate: (url) => electron_1.ipcRenderer.invoke(ipc_channels_1.IPCChannel.NAVIGATE, url),
    goBack: () => electron_1.ipcRenderer.send(ipc_channels_1.IPCChannel.GO_BACK),
    goForward: () => electron_1.ipcRenderer.send(ipc_channels_1.IPCChannel.GO_FORWARD),
    reload: () => electron_1.ipcRenderer.send(ipc_channels_1.IPCChannel.RELOAD),
    stop: () => electron_1.ipcRenderer.send(ipc_channels_1.IPCChannel.STOP),
    // Tabs
    createTab: (url) => electron_1.ipcRenderer.invoke(ipc_channels_1.IPCChannel.CREATE_TAB, url),
    closeTab: (tabId) => electron_1.ipcRenderer.invoke(ipc_channels_1.IPCChannel.CLOSE_TAB, tabId),
    switchTab: (tabId) => electron_1.ipcRenderer.invoke(ipc_channels_1.IPCChannel.SWITCH_TAB, tabId),
    getTabs: () => electron_1.ipcRenderer.invoke(ipc_channels_1.IPCChannel.GET_TABS),
    // State
    getState: () => electron_1.ipcRenderer.invoke(ipc_channels_1.IPCChannel.GET_STATE),
    onStateChanged: (callback) => {
        const handler = (_event, state) => callback(state);
        electron_1.ipcRenderer.on(ipc_channels_1.IPCChannel.STATE_CHANGED, handler);
        return () => electron_1.ipcRenderer.removeListener(ipc_channels_1.IPCChannel.STATE_CHANGED, handler);
    },
    // Window controls
    minimize: () => electron_1.ipcRenderer.send(ipc_channels_1.IPCChannel.MINIMIZE),
    maximize: () => electron_1.ipcRenderer.send(ipc_channels_1.IPCChannel.MAXIMIZE),
    close: () => electron_1.ipcRenderer.send(ipc_channels_1.IPCChannel.CLOSE),
    toggleFullscreen: () => electron_1.ipcRenderer.send(ipc_channels_1.IPCChannel.TOGGLE_FULLSCREEN),
    // Settings
    getSettings: () => electron_1.ipcRenderer.invoke(ipc_channels_1.IPCChannel.GET_SETTINGS),
    setSettings: (settings) => electron_1.ipcRenderer.invoke(ipc_channels_1.IPCChannel.SET_SETTINGS, settings),
    onSettingsChanged: (callback) => {
        const handler = (_event, settings) => callback(settings);
        electron_1.ipcRenderer.on(ipc_channels_1.IPCChannel.SETTINGS_CHANGED, handler);
        return () => electron_1.ipcRenderer.removeListener(ipc_channels_1.IPCChannel.SETTINGS_CHANGED, handler);
    },
    // Theme
    getTheme: () => electron_1.ipcRenderer.invoke(ipc_channels_1.IPCChannel.GET_THEME),
    setTheme: (theme) => electron_1.ipcRenderer.send(ipc_channels_1.IPCChannel.SET_THEME, theme),
    onThemeChanged: (callback) => {
        const handler = (_event, theme) => callback(theme);
        electron_1.ipcRenderer.on(ipc_channels_1.IPCChannel.THEME_CHANGED, handler);
        return () => electron_1.ipcRenderer.removeListener(ipc_channels_1.IPCChannel.THEME_CHANGED, handler);
    },
    // DevTools
    toggleDevTools: () => electron_1.ipcRenderer.send(ipc_channels_1.IPCChannel.TOGGLE_DEVTOOLS),
    // MCP Status
    getMCPStatus: () => electron_1.ipcRenderer.invoke(ipc_channels_1.IPCChannel.MCP_STATUS),
    onMCPStatusChanged: (callback) => {
        const handler = (_event, status) => callback(status);
        electron_1.ipcRenderer.on(ipc_channels_1.IPCChannel.MCP_STATUS, handler);
        return () => electron_1.ipcRenderer.removeListener(ipc_channels_1.IPCChannel.MCP_STATUS, handler);
    },
};
//# sourceMappingURL=api.js.map