import React, { useState, useEffect } from 'react';
import { useSettingsStore } from '../../store';
import { AdvancedSettings as AdvancedSettingsType, ProxySettings } from '../../../shared/types/settings';

const { electronAPI } = window as unknown as { electronAPI: {
  setSettings: (key: string, value: unknown) => Promise<void>;
} };

export function AdvancedSettings() {
  const settings = useSettingsStore((s) => s.settings);
  const setSettings = useSettingsStore((s) => s.setSettings);
  const [advanced, setAdvanced] = useState<AdvancedSettingsType | null>(null);

  useEffect(() => {
    if (settings?.advanced) {
      setAdvanced(settings.advanced);
    }
  }, [settings]);

  const updateSetting = async <K extends keyof AdvancedSettingsType>(
    key: K,
    value: AdvancedSettingsType[K]
  ) => {
    if (!advanced || !settings) return;

    const newAdvanced = { ...advanced, [key]: value };
    setAdvanced(newAdvanced);

    try {
      await electronAPI.setSettings('advanced', newAdvanced);
      setSettings({ ...settings, advanced: newAdvanced });
    } catch (error) {
      console.error('Failed to save setting:', error);
    }
  };

  const updateProxy = async (updates: Partial<ProxySettings>) => {
    if (!advanced || !settings) return;

    const newProxy = { ...advanced.proxy, ...updates };
    const newAdvanced = { ...advanced, proxy: newProxy };
    setAdvanced(newAdvanced);

    try {
      await electronAPI.setSettings('advanced', newAdvanced);
      setSettings({ ...settings, advanced: newAdvanced });
    } catch (error) {
      console.error('Failed to save setting:', error);
    }
  };

  if (!advanced) {
    return <div className="text-[var(--color-fg-muted)]">Loading...</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold mb-1">Advanced</h2>
        <p className="text-sm text-[var(--color-fg-muted)]">
          Advanced settings for power users
        </p>
      </div>

      {/* MCP Port */}
      <div className="space-y-2">
        <label className="block text-sm font-medium">MCP Server Port</label>
        <input
          type="number"
          min="1024"
          max="65535"
          value={advanced.mcpPort}
          onChange={(e) => updateSetting('mcpPort', parseInt(e.target.value) || 9222)}
          className="w-32 px-3 py-2 bg-[var(--color-bg-tertiary)] border border-[var(--color-border-default)] rounded-lg text-sm focus:outline-none focus:border-[var(--color-accent-primary)]"
        />
        <p className="text-xs text-[var(--color-fg-muted)]">
          Port for the MCP WebSocket server (requires restart)
        </p>
      </div>

      {/* Developer Options */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium">Developer Options</h3>

        <label className="flex items-center justify-between p-3 bg-[var(--color-bg-tertiary)] rounded-lg cursor-pointer">
          <div>
            <p className="text-sm font-medium">Enable DevTools</p>
            <p className="text-xs text-[var(--color-fg-muted)]">Allow opening Chrome DevTools (F12)</p>
          </div>
          <input
            type="checkbox"
            checked={advanced.enableDevTools}
            onChange={(e) => updateSetting('enableDevTools', e.target.checked)}
            className="w-5 h-5 rounded accent-[var(--color-accent-primary)]"
          />
        </label>

        <label className="flex items-center justify-between p-3 bg-[var(--color-bg-tertiary)] rounded-lg cursor-pointer">
          <div>
            <p className="text-sm font-medium">Hardware Acceleration</p>
            <p className="text-xs text-[var(--color-fg-muted)]">Use GPU for rendering (may cause issues on some systems)</p>
          </div>
          <input
            type="checkbox"
            checked={advanced.hardwareAcceleration}
            onChange={(e) => updateSetting('hardwareAcceleration', e.target.checked)}
            className="w-5 h-5 rounded accent-[var(--color-accent-primary)]"
          />
        </label>
      </div>

      {/* Proxy */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium">Proxy Settings</h3>

        <label className="flex items-center justify-between p-3 bg-[var(--color-bg-tertiary)] rounded-lg cursor-pointer">
          <div>
            <p className="text-sm font-medium">Enable Proxy</p>
            <p className="text-xs text-[var(--color-fg-muted)]">Route traffic through a proxy server</p>
          </div>
          <input
            type="checkbox"
            checked={advanced.proxy.enabled}
            onChange={(e) => updateProxy({ enabled: e.target.checked })}
            className="w-5 h-5 rounded accent-[var(--color-accent-primary)]"
          />
        </label>

        {advanced.proxy.enabled && (
          <div className="space-y-4 p-4 bg-[var(--color-bg-tertiary)] rounded-lg">
            <div className="space-y-2">
              <label className="block text-sm">Proxy Type</label>
              <select
                value={advanced.proxy.type}
                onChange={(e) => updateProxy({ type: e.target.value as 'http' | 'https' | 'socks5' })}
                className="w-full px-3 py-2 bg-[var(--color-bg-primary)] border border-[var(--color-border-default)] rounded-lg text-sm focus:outline-none focus:border-[var(--color-accent-primary)]"
              >
                <option value="http">HTTP</option>
                <option value="https">HTTPS</option>
                <option value="socks5">SOCKS5</option>
              </select>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2 space-y-2">
                <label className="block text-sm">Host</label>
                <input
                  type="text"
                  value={advanced.proxy.host}
                  onChange={(e) => updateProxy({ host: e.target.value })}
                  placeholder="proxy.example.com"
                  className="w-full px-3 py-2 bg-[var(--color-bg-primary)] border border-[var(--color-border-default)] rounded-lg text-sm focus:outline-none focus:border-[var(--color-accent-primary)]"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm">Port</label>
                <input
                  type="number"
                  value={advanced.proxy.port}
                  onChange={(e) => updateProxy({ port: parseInt(e.target.value) || 8080 })}
                  className="w-full px-3 py-2 bg-[var(--color-bg-primary)] border border-[var(--color-border-default)] rounded-lg text-sm focus:outline-none focus:border-[var(--color-accent-primary)]"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Reset */}
      <div className="pt-4 border-t border-[var(--color-border-default)]">
        <button
          onClick={() => {
            if (confirm('Are you sure you want to reset all settings to defaults?')) {
              // TODO: Implement reset
              console.log('Reset settings');
            }
          }}
          className="px-4 py-2 bg-[var(--color-accent-secondary)] text-white rounded-lg text-sm hover:opacity-90 transition-opacity"
        >
          Reset All Settings
        </button>
      </div>
    </div>
  );
}

export default AdvancedSettings;
