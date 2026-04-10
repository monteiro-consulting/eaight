import React, { useState, useEffect } from 'react';
import { useSettingsStore, useBrowserStore } from '../../store';
import { AppearanceSettings as AppearanceSettingsType } from '../../../shared/types/settings';
import { ThemeSetting } from '../../../shared/types/theme';

const { electronAPI } = window as unknown as { electronAPI: {
  setSettings: (key: string, value: unknown) => Promise<void>;
  setTheme: (theme: ThemeSetting) => Promise<void>;
} };

export function AppearanceSettings() {
  const settings = useSettingsStore((s) => s.settings);
  const setSettings = useSettingsStore((s) => s.setSettings);
  const setTheme = useBrowserStore((s) => s.setTheme);
  const setAIPanelVisible = useBrowserStore((s) => s.setAIPanelVisible);
  const [appearance, setAppearance] = useState<AppearanceSettingsType | null>(null);

  useEffect(() => {
    if (settings?.appearance) {
      setAppearance(settings.appearance);
    }
  }, [settings]);

  const updateSetting = async <K extends keyof AppearanceSettingsType>(
    key: K,
    value: AppearanceSettingsType[K]
  ) => {
    if (!appearance || !settings) return;

    const newAppearance = { ...appearance, [key]: value };
    setAppearance(newAppearance);

    try {
      await electronAPI.setSettings('appearance', newAppearance);
      setSettings({ ...settings, appearance: newAppearance });

      // Update theme in store if theme changed
      if (key === 'theme') {
        setTheme(value as 'dark' | 'light' | 'system');
        await electronAPI.setTheme(value as ThemeSetting);
      }

      // Update AI panel visibility
      if (key === 'showAIPanel') {
        setAIPanelVisible(value as boolean);
      }
    } catch (error) {
      console.error('Failed to save setting:', error);
    }
  };

  if (!appearance) {
    return <div className="text-[var(--color-fg-muted)]">Loading...</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold mb-1">Appearance</h2>
        <p className="text-sm text-[var(--color-fg-muted)]">
          Customize the look and feel of eaight
        </p>
      </div>

      {/* Theme */}
      <div className="space-y-3">
        <label className="block text-sm font-medium">Theme</label>
        <div className="grid grid-cols-3 gap-3">
          {(['light', 'dark', 'system'] as const).map((theme) => (
            <button
              key={theme}
              onClick={() => updateSetting('theme', theme)}
              className={`p-4 rounded-lg border-2 transition-colors ${
                appearance.theme === theme
                  ? 'border-[var(--color-accent-primary)] bg-[var(--color-accent-primary)]/10'
                  : 'border-[var(--color-border-default)] hover:border-[var(--color-fg-muted)]'
              }`}
            >
              <div className={`w-full h-16 rounded mb-2 ${
                theme === 'light' ? 'bg-white border' :
                theme === 'dark' ? 'bg-gray-900' :
                'bg-gradient-to-r from-white to-gray-900'
              }`} />
              <span className="text-sm font-medium capitalize">{theme}</span>
            </button>
          ))}
        </div>
      </div>

      {/* AI Panel */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium">AI Panel</h3>

        <label className="flex items-center justify-between p-3 bg-[var(--color-bg-tertiary)] rounded-lg cursor-pointer">
          <div>
            <p className="text-sm font-medium">Show AI Panel</p>
            <p className="text-xs text-[var(--color-fg-muted)]">Display the AI assistant panel on the side</p>
          </div>
          <input
            type="checkbox"
            checked={appearance.showAIPanel}
            onChange={(e) => updateSetting('showAIPanel', e.target.checked)}
            className="w-5 h-5 rounded accent-[var(--color-accent-primary)]"
          />
        </label>

        <div className="space-y-2">
          <label className="block text-sm">Panel Position</label>
          <div className="flex gap-2">
            {(['left', 'right'] as const).map((pos) => (
              <button
                key={pos}
                onClick={() => updateSetting('aiPanelPosition', pos)}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                  appearance.aiPanelPosition === pos
                    ? 'bg-[var(--color-accent-primary)] text-white'
                    : 'bg-[var(--color-bg-tertiary)] hover:bg-[var(--color-bg-tertiary)]/80'
                }`}
              >
                {pos.charAt(0).toUpperCase() + pos.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm">Panel Width: {appearance.aiPanelWidth}px</label>
          <input
            type="range"
            min="280"
            max="600"
            step="10"
            value={appearance.aiPanelWidth}
            onChange={(e) => updateSetting('aiPanelWidth', parseInt(e.target.value))}
            className="w-full accent-[var(--color-accent-primary)]"
          />
        </div>
      </div>
    </div>
  );
}

export default AppearanceSettings;
