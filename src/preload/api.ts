// Preload API - Exposes safe APIs to renderer

import { ipcRenderer, IpcRendererEvent } from 'electron';
import { IPCChannel } from '../shared/constants/ipc-channels';
import { Tab, TabGroup, BrowserState } from '../shared/types/browser';
import { AppSettings } from '../shared/types/settings';
import { Theme, ThemeCustomizations } from '../shared/types/theme';
import { ExtensionInfo } from '../shared/types/extension';

export interface ElectronAPI {
  // Navigation
  navigate: (url: string) => Promise<void>;
  goBack: () => void;
  goForward: () => void;
  reload: () => void;
  stop: () => void;

  // Tabs
  createTab: (url?: string) => Promise<Tab>;
  closeTab: (tabId: string) => Promise<boolean>;
  switchTab: (tabId: string) => Promise<boolean>;
  getTabs: () => Promise<Tab[]>;

  // Tab Groups
  createTabGroup: (name: string, color: string, tabIds?: string[]) => Promise<TabGroup>;
  deleteTabGroup: (groupId: string) => Promise<boolean>;
  updateTabGroup: (groupId: string, updates: { name?: string; color?: string }) => Promise<TabGroup | null>;
  addTabToGroup: (tabId: string, groupId: string) => Promise<boolean>;
  removeTabFromGroup: (tabId: string) => Promise<boolean>;
  getTabGroups: () => Promise<TabGroup[]>;
  toggleGroupCollapse: (groupId: string) => Promise<boolean>;

  // State
  getState: () => Promise<BrowserState>;
  onStateChanged: (callback: (state: BrowserState) => void) => () => void;

  // Window controls
  minimize: () => void;
  maximize: () => void;
  close: () => void;
  toggleFullscreen: () => void;

  // Settings
  getSettings: () => Promise<AppSettings>;
  setSettings: (settings: Partial<AppSettings>) => Promise<void>;
  onSettingsChanged: (callback: (settings: AppSettings) => void) => () => void;
  setOverlayVisible: (options: { visible: boolean; type: 'fullpage' | 'dropdown' }) => void;
  showAppMenu: (position: { x: number; y: number }) => void;
  onOpenSettings: (callback: () => void) => () => void;

  // Theme
  getTheme: () => Promise<string>;
  setTheme: (theme: 'dark' | 'light' | 'system' | string) => void;
  onThemeChanged: (callback: (theme: string) => void) => () => void;
  getThemeCSS: () => Promise<{ cssVars: Record<string, string>; type: 'dark' | 'light' }>;
  onThemeCSSUpdated: (callback: (data: { cssVars: Record<string, string>; type: 'dark' | 'light' }) => void) => () => void;
  getAllThemes: () => Promise<Theme[]>;
  getThemeCustomizations: () => Promise<ThemeCustomizations>;
  setThemeCustomizations: (customizations: ThemeCustomizations) => Promise<void>;
  setColorToken: (token: string, value: string) => Promise<void>;
  resetColorToken: (token: string) => Promise<void>;
  resetAllCustomizations: () => Promise<void>;
  importTheme: (filePath: string) => Promise<Theme | null>;
  exportTheme: (filePath: string) => Promise<boolean>;
  createTheme: (options: { newThemeName: string; baseThemeName: string; }) => Promise<Theme | null>;
  showOpenDialog: () => Promise<string | null>;
  showSaveDialog: () => Promise<string | null>;

  // DevTools
  toggleDevTools: () => void;

  // AI Panel
  toggleAIPanel: () => Promise<boolean>;
  onAIPanelChanged: (callback: (visible: boolean) => void) => () => void;

  // MCP Status
  getMCPStatus: () => Promise<{ isRunning: boolean; port: number; clientCount: number }>;
  onMCPStatusChanged: (callback: (status: { isRunning: boolean; port: number; clientCount: number }) => void) => () => void;

  // Color Picker
  showColorPicker: (options: { groupId: string; currentColor: string; currentName: string; x: number; y: number }) => void;
  onColorPickerResult: (callback: (result: { groupId: string; color?: string; name?: string }) => void) => () => void;

  // External AI Apps
  openAIInTerminal: (aiCommand: string, workingDir?: string) => Promise<{ success: boolean; error?: string }>;
  openAIInVSCode: (aiCommand: string, workingDir?: string) => Promise<{ success: boolean; error?: string }>;
  selectFolder: () => Promise<string | null>;
  listFolders: (dirPath: string) => Promise<{ name: string; path: string; isDirectory: boolean }[]>;
  getUserHome: () => Promise<string>;

  // Extensions
  getExtensions: () => Promise<ExtensionInfo[]>;
  installExtension: (folderPath: string) => Promise<ExtensionInfo>;
  installExtensionCRX: (crxPath: string) => Promise<ExtensionInfo>;
  uninstallExtension: (extensionId: string) => Promise<boolean>;
  enableExtension: (extensionId: string) => Promise<void>;
  disableExtension: (extensionId: string) => Promise<void>;
  onExtensionInstalled: (callback: (extension: ExtensionInfo) => void) => () => void;
  onExtensionRemoved: (callback: (extensionId: string) => void) => () => void;
  onExtensionUpdated: (callback: (data: { id: string; enabled: boolean }) => void) => () => void;
}

export const electronAPI: ElectronAPI = {
  // Navigation
  navigate: (url: string) => ipcRenderer.invoke(IPCChannel.NAVIGATE, url),
  goBack: () => ipcRenderer.send(IPCChannel.GO_BACK),
  goForward: () => ipcRenderer.send(IPCChannel.GO_FORWARD),
  reload: () => ipcRenderer.send(IPCChannel.RELOAD),
  stop: () => ipcRenderer.send(IPCChannel.STOP),

  // Tabs
  createTab: (url?: string) => ipcRenderer.invoke(IPCChannel.CREATE_TAB, url),
  closeTab: (tabId: string) => ipcRenderer.invoke(IPCChannel.CLOSE_TAB, tabId),
  switchTab: (tabId: string) => ipcRenderer.invoke(IPCChannel.SWITCH_TAB, tabId),
  getTabs: () => ipcRenderer.invoke(IPCChannel.GET_TABS),

  // Tab Groups
  createTabGroup: (name: string, color: string, tabIds?: string[]) =>
    ipcRenderer.invoke(IPCChannel.CREATE_TAB_GROUP, name, color, tabIds),
  deleteTabGroup: (groupId: string) =>
    ipcRenderer.invoke(IPCChannel.DELETE_TAB_GROUP, groupId),
  updateTabGroup: (groupId: string, updates: { name?: string; color?: string }) =>
    ipcRenderer.invoke(IPCChannel.UPDATE_TAB_GROUP, groupId, updates),
  addTabToGroup: (tabId: string, groupId: string) =>
    ipcRenderer.invoke(IPCChannel.ADD_TAB_TO_GROUP, tabId, groupId),
  removeTabFromGroup: (tabId: string) =>
    ipcRenderer.invoke(IPCChannel.REMOVE_TAB_FROM_GROUP, tabId),
  getTabGroups: () => ipcRenderer.invoke(IPCChannel.GET_TAB_GROUPS),
  toggleGroupCollapse: (groupId: string) =>
    ipcRenderer.invoke(IPCChannel.TOGGLE_GROUP_COLLAPSE, groupId),

  // State
  getState: () => ipcRenderer.invoke(IPCChannel.GET_STATE),
  onStateChanged: (callback) => {
    const handler = (_event: IpcRendererEvent, state: BrowserState) => callback(state);
    ipcRenderer.on(IPCChannel.STATE_CHANGED, handler);
    return () => ipcRenderer.removeListener(IPCChannel.STATE_CHANGED, handler);
  },

  // Window controls
  minimize: () => ipcRenderer.send(IPCChannel.MINIMIZE),
  maximize: () => ipcRenderer.send(IPCChannel.MAXIMIZE),
  close: () => ipcRenderer.send(IPCChannel.CLOSE),
  toggleFullscreen: () => ipcRenderer.send(IPCChannel.TOGGLE_FULLSCREEN),

  // Settings
  getSettings: () => ipcRenderer.invoke(IPCChannel.GET_SETTINGS),
  setSettings: (settings) => ipcRenderer.invoke(IPCChannel.SET_SETTINGS, settings),
  onSettingsChanged: (callback) => {
    const handler = (_event: IpcRendererEvent, settings: AppSettings) => callback(settings);
    ipcRenderer.on(IPCChannel.SETTINGS_CHANGED, handler);
    return () => ipcRenderer.removeListener(IPCChannel.SETTINGS_CHANGED, handler);
  },
  setOverlayVisible: (options) => ipcRenderer.send(IPCChannel.SET_OVERLAY_VISIBLE, options),
  showAppMenu: (position) => ipcRenderer.send(IPCChannel.SHOW_APP_MENU, position),
  onOpenSettings: (callback) => {
    const handler = () => callback();
    ipcRenderer.on('open-settings', handler);
    return () => ipcRenderer.removeListener('open-settings', handler);
  },

  // Theme
  getTheme: () => ipcRenderer.invoke(IPCChannel.GET_THEME),
  setTheme: (theme) => ipcRenderer.send(IPCChannel.SET_THEME, theme),
  onThemeChanged: (callback) => {
    const handler = (_event: IpcRendererEvent, theme: string) => callback(theme);
    ipcRenderer.on(IPCChannel.THEME_CHANGED, handler);
    return () => ipcRenderer.removeListener(IPCChannel.THEME_CHANGED, handler);
  },
  getThemeCSS: () => ipcRenderer.invoke(IPCChannel.GET_THEME_CSS),
  onThemeCSSUpdated: (callback) => {
    const handler = (_event: IpcRendererEvent, data: { cssVars: Record<string, string>; type: 'dark' | 'light' }) => callback(data);
    ipcRenderer.on(IPCChannel.THEME_CSS_UPDATED, handler);
    return () => ipcRenderer.removeListener(IPCChannel.THEME_CSS_UPDATED, handler);
  },
  getAllThemes: () => ipcRenderer.invoke(IPCChannel.GET_ALL_THEMES),
  getThemeCustomizations: () => ipcRenderer.invoke(IPCChannel.GET_THEME_CUSTOMIZATIONS),
  setThemeCustomizations: (customizations) => ipcRenderer.invoke(IPCChannel.SET_THEME_CUSTOMIZATIONS, customizations),
  setColorToken: (token, value) => ipcRenderer.invoke(IPCChannel.SET_COLOR_TOKEN, token, value),
  resetColorToken: (token) => ipcRenderer.invoke(IPCChannel.RESET_COLOR_TOKEN, token),
  resetAllCustomizations: () => ipcRenderer.invoke(IPCChannel.RESET_ALL_CUSTOMIZATIONS),
  importTheme: (filePath) => ipcRenderer.invoke(IPCChannel.IMPORT_THEME, filePath),
  exportTheme: (filePath) => ipcRenderer.invoke(IPCChannel.EXPORT_THEME, filePath),
  createTheme: (options) => ipcRenderer.invoke(IPCChannel.CREATE_THEME, options),
  showOpenDialog: () => ipcRenderer.invoke(IPCChannel.SHOW_OPEN_DIALOG),
  showSaveDialog: () => ipcRenderer.invoke(IPCChannel.SHOW_SAVE_DIALOG),

  // DevTools
  toggleDevTools: () => ipcRenderer.send(IPCChannel.TOGGLE_DEVTOOLS),

  // AI Panel
  toggleAIPanel: () => ipcRenderer.invoke(IPCChannel.TOGGLE_AI_PANEL),
  onAIPanelChanged: (callback) => {
    const handler = (_event: IpcRendererEvent, visible: boolean) => callback(visible);
    ipcRenderer.on(IPCChannel.AI_PANEL_CHANGED, handler);
    return () => ipcRenderer.removeListener(IPCChannel.AI_PANEL_CHANGED, handler);
  },

  // MCP Status
  getMCPStatus: () => ipcRenderer.invoke(IPCChannel.MCP_STATUS),
  onMCPStatusChanged: (callback) => {
    const handler = (_event: IpcRendererEvent, status: { isRunning: boolean; port: number; clientCount: number }) => callback(status);
    ipcRenderer.on(IPCChannel.MCP_STATUS, handler);
    return () => ipcRenderer.removeListener(IPCChannel.MCP_STATUS, handler);
  },

  // Color Picker
  showColorPicker: (options) => ipcRenderer.send(IPCChannel.SHOW_COLOR_PICKER, options),
  onColorPickerResult: (callback) => {
    const handler = (_event: IpcRendererEvent, result: { groupId: string; color: string }) => callback(result);
    ipcRenderer.on(IPCChannel.COLOR_PICKER_RESULT, handler);
    return () => ipcRenderer.removeListener(IPCChannel.COLOR_PICKER_RESULT, handler);
  },

  // External AI Apps
  openAIInTerminal: (aiCommand: string, workingDir?: string) => ipcRenderer.invoke(IPCChannel.OPEN_AI_IN_TERMINAL, aiCommand, workingDir),
  openAIInVSCode: (aiCommand: string, workingDir?: string) => ipcRenderer.invoke(IPCChannel.OPEN_AI_IN_VSCODE, aiCommand, workingDir),
  selectFolder: () => ipcRenderer.invoke(IPCChannel.SELECT_FOLDER),
  listFolders: (dirPath: string) => ipcRenderer.invoke(IPCChannel.LIST_FOLDERS, dirPath),
  getUserHome: () => ipcRenderer.invoke(IPCChannel.GET_USER_HOME),

  // Extensions
  getExtensions: () => ipcRenderer.invoke(IPCChannel.EXTENSION_GET_ALL),
  installExtension: (folderPath: string) => ipcRenderer.invoke(IPCChannel.EXTENSION_INSTALL, folderPath),
  installExtensionCRX: (crxPath: string) => ipcRenderer.invoke(IPCChannel.EXTENSION_INSTALL_CRX, crxPath),
  uninstallExtension: (extensionId: string) => ipcRenderer.invoke(IPCChannel.EXTENSION_UNINSTALL, extensionId),
  enableExtension: (extensionId: string) => ipcRenderer.invoke(IPCChannel.EXTENSION_ENABLE, extensionId),
  disableExtension: (extensionId: string) => ipcRenderer.invoke(IPCChannel.EXTENSION_DISABLE, extensionId),
  onExtensionInstalled: (callback) => {
    const handler = (_event: IpcRendererEvent, extension: ExtensionInfo) => callback(extension);
    ipcRenderer.on(IPCChannel.EXTENSION_INSTALLED, handler);
    return () => ipcRenderer.removeListener(IPCChannel.EXTENSION_INSTALLED, handler);
  },
  onExtensionRemoved: (callback) => {
    const handler = (_event: IpcRendererEvent, extensionId: string) => callback(extensionId);
    ipcRenderer.on(IPCChannel.EXTENSION_REMOVED, handler);
    return () => ipcRenderer.removeListener(IPCChannel.EXTENSION_REMOVED, handler);
  },
  onExtensionUpdated: (callback) => {
    const handler = (_event: IpcRendererEvent, data: { id: string; enabled: boolean }) => callback(data);
    ipcRenderer.on(IPCChannel.EXTENSION_UPDATED, handler);
    return () => ipcRenderer.removeListener(IPCChannel.EXTENSION_UPDATED, handler);
  },
};
