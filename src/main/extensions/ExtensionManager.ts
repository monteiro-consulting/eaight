// Extension Manager - Manages Chrome extensions

import { session, app, Extension } from 'electron';
import { EventEmitter } from 'events';
import * as fs from 'fs';
import * as path from 'path';
import Store from 'electron-store';
import { ExtensionInfo, ExtensionManifest, InstalledExtension } from '../../shared/types/extension';
import { extractCRX, isCRXFile, isExtensionDirectory } from './crx-extractor';
import { logger } from '../utils/logger';

interface ExtensionStoreSchema {
  installedExtensions: InstalledExtension[];
  extensionsEnabled: boolean;
}

export class ExtensionManager extends EventEmitter {
  private store: Store<ExtensionStoreSchema>;
  private extensionsDir: string;
  private loadedExtensions: Map<string, Extension> = new Map();
  private disabledExtensions: Set<string> = new Set();

  constructor() {
    super();

    // Initialize store for persistence
    this.store = new Store<ExtensionStoreSchema>({
      name: 'extensions',
      defaults: {
        installedExtensions: [],
        extensionsEnabled: true,
      },
    });

    // Extensions directory in user data
    this.extensionsDir = path.join(app.getPath('userData'), 'extensions');

    // Create extensions directory if it doesn't exist
    if (!fs.existsSync(this.extensionsDir)) {
      fs.mkdirSync(this.extensionsDir, { recursive: true });
    }

    logger.info('ExtensionManager initialized', { extensionsDir: this.extensionsDir });
  }

  /**
   * Load all persisted extensions on startup
   */
  async loadPersistedExtensions(): Promise<void> {
    const installed = this.store.get('installedExtensions', []);
    const extensionsEnabled = this.store.get('extensionsEnabled', true);

    if (!extensionsEnabled) {
      logger.info('Extensions are globally disabled');
      return;
    }

    logger.info('Loading persisted extensions', { count: installed.length });

    for (const ext of installed) {
      if (!ext.enabled) {
        this.disabledExtensions.add(ext.id);
        continue;
      }

      try {
        if (fs.existsSync(ext.path)) {
          await this.loadExtensionFromPath(ext.path);
        } else {
          logger.warn('Extension path not found, removing from list', { id: ext.id, path: ext.path });
          this.removeFromStore(ext.id);
        }
      } catch (error) {
        logger.error('Failed to load persisted extension', { id: ext.id, error });
      }
    }
  }

  /**
   * Install an extension from a folder path (unpacked extension)
   */
  async installFromFolder(folderPath: string): Promise<ExtensionInfo> {
    if (!isExtensionDirectory(folderPath)) {
      throw new Error('Invalid extension: manifest.json not found');
    }

    // Copy to extensions directory
    const manifest = this.readManifest(folderPath);
    const extId = this.generateExtensionId(manifest.name);
    const destPath = path.join(this.extensionsDir, extId);

    // Remove existing if present
    if (fs.existsSync(destPath)) {
      fs.rmSync(destPath, { recursive: true });
    }

    // Copy extension files
    this.copyDirectory(folderPath, destPath);

    // Load the extension
    const extension = await this.loadExtensionFromPath(destPath);
    const extensionInfo = this.extensionToInfo(extension, destPath, true);

    // Persist to store
    this.addToStore(extensionInfo);

    this.emit('extension-installed', extensionInfo);
    logger.info('Extension installed from folder', { id: extensionInfo.id, name: extensionInfo.name });

    return extensionInfo;
  }

  /**
   * Install an extension from a .crx file
   */
  async installFromCRX(crxPath: string): Promise<ExtensionInfo> {
    if (!isCRXFile(crxPath)) {
      throw new Error('Invalid CRX file');
    }

    // Extract to temp directory first to read manifest
    const tempDir = path.join(app.getPath('temp'), `crx-${Date.now()}`);
    await extractCRX(crxPath, tempDir);

    // Read manifest to get extension name
    const manifest = this.readManifest(tempDir);
    const extId = this.generateExtensionId(manifest.name);
    const destPath = path.join(this.extensionsDir, extId);

    // Remove existing if present
    if (fs.existsSync(destPath)) {
      fs.rmSync(destPath, { recursive: true });
    }

    // Move from temp to extensions directory
    fs.renameSync(tempDir, destPath);

    // Load the extension
    const extension = await this.loadExtensionFromPath(destPath);
    const extensionInfo = this.extensionToInfo(extension, destPath, true);

    // Persist to store
    this.addToStore(extensionInfo);

    this.emit('extension-installed', extensionInfo);
    logger.info('Extension installed from CRX', { id: extensionInfo.id, name: extensionInfo.name });

    return extensionInfo;
  }

  /**
   * Uninstall an extension
   */
  async uninstall(extensionId: string): Promise<boolean> {
    const extension = this.loadedExtensions.get(extensionId);

    if (extension) {
      // Unload from session
      session.defaultSession.removeExtension(extensionId);
      this.loadedExtensions.delete(extensionId);
    }

    // Find in store and remove
    const installed = this.store.get('installedExtensions', []);
    const ext = installed.find(e => e.id === extensionId);

    if (ext) {
      // Delete extension files
      if (fs.existsSync(ext.path)) {
        fs.rmSync(ext.path, { recursive: true });
      }

      // Remove from store
      this.removeFromStore(extensionId);
      this.disabledExtensions.delete(extensionId);

      this.emit('extension-removed', extensionId);
      logger.info('Extension uninstalled', { id: extensionId });

      return true;
    }

    return false;
  }

  /**
   * Enable an extension
   */
  async enable(extensionId: string): Promise<void> {
    const installed = this.store.get('installedExtensions', []);
    const ext = installed.find(e => e.id === extensionId);

    if (!ext) {
      throw new Error('Extension not found');
    }

    if (!this.loadedExtensions.has(extensionId)) {
      // Load the extension
      await this.loadExtensionFromPath(ext.path);
    }

    // Update store
    ext.enabled = true;
    this.store.set('installedExtensions', installed);
    this.disabledExtensions.delete(extensionId);

    this.emit('extension-updated', { id: extensionId, enabled: true });
    logger.info('Extension enabled', { id: extensionId });
  }

  /**
   * Disable an extension
   */
  async disable(extensionId: string): Promise<void> {
    const extension = this.loadedExtensions.get(extensionId);

    if (extension) {
      // Unload from session
      session.defaultSession.removeExtension(extensionId);
      this.loadedExtensions.delete(extensionId);
    }

    // Update store
    const installed = this.store.get('installedExtensions', []);
    const ext = installed.find(e => e.id === extensionId);

    if (ext) {
      ext.enabled = false;
      this.store.set('installedExtensions', installed);
      this.disabledExtensions.add(extensionId);

      this.emit('extension-updated', { id: extensionId, enabled: false });
      logger.info('Extension disabled', { id: extensionId });
    }
  }

  /**
   * Get all installed extensions
   */
  getInstalledExtensions(): ExtensionInfo[] {
    const installed = this.store.get('installedExtensions', []);
    const extensions: ExtensionInfo[] = [];

    for (const ext of installed) {
      try {
        const manifest = this.readManifest(ext.path);

        extensions.push({
          id: ext.id,
          name: manifest.name,
          version: manifest.version,
          description: manifest.description || '',
          enabled: ext.enabled,
          path: ext.path,
          permissions: manifest.permissions,
          manifest,
          icons: this.getExtensionIcons(ext.path, manifest),
        });
      } catch (error) {
        logger.error('Failed to read extension manifest', { id: ext.id, error });
      }
    }

    return extensions;
  }

  /**
   * Check if extensions are globally enabled
   */
  isExtensionsEnabled(): boolean {
    return this.store.get('extensionsEnabled', true);
  }

  /**
   * Toggle global extensions state
   */
  async setExtensionsEnabled(enabled: boolean): Promise<void> {
    this.store.set('extensionsEnabled', enabled);

    if (enabled) {
      await this.loadPersistedExtensions();
    } else {
      // Unload all extensions
      for (const [id] of this.loadedExtensions) {
        session.defaultSession.removeExtension(id);
      }
      this.loadedExtensions.clear();
    }

    logger.info('Extensions global state changed', { enabled });
  }

  /**
   * Setup Chrome Web Store download interception
   */
  setupWebStoreInterception(): void {
    session.defaultSession.on('will-download', async (_event, item) => {
      const url = item.getURL();
      const mimeType = item.getMimeType();

      // Detect Chrome Web Store extension downloads
      if (mimeType === 'application/x-chrome-extension' ||
          url.includes('.crx') ||
          url.includes('chrome.google.com/webstore')) {

        logger.info('Chrome Web Store download detected', { url: url.substring(0, 100) });

        // Let the download complete to a temp location
        const tempPath = path.join(app.getPath('temp'), item.getFilename());
        item.setSavePath(tempPath);

        item.once('done', async (_, state) => {
          if (state === 'completed') {
            try {
              const extensionInfo = await this.installFromCRX(tempPath);
              logger.info('Extension installed from Web Store', { name: extensionInfo.name });

              // Clean up temp file
              if (fs.existsSync(tempPath)) {
                fs.unlinkSync(tempPath);
              }
            } catch (error) {
              logger.error('Failed to install extension from Web Store', { error });
            }
          }
        });
      }
    });

    logger.info('Chrome Web Store interception setup complete');
  }

  // Private helper methods

  private async loadExtensionFromPath(extensionPath: string): Promise<Extension> {
    const extension = await session.defaultSession.loadExtension(extensionPath, {
      allowFileAccess: true,
    });

    this.loadedExtensions.set(extension.id, extension);
    logger.debug('Extension loaded', { id: extension.id, name: extension.name });

    return extension;
  }

  private readManifest(extensionPath: string): ExtensionManifest {
    const manifestPath = path.join(extensionPath, 'manifest.json');
    const content = fs.readFileSync(manifestPath, 'utf-8');
    return JSON.parse(content);
  }

  private generateExtensionId(name: string): string {
    // Generate a simple ID from the extension name
    const base = name.toLowerCase().replace(/[^a-z0-9]/g, '-').substring(0, 32);
    const timestamp = Date.now().toString(36);
    return `${base}-${timestamp}`;
  }

  private copyDirectory(src: string, dest: string): void {
    fs.mkdirSync(dest, { recursive: true });

    const entries = fs.readdirSync(src, { withFileTypes: true });

    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);

      if (entry.isDirectory()) {
        this.copyDirectory(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  }

  private extensionToInfo(extension: Extension, extensionPath: string, enabled: boolean): ExtensionInfo {
    const manifest = this.readManifest(extensionPath);

    return {
      id: extension.id,
      name: extension.name,
      version: manifest.version,
      description: manifest.description || '',
      enabled,
      path: extensionPath,
      permissions: manifest.permissions,
      manifest,
      icons: this.getExtensionIcons(extensionPath, manifest),
    };
  }

  private getExtensionIcons(extensionPath: string, manifest: ExtensionManifest): { size: number; url: string }[] {
    const icons: { size: number; url: string }[] = [];

    if (manifest.icons) {
      for (const [size, iconPath] of Object.entries(manifest.icons)) {
        const fullPath = path.join(extensionPath, iconPath);
        if (fs.existsSync(fullPath)) {
          // Convert to file:// URL
          icons.push({
            size: parseInt(size),
            url: `file://${fullPath.replace(/\\/g, '/')}`,
          });
        }
      }
    }

    return icons;
  }

  private addToStore(extensionInfo: ExtensionInfo): void {
    const installed = this.store.get('installedExtensions', []);

    // Remove if already exists
    const filtered = installed.filter(e => e.id !== extensionInfo.id);

    // Add new
    filtered.push({
      id: extensionInfo.id,
      path: extensionInfo.path,
      enabled: extensionInfo.enabled,
    });

    this.store.set('installedExtensions', filtered);
  }

  private removeFromStore(extensionId: string): void {
    const installed = this.store.get('installedExtensions', []);
    const filtered = installed.filter(e => e.id !== extensionId);
    this.store.set('installedExtensions', filtered);
  }
}

export const extensionManager = new ExtensionManager();
export default extensionManager;
