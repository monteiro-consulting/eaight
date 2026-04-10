// Main Process Entry Point

import { app } from 'electron';
import { application } from './app';
import { logger } from './utils/logger';

// Handle creating/removing shortcuts on Windows when installing/uninstalling
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  if (require('electron-squirrel-startup')) {
    app.quit();
  }
} catch {
  // electron-squirrel-startup not available, ignore
}

// Prevent multiple instances
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  logger.warn('Another instance is already running');
  app.quit();
} else {
  app.on('second-instance', () => {
    // Focus the main window if a second instance is attempted
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const window = require('./window').windowManager.getWindow();
    if (window) {
      if (window.isMinimized()) window.restore();
      window.focus();
    }
  });

  // App lifecycle - only run if we got the lock
  app.whenReady().then(async () => {
    logger.info('Electron ready, starting application...');
    await application.initialize();
  });
}

app.on('window-all-closed', () => {
  try {
    application.shutdown();
  } catch {
    // Ignore shutdown errors
  }
  if (process.platform !== 'darwin') {
    app.exit(0);
  }
});

app.on('activate', async () => {
  // On macOS, re-create window when dock icon is clicked
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { windowManager } = require('./window');
  if (!windowManager.getWindow()) {
    await application.initialize();
  }
});

app.on('before-quit', () => {
  application.shutdown();
});

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception', { error: error.message, stack: error.stack });
});

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled rejection', { reason });
});
