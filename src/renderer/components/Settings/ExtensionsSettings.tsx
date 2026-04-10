// Extensions Settings Page

import React, { useState, useEffect, useCallback } from 'react';
import { ExtensionInfo } from '../../../shared/types/extension';
import { ExtensionCard } from './ExtensionCard';

export function ExtensionsSettings() {
  const [extensions, setExtensions] = useState<ExtensionInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [installing, setInstalling] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  // Load extensions on mount
  useEffect(() => {
    loadExtensions();

    // Listen for extension changes
    const unsubInstall = window.electronAPI?.onExtensionInstalled((ext) => {
      setExtensions((prev) => [...prev.filter((e) => e.id !== ext.id), ext]);
      setInstalling(false);
    });

    const unsubRemove = window.electronAPI?.onExtensionRemoved((id) => {
      setExtensions((prev) => prev.filter((e) => e.id !== id));
    });

    const unsubUpdate = window.electronAPI?.onExtensionUpdated((data) => {
      setExtensions((prev) =>
        prev.map((e) => (e.id === data.id ? { ...e, enabled: data.enabled } : e))
      );
    });

    return () => {
      unsubInstall?.();
      unsubRemove?.();
      unsubUpdate?.();
    };
  }, []);

  const loadExtensions = async () => {
    try {
      const exts = await window.electronAPI?.getExtensions();
      setExtensions(exts || []);
    } catch (error) {
      console.error('Failed to load extensions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (id: string, enabled: boolean) => {
    try {
      if (enabled) {
        await window.electronAPI?.enableExtension(id);
      } else {
        await window.electronAPI?.disableExtension(id);
      }
    } catch (error) {
      console.error('Failed to toggle extension:', error);
    }
  };

  const handleUninstall = async (id: string) => {
    if (!confirm('Are you sure you want to uninstall this extension?')) {
      return;
    }

    try {
      await window.electronAPI?.uninstallExtension(id);
    } catch (error) {
      console.error('Failed to uninstall extension:', error);
    }
  };

  const handleLoadUnpacked = async () => {
    try {
      const folderPath = await window.electronAPI?.selectFolder();
      if (folderPath) {
        setInstalling(true);
        await window.electronAPI?.installExtension(folderPath);
      }
    } catch (error) {
      console.error('Failed to install extension:', error);
      setInstalling(false);
      alert('Failed to install extension. Make sure the folder contains a valid manifest.json');
    }
  };

  // Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;

    setInstalling(true);

    try {
      for (const file of files) {
        const filePath = (file as any).path;
        if (!filePath) continue;

        if (filePath.endsWith('.crx')) {
          await window.electronAPI?.installExtensionCRX(filePath);
        } else {
          // Assume it's a folder (unpacked extension)
          await window.electronAPI?.installExtension(filePath);
        }
      }
    } catch (error) {
      console.error('Failed to install dropped extension:', error);
      alert('Failed to install extension. Make sure it is a valid .crx file or unpacked extension folder.');
    } finally {
      setInstalling(false);
    }
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold text-[var(--color-fg-primary)]">Extensions</h2>
        <p className="text-sm text-[var(--color-fg-muted)] mt-1">
          Manage your browser extensions
        </p>
      </div>

      {/* Drop Zone / Install Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragOver
            ? 'border-[var(--color-accent-primary)] bg-[var(--color-accent-primary)]/10'
            : 'border-[var(--color-border-default)] hover:border-[var(--color-fg-muted)]'
        }`}
      >
        {installing ? (
          <div className="flex items-center justify-center gap-3">
            <svg className="animate-spin h-5 w-5 text-[var(--color-accent-primary)]" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span className="text-[var(--color-fg-primary)]">Installing extension...</span>
          </div>
        ) : (
          <>
            <svg className="w-12 h-12 mx-auto text-[var(--color-fg-muted)] mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
            </svg>
            <p className="text-[var(--color-fg-primary)] mb-2">
              Drag and drop a <strong>.crx file</strong> or <strong>extension folder</strong> here
            </p>
            <p className="text-sm text-[var(--color-fg-muted)] mb-4">
              Or click the button below to select an unpacked extension
            </p>
            <button
              onClick={handleLoadUnpacked}
              className="px-4 py-2 rounded-lg bg-[var(--color-accent-primary)] text-white hover:opacity-90 transition-opacity"
            >
              Load Unpacked Extension
            </button>
          </>
        )}
      </div>

      {/* Chrome Web Store Info */}
      <div className="bg-[var(--color-bg-tertiary)] rounded-lg p-4 flex items-start gap-3">
        <svg className="w-5 h-5 text-[var(--color-accent-info)] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div>
          <p className="text-sm text-[var(--color-fg-primary)]">
            <strong>Chrome Web Store</strong>
          </p>
          <p className="text-sm text-[var(--color-fg-muted)] mt-1">
            You can also install extensions directly from the Chrome Web Store.
            Just navigate to <a href="https://chrome.google.com/webstore" className="text-[var(--color-accent-primary)] hover:underline">chrome.google.com/webstore</a> and
            click "Add to Chrome" on any extension.
          </p>
        </div>
      </div>

      {/* Extensions List */}
      <div>
        <h3 className="text-sm font-medium text-[var(--color-fg-muted)] uppercase tracking-wide mb-3">
          Installed Extensions ({extensions.length})
        </h3>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <svg className="animate-spin h-6 w-6 text-[var(--color-fg-muted)]" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
        ) : extensions.length === 0 ? (
          <div className="bg-[var(--color-bg-tertiary)] rounded-lg p-8 text-center">
            <svg className="w-12 h-12 mx-auto text-[var(--color-fg-muted)] mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
            </svg>
            <p className="text-[var(--color-fg-muted)]">No extensions installed</p>
            <p className="text-sm text-[var(--color-fg-muted)] mt-1">
              Install extensions from the Chrome Web Store or load unpacked extensions
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {extensions.map((ext) => (
              <ExtensionCard
                key={ext.id}
                extension={ext}
                onToggle={handleToggle}
                onUninstall={handleUninstall}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ExtensionsSettings;
