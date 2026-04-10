// useThemeCSS - Hook for injecting CSS variables from theme

import { useEffect, useState, useCallback } from 'react';
import { Theme, ThemeCustomizations } from '../../shared/types/theme';

interface ThemeCSSData {
  cssVars: Record<string, string>;
  type: 'dark' | 'light';
}

/**
 * Hook that manages CSS variable injection for theming
 * Applies theme colors as CSS custom properties to :root
 */
export function useThemeCSS() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [themeType, setThemeType] = useState<'dark' | 'light'>('dark');

  /**
   * Apply CSS variables to the document root
   */
  const applyCSSVariables = useCallback((cssVars: Record<string, string>) => {
    const root = document.documentElement;

    // Apply all CSS variables
    for (const [key, value] of Object.entries(cssVars)) {
      root.style.setProperty(key, value);
    }
  }, []);

  /**
   * Handle theme CSS update from main process
   */
  const handleThemeCSSUpdate = useCallback((data: ThemeCSSData) => {
    applyCSSVariables(data.cssVars);
    setThemeType(data.type);

    // Update document class for dark/light mode
    document.documentElement.classList.remove('dark', 'light');
    document.documentElement.classList.add(data.type);
  }, [applyCSSVariables]);

  /**
   * Load initial theme CSS on mount
   */
  useEffect(() => {
    const loadThemeCSS = async () => {
      try {
        const data = await window.electronAPI.getThemeCSS();
        handleThemeCSSUpdate(data);
        setIsLoaded(true);
      } catch (error) {
        console.error('Failed to load theme CSS:', error);
        // Apply fallback
        setIsLoaded(true);
      }
    };

    loadThemeCSS();
  }, [handleThemeCSSUpdate]);

  /**
   * Listen for theme CSS updates
   */
  useEffect(() => {
    const unsubscribe = window.electronAPI.onThemeCSSUpdated(handleThemeCSSUpdate);
    return unsubscribe;
  }, [handleThemeCSSUpdate]);

  return {
    isLoaded,
    themeType,
  };
}

/**
 * Hook for managing theme customizations
 */
export function useThemeCustomizations() {
  const [customizations, setCustomizations] = useState<ThemeCustomizations>({});
  const [availableThemes, setAvailableThemes] = useState<Theme[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Load customizations and available themes
   */
  useEffect(() => {
    const loadData = async () => {
      try {
        const [customs, themes] = await Promise.all([
          window.electronAPI.getThemeCustomizations(),
          window.electronAPI.getAllThemes(),
        ]);
        setCustomizations(customs);
        setAvailableThemes(themes);
      } catch (error) {
        console.error('Failed to load theme data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  /**
   * Update a single color token
   */
  const setColorToken = useCallback(async (token: string, value: string) => {
    await window.electronAPI.setColorToken(token, value);
    // Optimistically update local state
    setCustomizations(prev => ({
      ...prev,
      tokens: {
        ...prev.tokens,
        [token]: value,
      },
    }));
  }, []);

  /**
   * Reset a single token to default
   */
  const resetColorToken = useCallback(async (token: string) => {
    await window.electronAPI.resetColorToken(token);
    // Update local state
    setCustomizations(prev => {
      const newCustomizations = { ...prev };
      if (newCustomizations.tokens) {
        delete (newCustomizations.tokens as Record<string, string>)[token];
      }
      return newCustomizations;
    });
  }, []);

  /**
   * Reset all customizations
   */
  const resetAll = useCallback(async () => {
    await window.electronAPI.resetAllCustomizations();
    setCustomizations({});
  }, []);

  /**
   * Update all customizations at once
   */
  const updateCustomizations = useCallback(async (newCustomizations: ThemeCustomizations) => {
    await window.electronAPI.setThemeCustomizations(newCustomizations);
    setCustomizations(newCustomizations);
  }, []);

  /**
   * Import a theme from file
   */
  const importTheme = useCallback(async (filePath: string) => {
    const theme = await window.electronAPI.importTheme(filePath);
    if (theme) {
      setAvailableThemes(prev => [...prev, theme]);
    }
    return theme;
  }, []);

  /**
   * Export current theme to file
   */
  const exportTheme = useCallback(async (filePath: string) => {
    return window.electronAPI.exportTheme(filePath);
  }, []);

  return {
    customizations,
    availableThemes,
    isLoading,
    setColorToken,
    resetColorToken,
    resetAll,
    updateCustomizations,
    importTheme,
    exportTheme,
  };
}

export default useThemeCSS;
