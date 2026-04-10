import React, { useState, useEffect } from 'react';
import { useSettingsStore } from '../../store';
import { GeneralSettings as GeneralSettingsType } from '../../../shared/types/settings';

const { electronAPI } = window as unknown as { electronAPI: {
  getSettings: () => Promise<unknown>;
  setSettings: (key: string, value: unknown) => Promise<void>;
  showOpenDialog: (options: unknown) => Promise<{ canceled: boolean; filePaths: string[] }>;
} };

export function GeneralSettings() {
  const settings = useSettingsStore((s) => s.settings);
  const setSettings = useSettingsStore((s) => s.setSettings);
  const [general, setGeneral] = useState<GeneralSettingsType | null>(null);

  useEffect(() => {
    if (settings?.general) {
      setGeneral(settings.general);
    }
  }, [settings]);

  const updateSetting = async <K extends keyof GeneralSettingsType>(
    key: K,
    value: GeneralSettingsType[K]
  ) => {
    if (!general || !settings) return;

    const newGeneral = { ...general, [key]: value };
    setGeneral(newGeneral);

    try {
      await electronAPI.setSettings('general', newGeneral);
      setSettings({ ...settings, general: newGeneral });
    } catch (error) {
      console.error('Failed to save setting:', error);
    }
  };

  const handleSelectDownloadPath = async () => {
    try {
      const result = await electronAPI.showOpenDialog({
        properties: ['openDirectory'],
        title: 'Select Download Folder',
      });

      if (!result.canceled && result.filePaths[0]) {
        updateSetting('downloadPath', result.filePaths[0]);
      }
    } catch (error) {
      console.error('Failed to open dialog:', error);
    }
  };

  if (!general) {
    return <div className="text-[var(--color-fg-muted)]">Loading...</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold mb-1">General</h2>
        <p className="text-sm text-[var(--color-fg-muted)]">
          Basic browser settings and preferences
        </p>
      </div>

      {/* Start Page */}
      <div className="space-y-2">
        <label className="block text-sm font-medium">Start Page</label>
        <input
          type="url"
          value={general.startPage}
          onChange={(e) => updateSetting('startPage', e.target.value)}
          className="w-full px-3 py-2 bg-[var(--color-bg-tertiary)] border border-[var(--color-border-default)] rounded-lg text-sm focus:outline-none focus:border-[var(--color-accent-primary)]"
          placeholder="https://www.google.com"
        />
        <p className="text-xs text-[var(--color-fg-muted)]">
          The page that opens when you start eaight or create a new tab
        </p>
      </div>

      {/* Search Engine */}
      <div className="space-y-2">
        <label className="block text-sm font-medium">Default Search Engine</label>
        <select
          value={general.searchEngine}
          onChange={(e) => updateSetting('searchEngine', e.target.value as 'google' | 'bing' | 'duckduckgo')}
          className="w-full px-3 py-2 bg-[var(--color-bg-tertiary)] border border-[var(--color-border-default)] rounded-lg text-sm focus:outline-none focus:border-[var(--color-accent-primary)]"
        >
          <option value="google">Google</option>
          <option value="bing">Bing</option>
          <option value="duckduckgo">DuckDuckGo</option>
        </select>
      </div>

      {/* Language */}
      <div className="space-y-2">
        <label className="block text-sm font-medium">Language</label>
        <select
          value={general.language}
          onChange={(e) => updateSetting('language', e.target.value)}
          className="w-full px-3 py-2 bg-[var(--color-bg-tertiary)] border border-[var(--color-border-default)] rounded-lg text-sm focus:outline-none focus:border-[var(--color-accent-primary)]"
        >
          <option value="en">English</option>
          <option value="fr">Francais</option>
          <option value="es">Espanol</option>
          <option value="de">Deutsch</option>
        </select>
      </div>

      {/* Download Path */}
      <div className="space-y-2">
        <label className="block text-sm font-medium">Download Location</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={general.downloadPath}
            readOnly
            className="flex-1 px-3 py-2 bg-[var(--color-bg-tertiary)] border border-[var(--color-border-default)] rounded-lg text-sm"
          />
          <button
            onClick={handleSelectDownloadPath}
            className="px-4 py-2 bg-[var(--color-bg-tertiary)] border border-[var(--color-border-default)] rounded-lg text-sm hover:bg-[var(--color-accent-primary)] hover:text-white hover:border-transparent transition-colors"
          >
            Browse
          </button>
        </div>
      </div>
    </div>
  );
}

export default GeneralSettings;
