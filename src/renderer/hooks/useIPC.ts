import { useEffect, useCallback } from 'react';
import { ThemeSetting } from '../../shared/types/theme';
import { useBrowserStore, useSettingsStore } from '../store';

export function useIPC() {
  const updateFromState = useBrowserStore((state) => state.updateFromState);
  const setMCPStatus = useBrowserStore((state) => state.setMCPStatus);
  const setSettings = useSettingsStore((state) => state.setSettings);

  // Initialize state from main process
  useEffect(() => {
    const init = async () => {
      try {
        const state = await window.electronAPI.getState();
        updateFromState(state);

        const settings = await window.electronAPI.getSettings();
        setSettings(settings);

        const mcpStatus = await window.electronAPI.getMCPStatus();
        setMCPStatus(mcpStatus);
      } catch (error) {
        console.error('Failed to initialize state:', error);
      }
    };

    init();
  }, [updateFromState, setSettings, setMCPStatus]);

  // Subscribe to state changes
  useEffect(() => {
    const unsubscribeState = window.electronAPI.onStateChanged((state) => {
      updateFromState(state);
    });

    const unsubscribeSettings = window.electronAPI.onSettingsChanged((settings) => {
      setSettings(settings);
      // Sync aiPanelVisible from settings to browser store
      if (settings.appearance?.showAIPanel !== undefined) {
        useBrowserStore.getState().setAIPanelVisible(settings.appearance.showAIPanel);
      }
    });

    const unsubscribeMCP = window.electronAPI.onMCPStatusChanged((status) => {
      setMCPStatus(status);
    });

    const unsubscribeAIPanel = window.electronAPI.onAIPanelChanged((visible) => {
      useBrowserStore.getState().setAIPanelVisible(visible);
    });

    return () => {
      unsubscribeState();
      unsubscribeSettings();
      unsubscribeMCP();
      unsubscribeAIPanel();
    };
  }, [updateFromState, setSettings, setMCPStatus]);
}

export function useNavigation() {
  const navigate = useCallback((url: string) => {
    return window.electronAPI.navigate(url);
  }, []);

  const goBack = useCallback(() => {
    window.electronAPI.goBack();
  }, []);

  const goForward = useCallback(() => {
    window.electronAPI.goForward();
  }, []);

  const reload = useCallback(() => {
    window.electronAPI.reload();
  }, []);

  const stop = useCallback(() => {
    window.electronAPI.stop();
  }, []);

  return { navigate, goBack, goForward, reload, stop };
}

export function useTabs() {
  const createTab = useCallback((url?: string) => {
    return window.electronAPI.createTab(url);
  }, []);

  const closeTab = useCallback((tabId: string) => {
    return window.electronAPI.closeTab(tabId);
  }, []);

  const switchTab = useCallback((tabId: string) => {
    return window.electronAPI.switchTab(tabId);
  }, []);

  return { createTab, closeTab, switchTab };
}

export function useWindowControls() {
  const minimize = useCallback(() => {
    window.electronAPI.minimize();
  }, []);

  const maximize = useCallback(() => {
    window.electronAPI.maximize();
  }, []);

  const close = useCallback(() => {
    window.electronAPI.close();
  }, []);

  const toggleFullscreen = useCallback(() => {
    window.electronAPI.toggleFullscreen();
  }, []);

  return { minimize, maximize, close, toggleFullscreen };
}

export function useTheme() {
  const theme = useBrowserStore((state) => state.theme);

  const setTheme = useCallback((newTheme: ThemeSetting) => {
    window.electronAPI.setTheme(newTheme);
  }, []);

  return { theme, setTheme };
}
