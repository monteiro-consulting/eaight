// Settings Manager - Manages application settings

import Store from 'electron-store';
import { AppSettings, DEFAULT_SETTINGS } from '../../shared/types/settings';
import { ThemeSetting } from '../../shared/types/theme';
import { logger } from '../utils/logger';

class SettingsManager {
  private store: Store<AppSettings>;

  constructor() {
    this.store = new Store<AppSettings>({
      name: 'settings',
      defaults: DEFAULT_SETTINGS,
    });
    logger.info('SettingsManager initialized');
  }

  get<K extends keyof AppSettings>(key: K): AppSettings[K] {
    return this.store.get(key);
  }

  set<K extends keyof AppSettings>(key: K, value: AppSettings[K]): void {
    this.store.set(key, value);
    logger.debug('Settings updated', { key, value });
  }

  getAll(): AppSettings {
    return this.store.store;
  }

  setAll(settings: Partial<AppSettings>): void {
    Object.entries(settings).forEach(([key, value]) => {
      this.store.set(key as keyof AppSettings, value as AppSettings[keyof AppSettings]);
    });
    logger.debug('Settings batch updated');
  }

  reset(): void {
    this.store.clear();
    logger.info('Settings reset to defaults');
  }

  // Convenience getters
  getTheme(): ThemeSetting {
    return this.get('appearance').theme;
  }

  setTheme(theme: ThemeSetting): void {
    const appearance = this.get('appearance');
    this.set('appearance', { ...appearance, theme });
  }

  getMCPPort(): number {
    return this.get('advanced').mcpPort;
  }

  isAIPanelVisible(): boolean {
    return this.get('appearance').showAIPanel;
  }

  setAIPanelVisible(visible: boolean): void {
    const appearance = this.get('appearance');
    this.set('appearance', { ...appearance, showAIPanel: visible });
  }

  getAIPanelWidth(): number {
    return this.get('appearance').aiPanelWidth || 350;
  }

  getStartPage(): string {
    return this.get('general').startPage;
  }

  isMCPAuthEnabled(): boolean {
    return this.get('security').mcpAuth.enabled;
  }

  getAllowedApps(): string[] {
    return this.get('security').mcpAuth.allowedApps;
  }
}

export const settingsManager = new SettingsManager();
export default settingsManager;
