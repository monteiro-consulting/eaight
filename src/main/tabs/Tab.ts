// Individual Tab Class

import { BrowserView, WebContents, app, session, Menu, clipboard } from 'electron';
import { EventEmitter } from 'events';
import * as path from 'path';
import { Tab as TabState } from '../../shared/types/browser';
import { createTabState, updateTabState } from './TabState';
import { logger } from '../utils/logger';

// Track downloads globally
const activeDownloads = new Map<string, { savePath: string; resolve: (path: string) => void; reject: (err: Error) => void }>();
let downloadHandlerSetup = false;

// Chrome User-Agent for Web Store compatibility
const CHROME_USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

let userAgentSetup = false;

// Script to inject Chrome APIs for Web Store compatibility
const CHROME_API_INJECTION = `
(function() {
  if (window.__chromeApiInjected) return;
  window.__chromeApiInjected = true;

  // Mock chrome.runtime
  if (!window.chrome) window.chrome = {};

  window.chrome.runtime = {
    id: 'eaight-browser',
    getManifest: function() {
      return { version: '120.0.0.0', name: 'eaight' };
    },
    getURL: function(path) {
      return 'chrome-extension://eaight-browser/' + path;
    },
    sendMessage: function() {},
    onMessage: { addListener: function() {}, removeListener: function() {} },
    onConnect: { addListener: function() {}, removeListener: function() {} },
    connect: function() { return { onMessage: { addListener: function() {} }, postMessage: function() {} }; },
    lastError: null,
    getPlatformInfo: function(cb) { cb({ os: 'win', arch: 'x86-64' }); }
  };

  // Mock chrome.app for inline install
  window.chrome.app = {
    isInstalled: false,
    getDetails: function() { return null; },
    getIsInstalled: function() { return false; },
    runningState: function() { return 'cannot_run'; }
  };

  // Mock chrome.webstore for inline install
  window.chrome.webstore = {
    install: function(url, successCallback, failureCallback) {
      // Extract extension ID from URL
      var extId = url ? url.match(/\\/detail\\/[^\\/]+\\/([a-z]{32})/i) : null;
      if (!extId) extId = url ? url.match(/([a-z]{32})/i) : null;

      if (extId && extId[1]) {
        // Trigger CRX download
        var crxUrl = 'https://clients2.google.com/service/update2/crx?response=redirect&acceptformat=crx2,crx3&prodversion=120.0.0.0&x=id%3D' + extId[1] + '%26installsource%3Dondemand%26uc';

        // Create a temporary link and click it to trigger download
        var a = document.createElement('a');
        a.href = crxUrl;
        a.download = extId[1] + '.crx';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        if (successCallback) setTimeout(successCallback, 1000);
      } else {
        if (failureCallback) failureCallback('Invalid extension URL');
      }
    },
    onInstallStageChanged: { addListener: function() {} },
    onDownloadProgress: { addListener: function() {} }
  };

  // Override the install button behavior on Chrome Web Store
  if (location.hostname.includes('chrome.google.com')) {
    // Wait for page to load then modify install buttons
    var observer = new MutationObserver(function() {
      var buttons = document.querySelectorAll('[role="button"]');
      buttons.forEach(function(btn) {
        if (btn.textContent && (btn.textContent.includes('Add to Chrome') || btn.textContent.includes('Ajouter'))) {
          if (!btn.__eaightPatched) {
            btn.__eaightPatched = true;
            btn.addEventListener('click', function(e) {
              e.preventDefault();
              e.stopPropagation();

              // Get extension ID from URL
              var match = location.pathname.match(/\\/detail\\/[^\\/]+\\/([a-z]{32})/i);
              if (match) {
                chrome.webstore.install(location.href);
              }
            }, true);
          }
        }
      });
    });

    observer.observe(document.body || document.documentElement, {
      childList: true,
      subtree: true
    });

    // Also run immediately
    setTimeout(function() {
      var buttons = document.querySelectorAll('[role="button"]');
      buttons.forEach(function(btn) {
        if (btn.textContent && (btn.textContent.includes('Add to Chrome') || btn.textContent.includes('Ajouter'))) {
          if (!btn.__eaightPatched) {
            btn.__eaightPatched = true;
            var originalClick = btn.onclick;
            btn.onclick = function(e) {
              e.preventDefault();
              e.stopPropagation();
              var match = location.pathname.match(/\\/detail\\/[^\\/]+\\/([a-z]{32})/i);
              if (match) {
                chrome.webstore.install(location.href);
              }
              return false;
            };
          }
        }
      });
    }, 2000);
  }
})();
`;

function setupUserAgent(): void {
  if (userAgentSetup) return;
  userAgentSetup = true;

  // Set User-Agent for all requests to appear as Chrome
  session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
    details.requestHeaders['User-Agent'] = CHROME_USER_AGENT;
    callback({ requestHeaders: details.requestHeaders });
  });

  logger.info('Chrome User-Agent configured');
}

function setupGlobalDownloadHandler(): void {
  if (downloadHandlerSetup) return;
  downloadHandlerSetup = true;

  session.defaultSession.on('will-download', (_event, item, _webContents) => {
    const url = item.getURL();
    const filename = item.getFilename();
    const downloadsPath = app.getPath('downloads');
    const savePath = path.join(downloadsPath, filename);

    logger.info('Download started', { url: url.substring(0, 100), filename, savePath });

    item.setSavePath(savePath);

    item.on('updated', (_event, state) => {
      if (state === 'progressing') {
        if (!item.isPaused()) {
          const percent = item.getReceivedBytes() / item.getTotalBytes() * 100;
          logger.debug('Download progress', { filename, percent: percent.toFixed(1) });
        }
      }
    });

    item.once('done', (_event, state) => {
      if (state === 'completed') {
        logger.info('Download completed', { filename, savePath, size: item.getReceivedBytes() });
        // Emit event for any listeners
        const pending = activeDownloads.get(url);
        if (pending) {
          pending.resolve(savePath);
          activeDownloads.delete(url);
        }
      } else {
        logger.error('Download failed', { filename, state });
        const pending = activeDownloads.get(url);
        if (pending) {
          pending.reject(new Error(`Download failed: ${state}`));
          activeDownloads.delete(url);
        }
      }
    });
  });

  logger.info('Global download handler configured');
}

export class Tab extends EventEmitter {
  private _state: TabState;
  private _view: BrowserView;
  private _isDestroyed = false;

  constructor(url?: string) {
    super();

    // Setup global handlers on first tab creation
    setupUserAgent();
    setupGlobalDownloadHandler();

    this._state = createTabState(url);
    this._view = new BrowserView({
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        sandbox: true,
        webSecurity: true,
      },
    });

    this.setupEventListeners();

    if (url && url !== 'about:blank') {
      this.loadURL(url);
    }

    logger.debug('Tab created', { id: this._state.id, url });
  }

  get id(): string {
    return this._state.id;
  }

  get state(): TabState {
    return this._state;
  }

  get view(): BrowserView {
    return this._view;
  }

  get webContents(): WebContents {
    return this._view.webContents;
  }

  get isDestroyed(): boolean {
    return this._isDestroyed;
  }

  updateState(updates: Partial<TabState>): void {
    this._state = updateTabState(this._state, updates);
    this.emit('state-changed', this._state);
  }

  private setupEventListeners(): void {
    const wc = this._view.webContents;

    wc.on('did-start-loading', () => {
      this.updateState({ isLoading: true });
    });

    wc.on('did-stop-loading', () => {
      this.updateState({ isLoading: false });
    });

    // Inject Chrome APIs for Web Store compatibility
    wc.on('did-finish-load', () => {
      wc.executeJavaScript(CHROME_API_INJECTION).catch(() => {
        // Ignore errors (e.g., on about:blank)
      });
    });

    wc.on('did-navigate', (_event, url) => {
      this.updateState({ url });
    });

    wc.on('did-navigate-in-page', (_event, url) => {
      this.updateState({ url });
    });

    wc.on('page-title-updated', (_event, title) => {
      this.updateState({ title });
    });

    wc.on('page-favicon-updated', (_event, favicons) => {
      if (favicons.length > 0) {
        this.updateState({ favicon: favicons[0] });
      }
    });

    wc.on('media-started-playing', () => {
      this.updateState({ isAudible: true });
    });

    wc.on('media-paused', () => {
      this.updateState({ isAudible: false });
    });

    // Context menu (right-click)
    wc.on('context-menu', (_event, params) => {
      const menuItems: Electron.MenuItemConstructorOptions[] = [];

      // If there's selected text
      if (params.selectionText) {
        menuItems.push({
          label: 'Copy',
          accelerator: 'CmdOrCtrl+C',
          click: () => wc.copy(),
        });
        menuItems.push({ type: 'separator' });
      }

      // If it's an editable field
      if (params.isEditable) {
        menuItems.push({
          label: 'Cut',
          accelerator: 'CmdOrCtrl+X',
          click: () => wc.cut(),
          enabled: params.selectionText.length > 0,
        });
        menuItems.push({
          label: 'Copy',
          accelerator: 'CmdOrCtrl+C',
          click: () => wc.copy(),
          enabled: params.selectionText.length > 0,
        });
        menuItems.push({
          label: 'Paste',
          accelerator: 'CmdOrCtrl+V',
          click: () => wc.paste(),
        });
        menuItems.push({
          label: 'Select All',
          accelerator: 'CmdOrCtrl+A',
          click: () => wc.selectAll(),
        });
        menuItems.push({ type: 'separator' });
      }

      // If it's a link
      if (params.linkURL) {
        menuItems.push({
          label: 'Open Link in New Tab',
          click: () => this.emit('open-link-new-tab', params.linkURL),
        });
        menuItems.push({
          label: 'Copy Link Address',
          click: () => clipboard.writeText(params.linkURL),
        });
        menuItems.push({ type: 'separator' });
      }

      // If it's an image
      if (params.hasImageContents && params.srcURL) {
        menuItems.push({
          label: 'Open Image in New Tab',
          click: () => this.emit('open-link-new-tab', params.srcURL),
        });
        menuItems.push({
          label: 'Copy Image Address',
          click: () => clipboard.writeText(params.srcURL),
        });
        menuItems.push({ type: 'separator' });
      }

      // Standard actions
      menuItems.push({
        label: 'Back',
        accelerator: 'Alt+Left',
        click: () => this.goBack(),
        enabled: wc.canGoBack(),
      });
      menuItems.push({
        label: 'Forward',
        accelerator: 'Alt+Right',
        click: () => this.goForward(),
        enabled: wc.canGoForward(),
      });
      menuItems.push({
        label: 'Reload',
        accelerator: 'CmdOrCtrl+R',
        click: () => this.reload(),
      });
      menuItems.push({ type: 'separator' });
      menuItems.push({
        label: 'Inspect Element',
        accelerator: 'CmdOrCtrl+Shift+I',
        click: () => wc.inspectElement(params.x, params.y),
      });

      const menu = Menu.buildFromTemplate(menuItems);
      menu.popup();
    });
  }

  async loadURL(url: string): Promise<void> {
    if (this._isDestroyed) return;

    try {
      await this._view.webContents.loadURL(url);
      logger.debug('Tab navigated', { id: this._state.id, url });
    } catch (error) {
      logger.error('Tab navigation failed', { id: this._state.id, url, error });
      throw error;
    }
  }

  goBack(): void {
    if (this._view.webContents.canGoBack()) {
      this._view.webContents.goBack();
    }
  }

  goForward(): void {
    if (this._view.webContents.canGoForward()) {
      this._view.webContents.goForward();
    }
  }

  reload(): void {
    this._view.webContents.reload();
  }

  stop(): void {
    this._view.webContents.stop();
  }

  canGoBack(): boolean {
    return this._view.webContents.canGoBack();
  }

  canGoForward(): boolean {
    return this._view.webContents.canGoForward();
  }

  setMuted(muted: boolean): void {
    this._view.webContents.setAudioMuted(muted);
    this.updateState({ isMuted: muted });
  }

  setPinned(pinned: boolean): void {
    this.updateState({ isPinned: pinned });
  }

  setBounds(bounds: { x: number; y: number; width: number; height: number }): void {
    this._view.setBounds(bounds);
    const actualBounds = this._view.getBounds();
    logger.debug('Tab setBounds', { requested: bounds, actual: actualBounds });
  }

  destroy(): void {
    if (this._isDestroyed) return;
    this._isDestroyed = true;
    // Remove all listeners to prevent memory leaks
    this._view.webContents.removeAllListeners();
    logger.debug('Tab destroyed', { id: this._state.id });
  }
}

export default Tab;
