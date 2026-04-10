// Path utilities

import { app } from 'electron';
import * as path from 'path';
import * as fs from 'fs';

export function getAppDataPath(): string {
  return app.getPath('userData');
}

export function getUserDataPath(): string {
  return getAppDataPath();
}

export function getConfigPath(): string {
  return path.join(getAppDataPath(), 'config');
}

export function getSocketDir(): string {
  if (process.platform === 'win32') {
    return path.join(process.env.APPDATA || '', 'eaight');
  }
  return path.join(process.env.HOME || '', '.eaight');
}

export function getSocketPath(): string {
  return path.join(getSocketDir(), 'mcp-server.json');
}

export function getTokenPath(): string {
  return path.join(getSocketDir(), 'auth-token');
}

export function getThemesPath(): string {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, 'themes');
  }
  return path.join(__dirname, '..', '..', '..', 'resources', 'themes');
}

export function getPreloadPath(): string {
  if (app.isPackaged) {
    return path.join(__dirname, 'preload', 'index.js');
  }
  return path.join(__dirname, '..', 'preload', 'index.js');
}

export function ensureDir(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

export function ensureSocketDir(): void {
  ensureDir(getSocketDir());
}

export function writeJSON(filePath: string, data: unknown): void {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

export function readJSON<T>(filePath: string): T | null {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content) as T;
  } catch {
    return null;
  }
}

export function deleteFile(filePath: string): void {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch {
    // Ignore errors
  }
}
