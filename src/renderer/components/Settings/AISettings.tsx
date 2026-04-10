import React, { useState, useEffect } from 'react';
import { useSettingsStore, useBrowserStore } from '../../store';
import { MCPAuthSettings } from '../../../shared/types/settings';

const { electronAPI } = window as unknown as { electronAPI: {
  setSettings: (key: string, value: unknown) => Promise<void>;
} };

export function AISettings() {
  const settings = useSettingsStore((s) => s.settings);
  const setSettings = useSettingsStore((s) => s.setSettings);
  const mcpStatus = useBrowserStore((s) => s.mcpStatus);
  const [mcpAuth, setMcpAuth] = useState<MCPAuthSettings | null>(null);
  const [newApp, setNewApp] = useState('');

  useEffect(() => {
    if (settings?.security?.mcpAuth) {
      setMcpAuth(settings.security.mcpAuth);
    }
  }, [settings]);

  const updateMcpAuth = async (updates: Partial<MCPAuthSettings>) => {
    if (!mcpAuth || !settings) return;

    const newMcpAuth = { ...mcpAuth, ...updates };
    setMcpAuth(newMcpAuth);

    try {
      await electronAPI.setSettings('security', {
        ...settings.security,
        mcpAuth: newMcpAuth,
      });
      setSettings({
        ...settings,
        security: { ...settings.security, mcpAuth: newMcpAuth },
      });
    } catch (error) {
      console.error('Failed to save setting:', error);
    }
  };

  const addAllowedApp = () => {
    if (!newApp.trim() || !mcpAuth) return;
    if (mcpAuth.allowedApps.includes(newApp.trim())) return;

    updateMcpAuth({
      allowedApps: [...mcpAuth.allowedApps, newApp.trim()],
    });
    setNewApp('');
  };

  const removeAllowedApp = (app: string) => {
    if (!mcpAuth) return;
    updateMcpAuth({
      allowedApps: mcpAuth.allowedApps.filter((a) => a !== app),
    });
  };

  if (!mcpAuth) {
    return <div className="text-[var(--color-fg-muted)]">Loading...</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold mb-1">AI & MCP</h2>
        <p className="text-sm text-[var(--color-fg-muted)]">
          Configure how AI assistants connect to and control the browser
        </p>
      </div>

      {/* MCP Status */}
      <div className="p-4 bg-[var(--color-bg-tertiary)] rounded-lg">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium">MCP Server Status</h3>
          <span className={`px-2 py-1 text-xs rounded-full ${
            mcpStatus.isRunning
              ? 'bg-green-500/20 text-green-400'
              : 'bg-red-500/20 text-red-400'
          }`}>
            {mcpStatus.isRunning ? 'Running' : 'Stopped'}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-[var(--color-fg-muted)]">Port</p>
            <p className="font-mono">{mcpStatus.port || 'N/A'}</p>
          </div>
          <div>
            <p className="text-[var(--color-fg-muted)]">Connected Clients</p>
            <p className="font-mono">{mcpStatus.clientCount}</p>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-[var(--color-border-default)]">
          <p className="text-xs text-[var(--color-fg-muted)]">
            Endpoint: <code className="bg-[var(--color-bg-primary)] px-1 rounded">ws://localhost:{mcpStatus.port}/mcp</code>
          </p>
        </div>
      </div>

      {/* Authentication */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium">Authentication</h3>

        <label className="flex items-center justify-between p-3 bg-[var(--color-bg-tertiary)] rounded-lg cursor-pointer">
          <div>
            <p className="text-sm font-medium">Enable Authentication</p>
            <p className="text-xs text-[var(--color-fg-muted)]">Require clients to authenticate before connecting</p>
          </div>
          <input
            type="checkbox"
            checked={mcpAuth.enabled}
            onChange={(e) => updateMcpAuth({ enabled: e.target.checked })}
            className="w-5 h-5 rounded accent-[var(--color-accent-primary)]"
          />
        </label>

        {mcpAuth.enabled && (
          <>
            <div className="space-y-2">
              <label className="block text-sm">Authentication Type</label>
              <select
                value={mcpAuth.type}
                onChange={(e) => updateMcpAuth({ type: e.target.value as 'none' | 'token' | 'approval' })}
                className="w-full px-3 py-2 bg-[var(--color-bg-tertiary)] border border-[var(--color-border-default)] rounded-lg text-sm focus:outline-none focus:border-[var(--color-accent-primary)]"
              >
                <option value="none">None</option>
                <option value="token">Token-based</option>
                <option value="approval">Manual Approval</option>
              </select>
            </div>

            <label className="flex items-center justify-between p-3 bg-[var(--color-bg-tertiary)] rounded-lg cursor-pointer">
              <div>
                <p className="text-sm font-medium">Require Approval for New Apps</p>
                <p className="text-xs text-[var(--color-fg-muted)]">Ask before allowing new AI apps to connect</p>
              </div>
              <input
                type="checkbox"
                checked={mcpAuth.requireApproval}
                onChange={(e) => updateMcpAuth({ requireApproval: e.target.checked })}
                className="w-5 h-5 rounded accent-[var(--color-accent-primary)]"
              />
            </label>
          </>
        )}
      </div>

      {/* Allowed Apps */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium">Allowed Applications</h3>
        <p className="text-xs text-[var(--color-fg-muted)]">
          AI applications that are allowed to connect without approval
        </p>

        <div className="flex gap-2">
          <input
            type="text"
            value={newApp}
            onChange={(e) => setNewApp(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addAllowedApp()}
            placeholder="Enter app name (e.g., claude-code)"
            className="flex-1 px-3 py-2 bg-[var(--color-bg-tertiary)] border border-[var(--color-border-default)] rounded-lg text-sm focus:outline-none focus:border-[var(--color-accent-primary)]"
          />
          <button
            onClick={addAllowedApp}
            className="px-4 py-2 bg-[var(--color-accent-primary)] text-white rounded-lg text-sm hover:opacity-90 transition-opacity"
          >
            Add
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {mcpAuth.allowedApps.map((app) => (
            <span
              key={app}
              className="inline-flex items-center gap-1 px-3 py-1 bg-[var(--color-bg-tertiary)] rounded-full text-sm"
            >
              {app}
              <button
                onClick={() => removeAllowedApp(app)}
                className="ml-1 text-[var(--color-fg-muted)] hover:text-[var(--color-accent-secondary)]"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AISettings;
