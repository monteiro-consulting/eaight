import React, { useState, useEffect, useRef } from 'react';
import { useBrowserStore } from '../../store';
import { useNavigation } from '../../hooks';
import { NavigationButtons } from './NavigationButtons';
import { SecurityIndicator } from './SecurityIndicator';
import { ExtensionsButton } from './ExtensionsButton';
import { BrowserMenu } from '../BrowserMenu';
import { Button, Tooltip } from '../common';

// Normalize URL input - add protocol if needed or treat as search
function normalizeUrl(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return 'about:blank';

  // Already has protocol
  if (/^[a-z]+:\/\//i.test(trimmed)) return trimmed;

  // Localhost or IP
  if (/^(localhost|(\d{1,3}\.){3}\d{1,3})(:\d+)?/.test(trimmed)) {
    return `http://${trimmed}`;
  }

  // Looks like domain
  if (/^[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+/.test(trimmed) && !/\s/.test(trimmed)) {
    return `https://${trimmed}`;
  }

  // Treat as search
  return `https://www.google.com/search?q=${encodeURIComponent(trimmed)}`;
}

export function URLBar() {
  const tabs = useBrowserStore((state) => state.tabs);
  const activeTabId = useBrowserStore((state) => state.activeTabId);
  const aiPanelVisible = useBrowserStore((state) => state.aiPanelVisible);
  const { navigate } = useNavigation();

  const activeTab = tabs.find((t) => t.id === activeTabId);
  const [inputValue, setInputValue] = useState(activeTab?.url || '');
  const [isFocused, setIsFocused] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Update input when active tab changes
  useEffect(() => {
    if (!isFocused && activeTab && !isNavigating) {
      setInputValue(activeTab.url);
    }
  }, [activeTab?.url, isFocused, isNavigating]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputValue.trim();
    if (trimmed) {
      setIsNavigating(true);
      const url = normalizeUrl(trimmed);
      navigate(url);
      // Update input to show the normalized URL
      setInputValue(url);
      // Reset navigation flag after navigation starts
      setTimeout(() => {
        setIsNavigating(false);
      }, 500);
      inputRef.current?.blur();
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
    inputRef.current?.select();
    // Hide BrowserView to prevent event capture
    window.electronAPI.setOverlayVisible({ visible: true, type: 'dropdown' });
  };

  const handleBlur = () => {
    setIsFocused(false);
    // Don't reset input value if we're navigating
    if (activeTab && !isNavigating) {
      setInputValue(activeTab.url);
    }
    // Restore BrowserView after a short delay
    setTimeout(() => {
      window.electronAPI.setOverlayVisible({ visible: false, type: 'dropdown' });
    }, 100);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      if (activeTab) {
        setInputValue(activeTab.url);
      }
      inputRef.current?.blur();
    }
  };

  const toggleAIPanel = async () => {
    await window.electronAPI.toggleAIPanel();
  };

  const toggleDevTools = () => {
    window.electronAPI.toggleDevTools();
  };

  return (
    <div className="flex items-center gap-2 h-11 px-3 bg-dark-bg-secondary border-b border-dark-bg-tertiary">
      {/* Navigation buttons */}
      <NavigationButtons />

      {/* URL input */}
      <form onSubmit={handleSubmit} className="flex-1">
        <div
          className="flex items-center bg-dark-bg-tertiary rounded-full overflow-hidden"
          onMouseDown={() => {
            // Hide BrowserView before click to ensure input receives the event
            window.electronAPI.setOverlayVisible({ visible: true, type: 'dropdown' });
          }}
        >
          <SecurityIndicator url={inputValue} />
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            placeholder="Search or enter URL"
            className="flex-1 px-3 py-1.5 bg-transparent text-sm focus:outline-none"
          />
        </div>
      </form>

      {/* Action buttons */}
      <div className="flex items-center gap-1">
        <ExtensionsButton />

        <Tooltip content="Toggle AI Panel">
          <Button
            variant="icon"
            size="sm"
            onClick={toggleAIPanel}
            className={aiPanelVisible ? 'text-primary' : ''}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </Button>
        </Tooltip>

        <Tooltip content="Developer Tools (F12)">
          <Button variant="icon" size="sm" onClick={toggleDevTools}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
          </Button>
        </Tooltip>

        <BrowserMenu />
      </div>
    </div>
  );
}

export default URLBar;
