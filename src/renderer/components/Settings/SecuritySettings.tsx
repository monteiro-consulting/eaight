import React, { useState, useEffect } from 'react';
import { useSettingsStore } from '../../store';
import { SecuritySettings as SecuritySettingsType, PrivacySettings } from '../../../shared/types/settings';

const { electronAPI } = window as unknown as { electronAPI: {
  setSettings: (key: string, value: unknown) => Promise<void>;
} };

export function SecuritySettings() {
  const settings = useSettingsStore((s) => s.settings);
  const setSettings = useSettingsStore((s) => s.setSettings);
  const [security, setSecurity] = useState<SecuritySettingsType | null>(null);
  const [privacy, setPrivacy] = useState<PrivacySettings | null>(null);

  useEffect(() => {
    if (settings?.security) {
      setSecurity(settings.security);
    }
    if (settings?.privacy) {
      setPrivacy(settings.privacy);
    }
  }, [settings]);

  const updateSecurity = async (updates: Partial<SecuritySettingsType>) => {
    if (!security || !settings) return;

    const newSecurity = { ...security, ...updates };
    setSecurity(newSecurity);

    try {
      await electronAPI.setSettings('security', newSecurity);
      setSettings({ ...settings, security: newSecurity });
    } catch (error) {
      console.error('Failed to save setting:', error);
    }
  };

  const updatePrivacy = async <K extends keyof PrivacySettings>(
    key: K,
    value: PrivacySettings[K]
  ) => {
    if (!privacy || !settings) return;

    const newPrivacy = { ...privacy, [key]: value };
    setPrivacy(newPrivacy);

    try {
      await electronAPI.setSettings('privacy', newPrivacy);
      setSettings({ ...settings, privacy: newPrivacy });
    } catch (error) {
      console.error('Failed to save setting:', error);
    }
  };

  if (!security || !privacy) {
    return <div className="text-[var(--color-fg-muted)]">Loading...</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold mb-1">Security & Privacy</h2>
        <p className="text-sm text-[var(--color-fg-muted)]">
          Control what data is shared and how connections are authenticated
        </p>
      </div>

      {/* Data Sharing */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium">Data Sharing with AI</h3>
        <p className="text-xs text-[var(--color-fg-muted)] mb-3">
          Control what browser data AI clients can access
        </p>

        {[
          { key: 'shareScreenshots' as const, label: 'Screenshots', desc: 'Allow AI to capture page screenshots' },
          { key: 'shareDOM' as const, label: 'Page Content (DOM)', desc: 'Allow AI to read page structure and text' },
          { key: 'shareCookies' as const, label: 'Cookies', desc: 'Allow AI to access cookies (sensitive)' },
          { key: 'sharePasswords' as const, label: 'Passwords', desc: 'Allow AI to access saved passwords (dangerous)' },
        ].map(({ key, label, desc }) => (
          <label
            key={key}
            className="flex items-center justify-between p-3 bg-[var(--color-bg-tertiary)] rounded-lg cursor-pointer"
          >
            <div>
              <p className="text-sm font-medium">{label}</p>
              <p className="text-xs text-[var(--color-fg-muted)]">{desc}</p>
            </div>
            <input
              type="checkbox"
              checked={security.dataSharing[key]}
              onChange={(e) => updateSecurity({
                dataSharing: { ...security.dataSharing, [key]: e.target.checked }
              })}
              className="w-5 h-5 rounded accent-[var(--color-accent-primary)]"
            />
          </label>
        ))}
      </div>

      {/* Privacy */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium">Privacy</h3>

        <label className="flex items-center justify-between p-3 bg-[var(--color-bg-tertiary)] rounded-lg cursor-pointer">
          <div>
            <p className="text-sm font-medium">Do Not Track</p>
            <p className="text-xs text-[var(--color-fg-muted)]">Send "Do Not Track" header to websites</p>
          </div>
          <input
            type="checkbox"
            checked={privacy.doNotTrack}
            onChange={(e) => updatePrivacy('doNotTrack', e.target.checked)}
            className="w-5 h-5 rounded accent-[var(--color-accent-primary)]"
          />
        </label>

        <label className="flex items-center justify-between p-3 bg-[var(--color-bg-tertiary)] rounded-lg cursor-pointer">
          <div>
            <p className="text-sm font-medium">Block Third-Party Cookies</p>
            <p className="text-xs text-[var(--color-fg-muted)]">Prevent tracking cookies from other sites</p>
          </div>
          <input
            type="checkbox"
            checked={privacy.blockThirdPartyCookies}
            onChange={(e) => updatePrivacy('blockThirdPartyCookies', e.target.checked)}
            className="w-5 h-5 rounded accent-[var(--color-accent-primary)]"
          />
        </label>

        <label className="flex items-center justify-between p-3 bg-[var(--color-bg-tertiary)] rounded-lg cursor-pointer">
          <div>
            <p className="text-sm font-medium">Clear Data on Exit</p>
            <p className="text-xs text-[var(--color-fg-muted)]">Delete browsing data when closing eaight</p>
          </div>
          <input
            type="checkbox"
            checked={privacy.clearDataOnExit}
            onChange={(e) => updatePrivacy('clearDataOnExit', e.target.checked)}
            className="w-5 h-5 rounded accent-[var(--color-accent-primary)]"
          />
        </label>
      </div>
    </div>
  );
}

export default SecuritySettings;
