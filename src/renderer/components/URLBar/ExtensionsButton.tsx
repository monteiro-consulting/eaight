// Extensions Button with Popup

import React, { useState, useEffect, useRef } from 'react';
import { ExtensionInfo } from '../../../shared/types/extension';
import { Button, Tooltip } from '../common';
import { useBrowserStore } from '../../store';

export function ExtensionsButton() {
  const [extensions, setExtensions] = useState<ExtensionInfo[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const setSettingsOpen = useBrowserStore((s) => s.setSettingsOpen);

  // Load extensions
  useEffect(() => {
    loadExtensions();

    const unsubInstall = window.electronAPI?.onExtensionInstalled((ext) => {
      setExtensions((prev) => [...prev.filter((e) => e.id !== ext.id), ext]);
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

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        popupRef.current &&
        !popupRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const loadExtensions = async () => {
    try {
      const exts = await window.electronAPI?.getExtensions();
      setExtensions(exts || []);
    } catch (error) {
      console.error('Failed to load extensions:', error);
    }
  };

  const enabledExtensions = extensions.filter((e) => e.enabled);

  const handleManageClick = () => {
    setIsOpen(false);
    setSettingsOpen(true);
    // TODO: Navigate to extensions tab in settings
  };

  return (
    <div className="relative">
      <Tooltip content="Extensions">
        <Button
          ref={buttonRef}
          variant="icon"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className={isOpen ? 'bg-[var(--color-bg-tertiary)]' : ''}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
          </svg>
          {enabledExtensions.length > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-[var(--color-accent-primary)] text-white text-[10px] rounded-full flex items-center justify-center">
              {enabledExtensions.length}
            </span>
          )}
        </Button>
      </Tooltip>

      {/* Popup */}
      {isOpen && (
        <div
          ref={popupRef}
          className="absolute right-0 top-full mt-2 w-72 bg-[var(--color-bg-secondary)] border border-[var(--color-border-default)] rounded-lg shadow-xl z-50 overflow-hidden"
        >
          {/* Header */}
          <div className="px-3 py-2 border-b border-[var(--color-border-default)] flex items-center justify-between">
            <span className="text-sm font-medium text-[var(--color-fg-primary)]">Extensions</span>
            <button
              onClick={handleManageClick}
              className="text-xs text-[var(--color-accent-primary)] hover:underline"
            >
              Manage
            </button>
          </div>

          {/* Extensions List */}
          <div className="max-h-80 overflow-y-auto">
            {extensions.length === 0 ? (
              <div className="px-3 py-6 text-center">
                <svg className="w-8 h-8 mx-auto text-[var(--color-fg-muted)] mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
                </svg>
                <p className="text-sm text-[var(--color-fg-muted)]">No extensions installed</p>
              </div>
            ) : (
              extensions.map((ext) => {
                const iconUrl = ext.icons?.sort((a, b) => b.size - a.size)[0]?.url;
                return (
                  <div
                    key={ext.id}
                    className={`px-3 py-2 flex items-center gap-3 hover:bg-[var(--color-bg-tertiary)] cursor-pointer ${
                      !ext.enabled ? 'opacity-50' : ''
                    }`}
                  >
                    {/* Icon */}
                    <div className="w-8 h-8 rounded bg-[var(--color-bg-tertiary)] flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {iconUrl ? (
                        <img src={iconUrl} alt={ext.name} className="w-6 h-6 object-contain" />
                      ) : (
                        <svg className="w-4 h-4 text-[var(--color-fg-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
                        </svg>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-[var(--color-fg-primary)] truncate">{ext.name}</p>
                      <p className="text-xs text-[var(--color-fg-muted)]">
                        {ext.enabled ? 'Enabled' : 'Disabled'}
                      </p>
                    </div>

                    {/* Status indicator */}
                    <div
                      className={`w-2 h-2 rounded-full ${
                        ext.enabled ? 'bg-[var(--color-accent-success)]' : 'bg-[var(--color-fg-muted)]'
                      }`}
                    />
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="px-3 py-2 border-t border-[var(--color-border-default)] bg-[var(--color-bg-tertiary)]">
            <button
              onClick={handleManageClick}
              className="w-full text-left text-sm text-[var(--color-fg-secondary)] hover:text-[var(--color-fg-primary)] flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Manage extensions
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ExtensionsButton;
