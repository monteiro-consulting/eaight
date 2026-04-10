import { create } from 'zustand';
import { Tab, TabGroup, BrowserState } from '../../shared/types/browser';
import { AppSettings } from '../../shared/types/settings';

interface BrowserStore {
  // State
  tabs: Tab[];
  tabGroups: TabGroup[];
  activeTabId: string | null;
  canGoBack: boolean;
  canGoForward: boolean;
  isLoading: boolean;
  theme: 'dark' | 'light' | 'system';
  aiPanelVisible: boolean;
  settingsOpen: boolean;
  mcpStatus: {
    isRunning: boolean;
    port: number;
    clientCount: number;
  };

  // Actions
  setTabs: (tabs: Tab[]) => void;
  setTabGroups: (tabGroups: TabGroup[]) => void;
  setActiveTabId: (id: string | null) => void;
  setCanGoBack: (can: boolean) => void;
  setCanGoForward: (can: boolean) => void;
  setIsLoading: (loading: boolean) => void;
  setTheme: (theme: 'dark' | 'light' | 'system') => void;
  setAIPanelVisible: (visible: boolean) => void;
  setSettingsOpen: (open: boolean) => void;
  setMCPStatus: (status: { isRunning: boolean; port: number; clientCount: number }) => void;
  updateFromState: (state: Partial<BrowserState>) => void;
}

export const useBrowserStore = create<BrowserStore>((set) => ({
  tabs: [],
  tabGroups: [],
  activeTabId: null,
  canGoBack: false,
  canGoForward: false,
  isLoading: false,
  theme: 'dark',
  aiPanelVisible: true,
  settingsOpen: false,
  mcpStatus: {
    isRunning: false,
    port: 0,
    clientCount: 0,
  },

  setTabs: (tabs) => set({ tabs }),
  setTabGroups: (tabGroups) => set({ tabGroups }),
  setActiveTabId: (activeTabId) => set({ activeTabId }),
  setCanGoBack: (canGoBack) => set({ canGoBack }),
  setCanGoForward: (canGoForward) => set({ canGoForward }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setTheme: (theme) => set({ theme }),
  setAIPanelVisible: (aiPanelVisible) => set({ aiPanelVisible }),
  setSettingsOpen: (settingsOpen) => {
    // Notify main process to hide/show BrowserView for fullpage overlay
    window.electronAPI?.setOverlayVisible({ visible: settingsOpen, type: 'fullpage' });
    set({ settingsOpen });
  },
  setMCPStatus: (mcpStatus) => set({ mcpStatus }),
  updateFromState: (state) => set((prev) => ({
    ...prev,
    ...state,
  })),
}));

interface SettingsStore {
  settings: AppSettings | null;
  setSettings: (settings: AppSettings) => void;
}

export const useSettingsStore = create<SettingsStore>((set) => ({
  settings: null,
  setSettings: (settings) => set({ settings }),
}));
