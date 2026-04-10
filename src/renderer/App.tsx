import React, { useEffect } from 'react';
import { TabBar } from './components/TabBar';
import { URLBar } from './components/URLBar';
import { BookmarksBar } from './components/BookmarksBar';
import { AIPanel } from './components/AIPanel';
import { SettingsPage } from './components/Settings';
import { NewTabPage } from './components/NTP';
import { useIPC, useKeyboardShortcuts } from './hooks';
import { useThemeCSS } from './hooks/useThemeCSS';
import { useBrowserStore } from './store';

function App() {
  // Initialize IPC and state sync
  useIPC();

  // Enable keyboard shortcuts
  useKeyboardShortcuts();

  // Initialize theme CSS variables
  const { isLoaded } = useThemeCSS();

  // Settings page state
  const settingsOpen = useBrowserStore((s) => s.settingsOpen);
  const tabs = useBrowserStore((s) => s.tabs);
  const activeTabId = useBrowserStore((s) => s.activeTabId);

  // Check if current tab is NTP (new tab page)
  const activeTab = tabs.find((t) => t.id === activeTabId);
  const isNTP = !activeTab?.url || activeTab.url === 'about:blank' || activeTab.url === 'eaight://newtab';

  // Hide/show BrowserView when NTP is active
  useEffect(() => {
    if (settingsOpen) return; // Settings handles its own overlay
    window.electronAPI?.setOverlayVisible({ visible: isNTP, type: 'fullpage' });
  }, [isNTP, settingsOpen]);

  // Show nothing until theme is loaded to prevent flash
  if (!isLoaded) {
    return null;
  }

  // Show settings page if open
  if (settingsOpen) {
    return <SettingsPage />;
  }

  return (
    <div className="h-screen flex flex-col bg-[var(--color-bg-primary)] text-[var(--fg-primary,var(--color-fg-primary))]">
      {/* Tab bar */}
      <TabBar />

      {/* URL bar */}
      <URLBar />

      {/* Bookmarks bar */}
      <BookmarksBar />

      {/* Main content area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Browser view placeholder or NTP */}
        <div className="flex-1">
          {isNTP ? (
            <NewTabPage />
          ) : (
            <div className="w-full h-full bg-white">
              {/* This area is overlaid by BrowserView */}
            </div>
          )}
        </div>

        {/* AI Panel */}
        <AIPanel />
      </div>
    </div>
  );
}

export default App;
