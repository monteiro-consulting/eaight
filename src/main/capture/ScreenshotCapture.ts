// Screenshot Capture Module

import { NativeImage } from 'electron';
import { tabManager } from '../tabs';
import { windowManager } from '../window';
import { logger } from '../utils/logger';

export interface ScreenshotOptions {
  fullPage?: boolean;
  selector?: string;
  quality?: number;
}

export async function captureScreenshot(_options: ScreenshotOptions = {}): Promise<NativeImage | null> {
  // First try to capture from the main window (includes overlay/NTP)
  const mainWindow = windowManager.getWindow();
  if (mainWindow) {
    try {
      const image = await mainWindow.webContents.capturePage();
      if (image && !image.isEmpty()) {
        logger.debug('Screenshot captured from main window');
        return image;
      }
    } catch (error) {
      logger.debug('Failed to capture from main window, trying active tab', { error });
    }
  }

  // Fallback to active tab
  const activeTab = tabManager.getActiveTab();
  if (!activeTab) {
    logger.warn('No active tab for screenshot');
    return null;
  }

  try {
    const image = await activeTab.webContents.capturePage();
    logger.debug('Screenshot captured from active tab');
    return image;
  } catch (error) {
    logger.error('Failed to capture screenshot', { error });
    return null;
  }
}

export async function captureScreenshotBase64(options: ScreenshotOptions = {}): Promise<string> {
  const image = await captureScreenshot(options);
  if (!image) return '';

  return image.toPNG().toString('base64');
}

export async function captureScreenshotBuffer(options: ScreenshotOptions = {}): Promise<Buffer | null> {
  const image = await captureScreenshot(options);
  if (!image) return null;

  return image.toPNG();
}
