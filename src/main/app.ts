// App Initialization

import { ipcMain, BrowserWindow, dialog, app } from 'electron';
import { spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { windowManager } from './window';
import { tabManager } from './tabs';
import { mcpServer } from './bridge';
import { settingsManager, themeManager } from './settings';
import { extensionManager } from './extensions';
import { IPCChannel } from '../shared/constants/ipc-channels';
import { ThemeSetting } from '../shared/types/theme';
import { logger } from './utils/logger';

export class App {
  private mainWindow: BrowserWindow | null = null;

  async initialize(): Promise<void> {
    logger.info('Initializing application...');

    // Create main window
    this.mainWindow = await windowManager.createMainWindow();

    // Set window reference in tab manager
    tabManager.setWindow(this.mainWindow);

    // Setup IPC handlers
    this.setupIPCHandlers();

    // Setup window resize handling
    this.setupWindowEvents();

    // Create initial tab
    tabManager.createTab();

    // Ensure initial bounds are set correctly
    this.updateTabBounds();

    // Start MCP server
    await mcpServer.start();

    // Load persisted extensions
    await extensionManager.loadPersistedExtensions();

    // Setup Chrome Web Store download interception
    extensionManager.setupWebStoreInterception();

    logger.info('Application initialized');
  }

  private setupIPCHandlers(): void {
    // Navigation
    ipcMain.handle(IPCChannel.NAVIGATE, async (_event, url: string) => {
      await tabManager.navigate(url);
    });

    ipcMain.on(IPCChannel.GO_BACK, () => tabManager.goBack());
    ipcMain.on(IPCChannel.GO_FORWARD, () => tabManager.goForward());
    ipcMain.on(IPCChannel.RELOAD, () => tabManager.reload());
    ipcMain.on(IPCChannel.STOP, () => tabManager.stop());

    // Tabs
    ipcMain.handle(IPCChannel.CREATE_TAB, async (_event, url?: string) => {
      const tab = tabManager.createTab(url);
      return tab.state;
    });

    ipcMain.handle(IPCChannel.CLOSE_TAB, async (_event, tabId: string) => {
      return tabManager.closeTab(tabId);
    });

    ipcMain.handle(IPCChannel.SWITCH_TAB, async (_event, tabId: string) => {
      return tabManager.switchToTab(tabId);
    });

    ipcMain.handle(IPCChannel.GET_TABS, async () => {
      return tabManager.getAllTabs();
    });

    // Tab Groups
    ipcMain.handle(IPCChannel.CREATE_TAB_GROUP, async (_event, name: string, color: string, tabIds?: string[]) => {
      return tabManager.createGroup(name, color, tabIds);
    });

    ipcMain.handle(IPCChannel.DELETE_TAB_GROUP, async (_event, groupId: string) => {
      return tabManager.deleteGroup(groupId);
    });

    ipcMain.handle(IPCChannel.UPDATE_TAB_GROUP, async (_event, groupId: string, updates: { name?: string; color?: string }) => {
      return tabManager.updateGroup(groupId, updates);
    });

    ipcMain.handle(IPCChannel.ADD_TAB_TO_GROUP, async (_event, tabId: string, groupId: string) => {
      return tabManager.addTabToGroup(tabId, groupId);
    });

    ipcMain.handle(IPCChannel.REMOVE_TAB_FROM_GROUP, async (_event, tabId: string) => {
      return tabManager.removeTabFromGroup(tabId);
    });

    ipcMain.handle(IPCChannel.GET_TAB_GROUPS, async () => {
      return tabManager.getTabGroups();
    });

    ipcMain.handle(IPCChannel.TOGGLE_GROUP_COLLAPSE, async (_event, groupId: string) => {
      return tabManager.toggleGroupCollapse(groupId);
    });

    // State
    ipcMain.handle(IPCChannel.GET_STATE, async () => {
      const activeTab = tabManager.getActiveTab();
      return {
        window: windowManager.getState(),
        tabs: tabManager.getAllTabs(),
        tabGroups: tabManager.getTabGroups(),
        activeTabId: tabManager.getActiveTabId(),
        canGoBack: tabManager.canGoBack(),
        canGoForward: tabManager.canGoForward(),
        isLoading: activeTab?.state.isLoading || false,
        mcpConnections: mcpServer.getConnections(),
        theme: settingsManager.getTheme(),
        aiPanelVisible: settingsManager.isAIPanelVisible(),
      };
    });

    // Window controls
    ipcMain.on(IPCChannel.MINIMIZE, () => windowManager.minimize());
    ipcMain.on(IPCChannel.MAXIMIZE, () => windowManager.maximize());
    ipcMain.on(IPCChannel.CLOSE, () => windowManager.close());
    ipcMain.on(IPCChannel.TOGGLE_FULLSCREEN, () => windowManager.toggleFullscreen());

    // Settings
    ipcMain.handle(IPCChannel.GET_SETTINGS, async () => {
      return settingsManager.getAll();
    });

    ipcMain.handle(IPCChannel.SET_SETTINGS, async (_event, settings) => {
      settingsManager.setAll(settings);
      this.mainWindow?.webContents.send(IPCChannel.SETTINGS_CHANGED, settingsManager.getAll());
    });

    // Theme
    ipcMain.handle(IPCChannel.GET_THEME, async () => {
      return settingsManager.getTheme();
    });

    ipcMain.on(IPCChannel.SET_THEME, (_event, theme: ThemeSetting) => {
      themeManager.setTheme(theme);
      this.mainWindow?.webContents.send(IPCChannel.THEME_CHANGED, theme);
      // Also send CSS variables update
      const cssVars = themeManager.getCSSVariables();
      const currentTheme = themeManager.getCurrentTheme();
      this.mainWindow?.webContents.send(IPCChannel.THEME_CSS_UPDATED, {
        cssVars,
        type: currentTheme.type
      });
    });

    ipcMain.handle(IPCChannel.GET_THEME_CSS, async () => {
      const cssVars = themeManager.getCSSVariables();
      const currentTheme = themeManager.getCurrentTheme();
      return { cssVars, type: currentTheme.type };
    });

    ipcMain.handle(IPCChannel.GET_ALL_THEMES, async () => {
      return themeManager.getAllThemes();
    });

    ipcMain.handle(IPCChannel.GET_THEME_CUSTOMIZATIONS, async () => {
      return themeManager.getCustomizations();
    });

    ipcMain.handle(IPCChannel.SET_THEME_CUSTOMIZATIONS, async (_event, customizations) => {
      themeManager.setCustomizations(customizations);
    });

    ipcMain.handle(IPCChannel.SET_COLOR_TOKEN, async (_event, token: string, value: string) => {
      themeManager.setColorToken(token, value);
    });

    ipcMain.handle(IPCChannel.RESET_COLOR_TOKEN, async (_event, token: string) => {
      themeManager.resetColorToken(token);
    });

    ipcMain.handle(IPCChannel.RESET_ALL_CUSTOMIZATIONS, async () => {
      themeManager.resetCustomizations();
    });

    ipcMain.handle(IPCChannel.IMPORT_THEME, async (_event, filePath: string) => {
      return themeManager.importTheme(filePath);
    });

    ipcMain.handle(IPCChannel.EXPORT_THEME, async (_event, filePath: string) => {
      return themeManager.exportTheme(filePath);
    });

    ipcMain.handle(IPCChannel.CREATE_THEME, async (_event, { newThemeName, baseThemeName }: { newThemeName: string, baseThemeName: string }) => {
      return themeManager.createTheme(newThemeName, baseThemeName);
    });

    // Dialogs
    ipcMain.handle(IPCChannel.SHOW_OPEN_DIALOG, async (event) => {
      const window = BrowserWindow.fromWebContents(event.sender);
      if (!window) return null;
      const { canceled, filePaths } = await dialog.showOpenDialog(window, {
        properties: ['openFile'],
        filters: [{ name: 'Themes', extensions: ['json'] }],
      });
      return canceled ? null : filePaths[0];
    });

    ipcMain.handle(IPCChannel.SHOW_SAVE_DIALOG, async (event) => {
      const window = BrowserWindow.fromWebContents(event.sender);
      if (!window) return null;
      const { canceled, filePath } = await dialog.showSaveDialog(window, {
        filters: [{ name: 'Theme JSON', extensions: ['json'] }],
      });
      return canceled ? null : filePath;
    });

    // DevTools
    ipcMain.on(IPCChannel.TOGGLE_DEVTOOLS, () => {
      const activeTab = tabManager.getActiveTab();
      if (activeTab) {
        if (activeTab.webContents.isDevToolsOpened()) {
          activeTab.webContents.closeDevTools();
        } else {
          activeTab.webContents.openDevTools();
        }
      }
    });

    // AI Panel
    ipcMain.handle(IPCChannel.TOGGLE_AI_PANEL, async () => {
      const currentVisible = settingsManager.isAIPanelVisible();
      const newVisible = !currentVisible;
      settingsManager.setAIPanelVisible(newVisible);
      this.mainWindow?.webContents.send(IPCChannel.AI_PANEL_CHANGED, newVisible);
      // Update BrowserView bounds to account for panel width change
      this.updateTabBounds();
      logger.debug('AI Panel toggled', { visible: newVisible });
      return newVisible;
    });

    // Open main window DevTools for debugging
    ipcMain.on('open-main-devtools', () => {
      this.mainWindow?.webContents.openDevTools();
    });

    // MCP Status
    ipcMain.handle(IPCChannel.MCP_STATUS, async () => {
      return {
        isRunning: mcpServer.isActive(),
        port: mcpServer.getPort(),
        clientCount: mcpServer.getClientCount(),
      };
    });

    // Overlay visibility - hide/show BrowserView based on overlay type
    ipcMain.on(IPCChannel.SET_OVERLAY_VISIBLE, (_event, options: { visible: boolean; type: 'fullpage' | 'dropdown' }) => {
      const { visible, type } = options;
      // For both fullpage and dropdown, hide BrowserView completely
      // BrowserView always renders on top, so hiding is the only solution
      if (visible) {
        tabManager.hideActiveView();
      } else {
        tabManager.showActiveView();
      }
      logger.debug('Overlay visibility changed', { visible, type });
    });

    // Custom themed popup menu
    let menuWindow: BrowserWindow | null = null;

    ipcMain.on(IPCChannel.SHOW_APP_MENU, (event, position: { x: number; y: number }) => {
      const parentWindow = BrowserWindow.fromWebContents(event.sender);
      if (!parentWindow) return;

      // Close existing menu if open
      if (menuWindow && !menuWindow.isDestroyed()) {
        menuWindow.close();
        menuWindow = null;
        return;
      }

      // Get parent window position
      const parentBounds = parentWindow.getBounds();

      // Create popup menu window
      menuWindow = new BrowserWindow({
        width: 220,
        height: 340,
        x: parentBounds.x + position.x,
        y: parentBounds.y + position.y,
        frame: false,
        transparent: true,
        resizable: false,
        movable: false,
        minimizable: false,
        maximizable: false,
        alwaysOnTop: true,
        skipTaskbar: true,
        parent: parentWindow,
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true,
        },
      });

      // Get current theme colors
      const cssVars = themeManager.getCSSVariables();
      const bgSecondary = cssVars['--color-bg-secondary'] || '#252536';
      const bgTertiary = cssVars['--color-bg-tertiary'] || '#313244';
      const fgPrimary = cssVars['--color-fg-primary'] || '#cdd6f4';
      const fgMuted = cssVars['--color-fg-muted'] || '#6c7086';
      const borderDefault = cssVars['--color-border-default'] || '#313244';

      // Generate menu HTML with theme colors
      const menuHTML = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              font-size: 13px;
              background: transparent;
              user-select: none;
              -webkit-app-region: no-drag;
            }
            .menu {
              background: ${bgSecondary};
              border: 1px solid ${borderDefault};
              border-radius: 8px;
              padding: 4px 0;
              box-shadow: 0 8px 32px rgba(0,0,0,0.4);
            }
            .item {
              display: flex;
              align-items: center;
              padding: 8px 12px;
              color: ${fgPrimary};
              cursor: pointer;
              gap: 12px;
            }
            .item:hover { background: ${bgTertiary}; }
            .item.disabled { color: ${fgMuted}; cursor: not-allowed; }
            .item.disabled:hover { background: transparent; }
            .shortcut { margin-left: auto; color: ${fgMuted}; font-size: 11px; }
            .separator { height: 1px; background: ${borderDefault}; margin: 4px 0; }
            .icon { width: 16px; height: 16px; opacity: 0.8; }
          </style>
        </head>
        <body>
          <div class="menu">
            <div class="item" data-action="new-tab">
              <svg class="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
              New Tab
              <span class="shortcut">Ctrl+T</span>
            </div>
            <div class="item disabled">
              <svg class="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
              New Window
              <span class="shortcut">Ctrl+N</span>
            </div>
            <div class="separator"></div>
            <div class="item disabled">
              <svg class="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              History
              <span class="shortcut">Ctrl+H</span>
            </div>
            <div class="item disabled">
              <svg class="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
              Downloads
              <span class="shortcut">Ctrl+J</span>
            </div>
            <div class="item disabled">
              <svg class="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/></svg>
              Bookmarks
              <span class="shortcut">Ctrl+B</span>
            </div>
            <div class="separator"></div>
            <div class="item" data-action="settings">
              <svg class="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
              Settings
            </div>
            <div class="item disabled">
              <svg class="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              About eaight
            </div>
            <div class="separator"></div>
            <div class="item" data-action="exit">
              <svg class="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
              Exit
              <span class="shortcut">Alt+F4</span>
            </div>
          </div>
          <script>
            document.querySelectorAll('.item:not(.disabled)').forEach(item => {
              item.addEventListener('click', () => {
                const action = item.dataset.action;
                if (action) {
                  window.postMessage({ type: 'menu-action', action }, '*');
                }
              });
            });
            // Close on click outside
            window.addEventListener('blur', () => {
              window.postMessage({ type: 'menu-action', action: 'close' }, '*');
            });
            // Close on escape
            document.addEventListener('keydown', (e) => {
              if (e.key === 'Escape') {
                window.postMessage({ type: 'menu-action', action: 'close' }, '*');
              }
            });
          </script>
        </body>
        </html>
      `;

      menuWindow.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(menuHTML));

      // Handle menu actions
      menuWindow.webContents.on('console-message', (_e, _level, message) => {
        try {
          const data = JSON.parse(message);
          if (data.type === 'menu-action') {
            this.handleMenuAction(data.action);
            if (menuWindow && !menuWindow.isDestroyed()) {
              menuWindow.close();
              menuWindow = null;
            }
          }
        } catch { /* ignore parse errors */ }
      });

      // Use executeJavaScript to listen for postMessage
      menuWindow.webContents.on('did-finish-load', () => {
        menuWindow?.webContents.executeJavaScript(`
          window.addEventListener('message', (e) => {
            if (e.data.type === 'menu-action') {
              console.log(JSON.stringify(e.data));
            }
          });
        `);
      });

      // Close when losing focus
      menuWindow.on('blur', () => {
        if (menuWindow && !menuWindow.isDestroyed()) {
          menuWindow.close();
          menuWindow = null;
        }
      });
    });

    // Color picker popup window with 7 preset colors + custom picker + rename field
    let colorPickerWindow: BrowserWindow | null = null;

    ipcMain.on(IPCChannel.SHOW_COLOR_PICKER, (event, options: { groupId: string; currentColor: string; currentName: string; x: number; y: number }) => {
      const parentWindow = BrowserWindow.fromWebContents(event.sender);
      if (!parentWindow) return;

      // Close existing color picker if open
      if (colorPickerWindow && !colorPickerWindow.isDestroyed()) {
        colorPickerWindow.close();
        colorPickerWindow = null;
        return;
      }

      const parentBounds = parentWindow.getBounds();

      // 7 preset colors from theme + custom picker = 8 items in 1 row + rename field
      colorPickerWindow = new BrowserWindow({
        width: 290,
        height: 90,
        x: parentBounds.x + options.x,
        y: parentBounds.y + options.y,
        frame: false,
        transparent: true,
        resizable: false,
        movable: false,
        minimizable: false,
        maximizable: false,
        alwaysOnTop: true,
        skipTaskbar: true,
        parent: parentWindow,
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true,
        },
      });

      // 7 colors from theme
      const presetColors = [
        '#25ced1', // accent-primary (cyan)
        '#ea526f', // accent-secondary (pink)
        '#ff8a5b', // accent-tertiary (orange)
        '#4ade80', // success (green)
        '#fbbf24', // warning (yellow)
        '#f87171', // error (red)
        '#60a5fa', // info (blue)
      ];

      // Escape the name for HTML
      const escapedName = (options.currentName || '').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

      const colorPickerHTML = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              background: transparent;
              display: flex;
              align-items: flex-start;
              justify-content: flex-start;
              height: 100vh;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            }
            .picker-container {
              background: rgba(20, 20, 35, 0.95);
              backdrop-filter: blur(10px);
              border: 1px solid rgba(255,255,255,0.1);
              border-radius: 12px;
              padding: 10px;
              box-shadow: 0 8px 32px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05);
              display: flex;
              flex-direction: column;
              gap: 10px;
            }
            .name-input {
              background: rgba(255,255,255,0.08);
              border: 1px solid rgba(255,255,255,0.15);
              border-radius: 6px;
              padding: 6px 10px;
              color: #fff;
              font-size: 13px;
              outline: none;
              width: 100%;
            }
            .name-input:focus {
              border-color: ${options.currentColor};
              box-shadow: 0 0 0 2px ${options.currentColor}40;
            }
            .name-input::placeholder {
              color: rgba(255,255,255,0.4);
            }
            .colors-row {
              display: flex;
              gap: 8px;
            }
            .color-btn {
              width: 24px;
              height: 24px;
              border-radius: 6px;
              border: none;
              cursor: pointer;
              transition: all 0.15s ease;
              position: relative;
            }
            .color-btn::after {
              content: '';
              position: absolute;
              inset: -2px;
              border-radius: 8px;
              border: 2px solid transparent;
              transition: border-color 0.15s;
            }
            .color-btn:hover {
              transform: scale(1.1);
            }
            .color-btn:hover::after {
              border-color: rgba(255,255,255,0.4);
            }
            .color-btn.selected::after {
              border-color: #fff;
            }
            .custom-picker {
              width: 24px;
              height: 24px;
              border-radius: 6px;
              cursor: pointer;
              background: conic-gradient(from 0deg, #ff0000, #ff8800, #ffff00, #00ff00, #00ffff, #0088ff, #ff00ff, #ff0000);
              position: relative;
              overflow: hidden;
              transition: transform 0.15s;
            }
            .custom-picker:hover {
              transform: scale(1.1);
            }
            .custom-picker input {
              position: absolute;
              width: 100%;
              height: 100%;
              opacity: 0;
              cursor: pointer;
            }
          </style>
        </head>
        <body>
          <div class="picker-container">
            <input type="text" class="name-input" id="nameInput" placeholder="Group name..." value="${escapedName}" />
            <div class="colors-row">
              ${presetColors.map(color => `
                <button class="color-btn ${color.toLowerCase() === options.currentColor.toLowerCase() ? 'selected' : ''}"
                        style="background: ${color}; box-shadow: 0 2px 8px ${color}80;"
                        data-color="${color}"></button>
              `).join('')}
              <div class="custom-picker" title="Custom color">
                <input type="color" id="customPicker" value="${options.currentColor}">
              </div>
            </div>
          </div>
          <script>
            const groupId = '${options.groupId}';
            const nameInput = document.getElementById('nameInput');

            // Auto-focus the name input
            nameInput.focus();
            nameInput.select();

            // Name input - send on Enter or blur
            nameInput.addEventListener('keydown', (e) => {
              if (e.key === 'Enter') {
                const name = nameInput.value.trim();
                if (name) {
                  window.postMessage({ type: 'name-changed', name, groupId }, '*');
                }
              } else if (e.key === 'Escape') {
                window.postMessage({ type: 'close' }, '*');
              }
            });

            nameInput.addEventListener('blur', () => {
              const name = nameInput.value.trim();
              if (name && name !== '${escapedName}') {
                window.postMessage({ type: 'name-changed', name, groupId }, '*');
              }
            });

            // Preset color buttons
            document.querySelectorAll('.color-btn').forEach(btn => {
              btn.addEventListener('click', () => {
                const color = btn.dataset.color;
                window.postMessage({ type: 'color-selected', color, groupId }, '*');
              });
            });

            // Custom color picker
            const customPicker = document.getElementById('customPicker');
            customPicker.addEventListener('input', (e) => {
              window.postMessage({ type: 'color-change', color: e.target.value, groupId }, '*');
            });
            customPicker.addEventListener('change', (e) => {
              window.postMessage({ type: 'color-selected', color: e.target.value, groupId }, '*');
            });
          </script>
        </body>
        </html>
      `;

      colorPickerWindow.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(colorPickerHTML));

      colorPickerWindow.webContents.on('did-finish-load', () => {
        colorPickerWindow?.webContents.executeJavaScript(`
          window.addEventListener('message', (e) => {
            if (e.data.type === 'color-change' || e.data.type === 'color-selected' || e.data.type === 'name-changed' || e.data.type === 'close') {
              console.log(JSON.stringify(e.data));
            }
          });
        `);
      });

      colorPickerWindow.webContents.on('console-message', (_e, _level, message) => {
        try {
          const data = JSON.parse(message);
          if (data.type === 'color-change' || data.type === 'color-selected') {
            // Send the color back to renderer
            parentWindow.webContents.send(IPCChannel.COLOR_PICKER_RESULT, { groupId: data.groupId, color: data.color });
            if (data.type === 'color-selected') {
              if (colorPickerWindow && !colorPickerWindow.isDestroyed()) {
                colorPickerWindow.close();
                colorPickerWindow = null;
              }
            }
          } else if (data.type === 'name-changed') {
            // Send the name back to renderer
            parentWindow.webContents.send(IPCChannel.COLOR_PICKER_RESULT, { groupId: data.groupId, name: data.name });
          } else if (data.type === 'close') {
            if (colorPickerWindow && !colorPickerWindow.isDestroyed()) {
              colorPickerWindow.close();
              colorPickerWindow = null;
            }
          }
        } catch { /* ignore parse errors */ }
      });

      colorPickerWindow.on('blur', () => {
        if (colorPickerWindow && !colorPickerWindow.isDestroyed()) {
          colorPickerWindow.close();
          colorPickerWindow = null;
        }
      });
    });

    // Select folder dialog
    ipcMain.handle(IPCChannel.SELECT_FOLDER, async (event) => {
      const window = BrowserWindow.fromWebContents(event.sender);
      if (!window) return null;

      const { canceled, filePaths } = await dialog.showOpenDialog(window, {
        properties: ['openDirectory'],
        title: 'Select Project Folder',
      });

      return canceled ? null : filePaths[0];
    });

    // List folders in a directory
    ipcMain.handle(IPCChannel.LIST_FOLDERS, async (_event, dirPath: string) => {
      try {
        const entries = fs.readdirSync(dirPath, { withFileTypes: true });
        return entries
          .filter(entry => {
            // Filter out hidden folders and system folders
            if (entry.name.startsWith('.')) return false;
            if (entry.name === 'node_modules') return false;
            if (entry.name === '$RECYCLE.BIN') return false;
            if (entry.name === 'System Volume Information') return false;
            return entry.isDirectory();
          })
          .map(entry => ({
            name: entry.name,
            path: path.join(dirPath, entry.name),
            isDirectory: entry.isDirectory(),
          }))
          .sort((a, b) => a.name.localeCompare(b.name));
      } catch (error) {
        logger.error('Failed to list folders', { dirPath, error });
        return [];
      }
    });

    // Get user home directory
    ipcMain.handle(IPCChannel.GET_USER_HOME, async () => {
      return process.env.USERPROFILE || process.env.HOME || '';
    });

    // Extensions
    ipcMain.handle(IPCChannel.EXTENSION_GET_ALL, async () => {
      return extensionManager.getInstalledExtensions();
    });

    ipcMain.handle(IPCChannel.EXTENSION_INSTALL, async (_event, folderPath: string) => {
      try {
        const extension = await extensionManager.installFromFolder(folderPath);
        this.mainWindow?.webContents.send(IPCChannel.EXTENSION_INSTALLED, extension);
        return extension;
      } catch (error) {
        logger.error('Failed to install extension from folder', { error, folderPath });
        throw error;
      }
    });

    ipcMain.handle(IPCChannel.EXTENSION_INSTALL_CRX, async (_event, crxPath: string) => {
      try {
        const extension = await extensionManager.installFromCRX(crxPath);
        this.mainWindow?.webContents.send(IPCChannel.EXTENSION_INSTALLED, extension);
        return extension;
      } catch (error) {
        logger.error('Failed to install extension from CRX', { error, crxPath });
        throw error;
      }
    });

    ipcMain.handle(IPCChannel.EXTENSION_UNINSTALL, async (_event, extensionId: string) => {
      const success = await extensionManager.uninstall(extensionId);
      if (success) {
        this.mainWindow?.webContents.send(IPCChannel.EXTENSION_REMOVED, extensionId);
      }
      return success;
    });

    ipcMain.handle(IPCChannel.EXTENSION_ENABLE, async (_event, extensionId: string) => {
      await extensionManager.enable(extensionId);
      this.mainWindow?.webContents.send(IPCChannel.EXTENSION_UPDATED, { id: extensionId, enabled: true });
    });

    ipcMain.handle(IPCChannel.EXTENSION_DISABLE, async (_event, extensionId: string) => {
      await extensionManager.disable(extensionId);
      this.mainWindow?.webContents.send(IPCChannel.EXTENSION_UPDATED, { id: extensionId, enabled: false });
    });

    // Open AI in Terminal
    ipcMain.handle(IPCChannel.OPEN_AI_IN_TERMINAL, async (_event, aiCommand: string, workingDir?: string) => {
      try {
        logger.info('Opening AI in terminal', { aiCommand, workingDir });

        // Map AI names to their CLI commands
        const aiCommands: Record<string, string> = {
          'claude': 'claude',
          'claude-code': 'claude',
          'openai': 'codex',
          'codex': 'codex',
          'codex-cli': 'codex',
          'gemini': 'gemini',
          'gemini-cli': 'gemini',
        };

        const command = aiCommands[aiCommand.toLowerCase()] || aiCommand;

        // Use provided working directory or default to user's home
        const cwd = workingDir || process.env.USERPROFILE || process.env.HOME || '.';

        // Configure MCP for the AI before launching (pass cwd to create project-level config)
        await this.configureAIMCP(command, cwd);

        // On Windows, open a new terminal window with the AI command
        if (process.platform === 'win32') {
          // Use start with /d to set working directory directly
          const child = spawn('cmd.exe', ['/c', 'start', `/d${cwd}`, 'cmd.exe', '/k', command], {
            detached: true,
            stdio: 'ignore',
            windowsHide: true,
          });
          child.unref();
        } else if (process.platform === 'darwin') {
          // On macOS, use osascript to open Terminal in the directory
          spawn('osascript', ['-e', `tell application "Terminal" to do script "cd '${cwd}' && ${command}"`], {
            detached: true,
            stdio: 'ignore',
          });
        } else {
          // On Linux, try common terminal emulators
          const terminals = ['gnome-terminal', 'konsole', 'xterm', 'x-terminal-emulator'];
          for (const terminal of terminals) {
            try {
              spawn(terminal, ['--working-directory', cwd, '--', 'bash', '-c', command], {
                detached: true,
                stdio: 'ignore',
              });
              break;
            } catch {
              continue;
            }
          }
        }

        return { success: true };
      } catch (error) {
        logger.error('Failed to open AI in terminal', { error, aiCommand });
        return { success: false, error: String(error) };
      }
    });

    // Open AI in VSCode terminal
    ipcMain.handle(IPCChannel.OPEN_AI_IN_VSCODE, async (_event, aiCommand: string, workingDir?: string) => {
      try {
        logger.info('Opening AI in VSCode', { aiCommand, workingDir });

        // Map AI names to their CLI commands
        const aiCommands: Record<string, string> = {
          'claude': 'claude',
          'claude-code': 'claude',
          'openai': 'codex',
          'codex': 'codex',
          'codex-cli': 'codex',
          'gemini': 'gemini',
          'gemini-cli': 'gemini',
        };

        const command = aiCommands[aiCommand.toLowerCase()] || aiCommand;

        // Use provided working directory or default to user's home
        const cwd = workingDir || process.env.USERPROFILE || process.env.HOME || '.';

        // Configure MCP for the AI before launching (pass cwd to create project-level config)
        await this.configureAIMCP(command, cwd);

        // Open VSCode in the specified directory with a new terminal
        if (process.platform === 'win32') {
          // On Windows, open VSCode in the folder and start terminal with command
          spawn('cmd', ['/c', 'code', '--new-window', cwd], {
            detached: true,
            stdio: 'ignore',
            shell: true,
          });

          // After VSCode opens, create terminal and run command
          setTimeout(() => {
            spawn('cmd', ['/c', 'code', '--reuse-window', cwd, '--command', 'workbench.action.terminal.new'], {
              detached: true,
              stdio: 'ignore',
              shell: true,
            });
          }, 1500);

          setTimeout(() => {
            spawn('cmd', ['/c', 'code', '--reuse-window', cwd, '--command', 'workbench.action.terminal.sendSequence', '--args', JSON.stringify({ text: command + '\n' })], {
              detached: true,
              stdio: 'ignore',
              shell: true,
            });
          }, 2500);
        } else {
          // On macOS/Linux
          spawn('code', ['--new-window', cwd], {
            detached: true,
            stdio: 'ignore',
          });

          setTimeout(() => {
            spawn('code', ['--reuse-window', cwd, '--command', 'workbench.action.terminal.new'], {
              detached: true,
              stdio: 'ignore',
            });
          }, 1500);

          setTimeout(() => {
            spawn('code', ['--reuse-window', cwd, '--command', 'workbench.action.terminal.sendSequence', '--args', JSON.stringify({ text: command + '\n' })], {
              detached: true,
              stdio: 'ignore',
            });
          }, 2500);
        }

        return { success: true };
      } catch (error) {
        logger.error('Failed to open AI in VSCode', { error, aiCommand });
        return { success: false, error: String(error) };
      }
    });

    logger.debug('IPC handlers registered');
  }

  private setupWindowEvents(): void {
    // Update bounds when window is ready
    windowManager.on('ready', () => {
      this.updateTabBounds();
    });

    windowManager.on('resize', () => {
      this.updateTabBounds();
    });

    // Forward tab events to renderer
    tabManager.on('tab-created', () => {
      this.mainWindow?.webContents.send(IPCChannel.STATE_CHANGED, this.getState());
    });

    tabManager.on('tab-closed', () => {
      this.mainWindow?.webContents.send(IPCChannel.STATE_CHANGED, this.getState());
    });

    tabManager.on('tab-switched', () => {
      this.mainWindow?.webContents.send(IPCChannel.STATE_CHANGED, this.getState());
    });

    tabManager.on('tab-updated', () => {
      this.mainWindow?.webContents.send(IPCChannel.STATE_CHANGED, this.getState());
    });

    // Tab group events
    tabManager.on('group-created', () => {
      this.mainWindow?.webContents.send(IPCChannel.STATE_CHANGED, this.getState());
    });

    tabManager.on('group-updated', () => {
      this.mainWindow?.webContents.send(IPCChannel.STATE_CHANGED, this.getState());
    });

    tabManager.on('group-deleted', () => {
      this.mainWindow?.webContents.send(IPCChannel.STATE_CHANGED, this.getState());
    });
  }

  private updateTabBounds(): void {
    const contentBounds = windowManager.getContentBounds();
    if (contentBounds) {
      // Account for UI chrome (tab bar 36px + URL bar 44px + bookmarks bar 32px = 112px)
      const uiHeight = 112;

      // Account for AI panel if visible
      const aiPanelVisible = settingsManager.isAIPanelVisible();
      const aiPanelWidth = aiPanelVisible ? settingsManager.getAIPanelWidth() : 0;
      const finalWidth = contentBounds.width - aiPanelWidth;

      tabManager.setContentBounds({
        x: 0,
        y: uiHeight,
        width: finalWidth,
        height: contentBounds.height - uiHeight,
      });
      logger.debug('Tab bounds updated', {
        y: uiHeight,
        width: finalWidth,
        height: contentBounds.height - uiHeight,
      });
    }
  }

  private getState() {
    const activeTab = tabManager.getActiveTab();
    return {
      window: windowManager.getState(),
      tabs: tabManager.getAllTabs(),
      tabGroups: tabManager.getTabGroups(),
      activeTabId: tabManager.getActiveTabId(),
      canGoBack: tabManager.canGoBack(),
      canGoForward: tabManager.canGoForward(),
      isLoading: activeTab?.state.isLoading || false,
      mcpConnections: mcpServer.getConnections(),
      theme: settingsManager.getTheme(),
      aiPanelVisible: settingsManager.isAIPanelVisible(),
    };
  }

  private handleMenuAction(action: string): void {
    switch (action) {
      case 'new-tab':
        tabManager.createTab();
        this.mainWindow?.webContents.send(IPCChannel.STATE_CHANGED, this.getState());
        break;
      case 'settings':
        this.mainWindow?.webContents.send('open-settings');
        break;
      case 'exit':
        windowManager.close();
        break;
      case 'close':
        // Just close the menu, nothing else
        break;
    }
  }

  shutdown(): void {
    logger.info('Shutting down application...');
    mcpServer.stop();
    tabManager.destroy();
    windowManager.destroy();
    logger.info('Application shutdown complete');
  }

  /**
   * Configure AI CLI tools to use eaight MCP server
   * Supports Claude Code, Codex CLI, and Gemini CLI
   */
  private async configureAIMCP(aiCommand: string, projectDir: string): Promise<void> {
    try {
      // Get the path to the MCP bridge script
      const bridgePath = app.isPackaged
        ? path.join(process.resourcesPath, 'mcp-bridge.js')
        : path.join(__dirname, '../../resources/mcp-bridge.js');

      // Normalize path for the current platform
      const normalizedBridgePath = bridgePath.replace(/\\/g, '/');

      // MCP server configuration (stdio bridge)
      const mcpServerConfig = {
        command: 'node',
        args: [normalizedBridgePath],
      };

      // Configure based on AI type
      switch (aiCommand) {
        case 'claude':
          await this.configureClaudeMCP(normalizedBridgePath, mcpServerConfig, projectDir);
          break;
        case 'codex':
          await this.configureCodexMCP(normalizedBridgePath, mcpServerConfig);
          break;
        case 'gemini':
          await this.configureGeminiMCP(normalizedBridgePath, mcpServerConfig);
          break;
        default:
          logger.warn('Unknown AI command, skipping MCP configuration', { aiCommand });
      }
    } catch (error) {
      logger.error('Failed to configure AI MCP', { error, aiCommand });
      // Don't throw - allow AI to launch even if MCP config fails
    }
  }

  /**
   * Configure Claude Code CLI and Claude Desktop
   */
  private async configureClaudeMCP(bridgePath: string, mcpServerConfig: object, projectDir: string): Promise<void> {
    // Create project-level .mcp.json for Claude Code (SSE is more reliable)
    const projectMcpPath = path.join(projectDir, '.mcp.json');
    const projectMcpConfig = {
      mcpServers: {
        eaight: {
          type: 'sse',
          url: 'http://localhost:9223/mcp',
        },
      },
    };

    try {
      fs.writeFileSync(projectMcpPath, JSON.stringify(projectMcpConfig, null, 2));
      logger.info('Created project-level .mcp.json for Claude Code', { projectMcpPath });
    } catch (error) {
      logger.warn('Failed to create project-level .mcp.json', { projectMcpPath, error });
    }

    // Also configure global settings as fallback
    const claudeSettingsDir = process.platform === 'win32'
      ? path.join(process.env.USERPROFILE || '', '.claude')
      : path.join(process.env.HOME || '', '.claude');

    // Create directory if it doesn't exist
    if (!fs.existsSync(claudeSettingsDir)) {
      fs.mkdirSync(claudeSettingsDir, { recursive: true });
    }

    // Path to Claude Code's settings file
    const settingsPath = path.join(claudeSettingsDir, 'settings.json');

    // Read existing settings or create new
    let settings: { mcpServers?: Record<string, unknown> } = {};
    if (fs.existsSync(settingsPath)) {
      try {
        const content = fs.readFileSync(settingsPath, 'utf-8');
        settings = JSON.parse(content);
      } catch {
        settings = {};
      }
    }

    // Ensure mcpServers exists
    if (!settings.mcpServers) {
      settings.mcpServers = {};
    }

    // Add/update eaight MCP server configuration
    settings.mcpServers['eaight'] = mcpServerConfig;

    // Write updated settings
    fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
    logger.info('Claude Code MCP configuration updated', { settingsPath, bridgePath });

    // Also configure Claude Desktop if the directory exists
    const claudeDesktopDir = process.platform === 'win32'
      ? path.join(process.env.APPDATA || '', 'Claude')
      : path.join(process.env.HOME || '', 'Library', 'Application Support', 'Claude');

    if (fs.existsSync(claudeDesktopDir)) {
      const desktopConfigPath = path.join(claudeDesktopDir, 'claude_desktop_config.json');
      let desktopSettings: { mcpServers?: Record<string, unknown> } = {};

      if (fs.existsSync(desktopConfigPath)) {
        try {
          const content = fs.readFileSync(desktopConfigPath, 'utf-8');
          desktopSettings = JSON.parse(content);
        } catch {
          desktopSettings = {};
        }
      }

      if (!desktopSettings.mcpServers) {
        desktopSettings.mcpServers = {};
      }

      desktopSettings.mcpServers['eaight'] = mcpServerConfig;
      fs.writeFileSync(desktopConfigPath, JSON.stringify(desktopSettings, null, 2));
      logger.info('Claude Desktop MCP configuration updated', { desktopConfigPath });
    }
  }

  /**
   * Configure OpenAI Codex CLI
   * Codex CLI uses ~/.codex/config.json or environment variables
   */
  private async configureCodexMCP(bridgePath: string, mcpServerConfig: object): Promise<void> {
    // Codex CLI settings directory
    const codexSettingsDir = process.platform === 'win32'
      ? path.join(process.env.USERPROFILE || '', '.codex')
      : path.join(process.env.HOME || '', '.codex');

    // Create directory if it doesn't exist
    if (!fs.existsSync(codexSettingsDir)) {
      fs.mkdirSync(codexSettingsDir, { recursive: true });
    }

    // Path to Codex CLI's config file
    const configPath = path.join(codexSettingsDir, 'config.json');

    // Read existing config or create new
    let config: { mcpServers?: Record<string, unknown> } = {};
    if (fs.existsSync(configPath)) {
      try {
        const content = fs.readFileSync(configPath, 'utf-8');
        config = JSON.parse(content);
      } catch {
        config = {};
      }
    }

    // Ensure mcpServers exists
    if (!config.mcpServers) {
      config.mcpServers = {};
    }

    // Add/update eaight MCP server configuration
    config.mcpServers['eaight'] = mcpServerConfig;

    // Write updated config
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    logger.info('Codex CLI MCP configuration updated', { configPath, bridgePath });

    // Also try the instructions.md approach for Codex
    const instructionsPath = path.join(codexSettingsDir, 'instructions.md');
    const instructions = `# Eaight Browser Integration

You are connected to eaight, an AI-powered web browser via MCP.

## Available MCP Server: eaight

Use the eaight MCP server to control the browser:

### Tools:
- browser_navigate { "url": "https://..." } - Navigate to URL
- browser_click { "selector": "button" } - Click element
- browser_type { "selector": "input", "text": "hello" } - Type text
- browser_scroll { "direction": "down" } - Scroll page
- browser_screenshot {} - Take screenshot

### Resources:
- browser://state - Current browser state
- browser://dom - Page DOM
- browser://text - Page text content

Start by reading browser://state to see where you are!
`;
    fs.writeFileSync(instructionsPath, instructions);
    logger.info('Codex CLI instructions updated', { instructionsPath });
  }

  /**
   * Configure Google Gemini CLI
   * Gemini CLI uses ~/.gemini/config.json or similar
   */
  private async configureGeminiMCP(bridgePath: string, mcpServerConfig: object): Promise<void> {
    // Gemini CLI settings directory
    const geminiSettingsDir = process.platform === 'win32'
      ? path.join(process.env.USERPROFILE || '', '.gemini')
      : path.join(process.env.HOME || '', '.gemini');

    // Create directory if it doesn't exist
    if (!fs.existsSync(geminiSettingsDir)) {
      fs.mkdirSync(geminiSettingsDir, { recursive: true });
    }

    // Path to Gemini CLI's config file
    const configPath = path.join(geminiSettingsDir, 'config.json');

    // Read existing config or create new
    let config: { mcpServers?: Record<string, unknown> } = {};
    if (fs.existsSync(configPath)) {
      try {
        const content = fs.readFileSync(configPath, 'utf-8');
        config = JSON.parse(content);
      } catch {
        config = {};
      }
    }

    // Ensure mcpServers exists
    if (!config.mcpServers) {
      config.mcpServers = {};
    }

    // Add/update eaight MCP server configuration
    config.mcpServers['eaight'] = mcpServerConfig;

    // Write updated config
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    logger.info('Gemini CLI MCP configuration updated', { configPath, bridgePath });

    // Also create settings.json for Gemini (alternative config location)
    const settingsPath = path.join(geminiSettingsDir, 'settings.json');
    let settings: { mcpServers?: Record<string, unknown> } = {};
    if (fs.existsSync(settingsPath)) {
      try {
        const content = fs.readFileSync(settingsPath, 'utf-8');
        settings = JSON.parse(content);
      } catch {
        settings = {};
      }
    }

    if (!settings.mcpServers) {
      settings.mcpServers = {};
    }

    settings.mcpServers['eaight'] = mcpServerConfig;
    fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
    logger.info('Gemini CLI settings updated', { settingsPath });
  }
}

export const application = new App();
export default application;
