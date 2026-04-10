// Window Manager - Manages the main browser window

import { BrowserWindow, screen } from 'electron';
import * as path from 'path';
import { EventEmitter } from 'events';
import { WindowState, WindowBounds } from '../../shared/types/browser';
import { logger } from '../utils/logger';
import { generateId } from '../../shared/utils/formatters';
import {
  DEFAULT_WINDOW_WIDTH,
  DEFAULT_WINDOW_HEIGHT,
  MIN_WINDOW_WIDTH,
  MIN_WINDOW_HEIGHT,
} from '../../shared/constants/defaults';

export class WindowManager extends EventEmitter {
  private mainWindow: BrowserWindow | null = null;
  private windowState: WindowState | null = null;

  constructor() {
    super();
    logger.info('WindowManager initialized');
  }

  async createMainWindow(): Promise<BrowserWindow> {
    // Calculate center position
    const primaryDisplay = screen.getPrimaryDisplay();
    const { width: screenWidth, height: screenHeight } = primaryDisplay.workAreaSize;
    const workArea = primaryDisplay.workArea;
    const x = Math.floor((screenWidth - DEFAULT_WINDOW_WIDTH) / 2);
    // Ensure window doesn't go above the work area (leave some margin)
    const y = Math.max(workArea.y, Math.floor((screenHeight - DEFAULT_WINDOW_HEIGHT) / 2));

    // __dirname is dist/main/window, so we go up two levels to dist, then into preload
    const preloadPath = path.join(__dirname, '..', '..', 'preload', 'index.js');

    this.mainWindow = new BrowserWindow({
      width: DEFAULT_WINDOW_WIDTH,
      height: DEFAULT_WINDOW_HEIGHT,
      minWidth: MIN_WINDOW_WIDTH,
      minHeight: MIN_WINDOW_HEIGHT,
      x,
      y,
      frame: false, // Frameless for custom title bar
      titleBarStyle: 'hidden',
      backgroundColor: '#1a1a2e',
      show: false,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        sandbox: false, // Disabled temporarily for preload to work
        preload: preloadPath,
      },
    });

    this.windowState = {
      id: generateId(),
      bounds: { x, y, width: DEFAULT_WINDOW_WIDTH, height: DEFAULT_WINDOW_HEIGHT },
      isMaximized: false,
      isFullscreen: false,
    };

    this.setupWindowEvents();

    // Load the renderer
    // __dirname is dist/main/window, so we go up two levels to dist, then into renderer
    const rendererPath = path.join(__dirname, '..', '..', 'renderer', 'index.html');
    await this.mainWindow.loadFile(rendererPath);

    // Listen for renderer crashes
    this.mainWindow.webContents.on('render-process-gone', (_event, details) => {
      logger.error('Renderer process gone', { details });
    });

    this.mainWindow.once('ready-to-show', () => {
      this.mainWindow?.show();
      this.emit('ready');
      logger.info('Main window shown');
    });

    logger.info('Main window created');
    return this.mainWindow;
  }

  private setupWindowEvents(): void {
    if (!this.mainWindow) return;

    this.mainWindow.on('resize', () => {
      this.updateBounds();
      this.emit('resize', this.windowState?.bounds);
    });

    this.mainWindow.on('move', () => {
      this.updateBounds();
      this.emit('move', this.windowState?.bounds);
    });

    this.mainWindow.on('maximize', () => {
      if (this.windowState) {
        this.windowState.isMaximized = true;
      }
      this.emit('maximize');
    });

    this.mainWindow.on('unmaximize', () => {
      if (this.windowState) {
        this.windowState.isMaximized = false;
      }
      this.emit('unmaximize');
    });

    this.mainWindow.on('enter-full-screen', () => {
      if (this.windowState) {
        this.windowState.isFullscreen = true;
      }
      this.emit('enter-fullscreen');
    });

    this.mainWindow.on('leave-full-screen', () => {
      if (this.windowState) {
        this.windowState.isFullscreen = false;
      }
      this.emit('leave-fullscreen');
    });

    this.mainWindow.on('closed', () => {
      this.mainWindow = null;
      this.windowState = null;
      this.emit('closed');
      logger.info('Main window closed');
    });
  }

  private updateBounds(): void {
    if (!this.mainWindow || !this.windowState) return;
    const bounds = this.mainWindow.getBounds();
    this.windowState.bounds = bounds;
  }

  getWindow(): BrowserWindow | null {
    return this.mainWindow;
  }

  getState(): WindowState | null {
    return this.windowState;
  }

  getBounds(): WindowBounds | null {
    return this.windowState?.bounds || null;
  }

  getContentBounds(): { x: number; y: number; width: number; height: number } | null {
    if (!this.mainWindow) return null;
    const [width, height] = this.mainWindow.getContentSize();
    return { x: 0, y: 0, width, height };
  }

  minimize(): void {
    this.mainWindow?.minimize();
  }

  maximize(): void {
    if (this.mainWindow?.isMaximized()) {
      this.mainWindow.unmaximize();
    } else {
      this.mainWindow?.maximize();
    }
  }

  close(): void {
    this.mainWindow?.close();
  }

  toggleFullscreen(): void {
    if (!this.mainWindow) return;
    this.mainWindow.setFullScreen(!this.mainWindow.isFullScreen());
  }

  isMaximized(): boolean {
    return this.mainWindow?.isMaximized() || false;
  }

  isFullscreen(): boolean {
    return this.mainWindow?.isFullScreen() || false;
  }

  focus(): void {
    this.mainWindow?.focus();
  }

  destroy(): void {
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      this.mainWindow.destroy();
    }
    this.mainWindow = null;
    this.windowState = null;
    this.removeAllListeners();
    logger.info('WindowManager destroyed');
  }
}

export const windowManager = new WindowManager();
export default windowManager;
