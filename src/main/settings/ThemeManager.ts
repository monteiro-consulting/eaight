// Theme Manager - Manages application themes with VS Code-like customization

import * as fs from 'fs';
import * as path from 'path';
import { nativeTheme, BrowserWindow } from 'electron';
import { getThemesPath, getUserDataPath } from '../utils/paths';
import { logger } from '../utils/logger';
import settingsManager from './SettingsManager';
import {
  Theme,
  ThemeCustomizations,
  ResolvedTheme,
  ThemeSetting,
} from '../../shared/types/theme';
import {
  defaultDarkTheme,
  defaultLightTheme,
  resolveTheme,
  themeToCSSVariables,
} from './ThemeResolver';

class ThemeManager {
  private themes: Map<string, Theme> = new Map();
  private currentTheme: ResolvedTheme | null = null;
  private customizations: ThemeCustomizations = {};
  private customizationsPath: string;

  constructor() {
    this.customizationsPath = path.join(getUserDataPath(), 'theme-customizations.json');
    this.loadBuiltInThemes();
    this.loadCustomThemes();
    this.loadCustomizations();
    this.setupSystemThemeListener();
  }

  private loadBuiltInThemes(): void {
    // Register built-in themes
    this.themes.set(defaultDarkTheme.name, defaultDarkTheme);
    this.themes.set(defaultLightTheme.name, defaultLightTheme);

    logger.debug('Built-in themes loaded', {
      themes: [defaultDarkTheme.displayName, defaultLightTheme.displayName]
    });
  }

    private loadCustomThemes(): void {

      const themesPaths = [

        getThemesPath(), // Bundled themes

        path.join(getUserDataPath(), 'user-themes') // User-installed themes

      ];

  

      for (const themesPath of themesPaths) {

        try {

          if (fs.existsSync(themesPath)) {

            const files = fs.readdirSync(themesPath);

            for (const file of files) {

              if (file.endsWith('.json') && file !== 'schema.json') {

                try {

                  const themePath = path.join(themesPath, file);

                  const content = fs.readFileSync(themePath, 'utf-8');

                  const theme = JSON.parse(content) as Theme;

  

                  // Remap 'colors' to 'palette' for backwards compatibility and consistency

                  if ((theme as any).colors) {

                    theme.palette = (theme as any).colors;

                    delete (theme as any).colors;

                  }

  

                  // Validate required fields

                  if (theme.name && theme.type && theme.palette) {

                    this.themes.set(theme.name, theme);

                    logger.debug('Custom theme loaded', { name: theme.name });

                  }

                } catch (err) {

                  logger.warn('Failed to load theme file', { file, error: err });

                }

              }

            }

          }

        } catch (error) {

          logger.warn('Failed to load custom themes', { error });

        }

      }

      logger.info('ThemeManager initialized', { themeCount: this.themes.size });

    }

  

    private loadCustomizations(): void {

      try {

        if (fs.existsSync(this.customizationsPath)) {

          const content = fs.readFileSync(this.customizationsPath, 'utf-8');

          this.customizations = JSON.parse(content);

          logger.debug('Theme customizations loaded');

        }

      } catch (error) {

        logger.warn('Failed to load theme customizations', { error });

        this.customizations = {};

      }

    }

  

    private saveCustomizations(): void {

      try {

        const dir = path.dirname(this.customizationsPath);

        if (!fs.existsSync(dir)) {

          fs.mkdirSync(dir, { recursive: true });

        }

        fs.writeFileSync(

          this.customizationsPath,

          JSON.stringify(this.customizations, null, 2),

          'utf-8'

        );

        logger.debug('Theme customizations saved');

      } catch (error) {

        logger.error('Failed to save theme customizations', { error });

      }

    }

  

    private setupSystemThemeListener(): void {

      nativeTheme.on('updated', () => {

        const setting = settingsManager.getTheme();

        if (setting === 'system') {

          this.applySystemTheme();

          this.broadcastThemeChange();

        }

      });

    }

  

    private applySystemTheme(): void {

      const isDark = nativeTheme.shouldUseDarkColors;

      const themeName = isDark ? defaultDarkTheme.name : defaultLightTheme.name;

      const theme = this.themes.get(themeName) || (isDark ? defaultDarkTheme : defaultLightTheme);

      this.currentTheme = resolveTheme(theme, this.customizations);

    }

  

    private broadcastThemeChange(): void {

      const cssVars = this.getCSSVariables();

      const themeType = this.currentTheme?.type || 'dark';

  

      BrowserWindow.getAllWindows().forEach(window => {

        window.webContents.send('theme-css-updated', { cssVars, type: themeType });

      });

    }

  

    /**

     * Get a theme by name

     */

    getTheme(name: string): Theme | undefined {

      return this.themes.get(name);

    }

  

    /**

     * Get all available themes

     */

    getAllThemes(): Theme[] {

      return Array.from(this.themes.values());

    }

  

    /**

     * Get the current resolved theme

     */

    getCurrentTheme(): ResolvedTheme {

      if (this.currentTheme) {

        return this.currentTheme;

      }

  

      const setting = settingsManager.getTheme();

      this.setTheme(setting);

      return this.currentTheme!;

    }

  

    /**

     * Get CSS variables for the current theme

     */

    getCSSVariables(): Record<string, string> {

      const theme = this.getCurrentTheme();

      return themeToCSSVariables(theme);

    }

  

    /**

     * Set the active theme

     */

    setTheme(nameOrType: ThemeSetting): void {

      let theme: Theme;

  

      if (nameOrType === 'system') {

        settingsManager.setTheme('system');

        this.applySystemTheme();

        return;

      } else if (nameOrType === 'dark') {

        settingsManager.setTheme('dark');

        theme = this.themes.get(defaultDarkTheme.name) || defaultDarkTheme;

      } else if (nameOrType === 'light') {

        settingsManager.setTheme('light');

        theme = this.themes.get(defaultLightTheme.name) || defaultLightTheme;

      } else if (this.themes.has(nameOrType)) {

        theme = this.themes.get(nameOrType)!;

        // Store custom theme name in settings

        settingsManager.setTheme(nameOrType);

      } else {

        logger.warn('Unknown theme', { name: nameOrType });

        theme = defaultDarkTheme;

      }

  

      this.currentTheme = resolveTheme(theme, this.customizations);

    }

  

    /**

     * Get current customizations

     */

    getCustomizations(): ThemeCustomizations {

      return this.customizations;

    }

  

    /**

     * Update theme customizations

     */

    setCustomizations(customizations: ThemeCustomizations): void {

      this.customizations = customizations;

      this.saveCustomizations();

  

      // Re-resolve current theme with new customizations

      const setting = settingsManager.getTheme();

      if (setting === 'system') {

        this.applySystemTheme();

      }

      else {

        const themeName = setting === 'dark' ? defaultDarkTheme.name :

                          setting === 'light' ? defaultLightTheme.name : setting;

        const theme = this.themes.get(themeName) || defaultDarkTheme;

        this.currentTheme = resolveTheme(theme, this.customizations);

      }

  

      this.broadcastThemeChange();

    }

  

    /**

     * Update a single color token

     */

    setColorToken(token: string, value: string): void {

      // Determine if it's a palette or semantic token

      if (token.startsWith('color.') || token.includes('bg.') || token.includes('fg.') ||

          token.includes('accent.') || token.includes('border.') ||

          ['success', 'warning', 'error', 'info'].includes(token)) {

        // Palette token

        const paletteKey = token.replace('color.', '') as keyof ThemeCustomizations['palette'];

        this.customizations.palette = {

          ...this.customizations.palette,

          [paletteKey]: value,

        };

      } else {

        // Semantic token

        this.customizations.tokens = {

          ...this.customizations.tokens,

          [token]: value,

        };

      }

  

      this.saveCustomizations();

  

      // Re-resolve and broadcast

      const setting = settingsManager.getTheme();

      if (setting === 'system') {

        this.applySystemTheme();

      }

      else {

        const themeName = setting === 'dark' ? defaultDarkTheme.name :

                          setting === 'light' ? defaultLightTheme.name : setting;

        const theme = this.themes.get(themeName) || defaultDarkTheme;

        this.currentTheme = resolveTheme(theme, this.customizations);

      }

  

      this.broadcastThemeChange();

    }

  

    /**

     * Reset all customizations

     */

    resetCustomizations(): void {

      this.customizations = {};

      this.saveCustomizations();

  

      const setting = settingsManager.getTheme();

      this.setTheme(setting);

      this.broadcastThemeChange();

    }

  

    /**

     * Reset a specific token to default

     */

    resetColorToken(token: string): void {

      if (this.customizations.palette) {

        delete (this.customizations.palette as Record<string, string>)[token];

      }

      if (this.customizations.tokens) {

        delete (this.customizations.tokens as Record<string, string>)[token];

      }

  

      this.saveCustomizations();

  

      const setting = settingsManager.getTheme();

      this.setTheme(setting);

      this.broadcastThemeChange();

    }

  

    /**

     * Register a new theme

     */

    registerTheme(theme: Theme): void {

      this.themes.set(theme.name, theme);

      logger.info('Theme registered', { name: theme.name });

    }

  

    /**

     * Import a theme from a file path

     */

    importTheme(filePath: string): Theme | null {

      try {

        const content = fs.readFileSync(filePath, 'utf-8');

        const theme = JSON.parse(content) as Theme;

  

        if (!theme.name || !theme.type || !theme.palette) {

          throw new Error('Invalid theme structure');

        }

  

        this.registerTheme(theme);

  

        // Copy to themes folder

        const targetPath = path.join(getThemesPath(), `${theme.name}.json`);

        fs.copyFileSync(filePath, targetPath);

  

        return theme;

      } catch (error) {

        logger.error('Failed to import theme', { filePath, error });

        return null;

      }

    }

  

    /**

     * Export current theme with customizations

     */

    exportTheme(filePath: string): boolean {

      try {

        const theme = this.getCurrentTheme();

        const exportData = {

          name: theme.name + '-custom',

          displayName: theme.name + ' (Custom)',

          type: theme.type,

          version: '1.0.0',

          palette: theme.palette,

          tokens: theme.tokens,

          fonts: theme.fonts,

          spacing: theme.spacing,

        };

  

        fs.writeFileSync(filePath, JSON.stringify(exportData, null, 2), 'utf-8');

        return true;

      } catch (error) {

        logger.error('Failed to export theme', { filePath, error });

        return false;

      }

    }

  

    /**

     * Create a new theme from a base theme

     */

    createTheme(newThemeName: string, baseThemeName: string): Theme | null {

      const baseTheme = this.themes.get(baseThemeName);

      if (!baseTheme) {

        logger.error('Base theme not found for creation', { baseThemeName });

        return null;

      }

  

      // Deep copy and update

      const newTheme: Theme = JSON.parse(JSON.stringify(baseTheme));

      newTheme.name = newThemeName;

      newTheme.displayName = newThemeName;

  

      const userThemesPath = path.join(getUserDataPath(), 'user-themes');

      if (!fs.existsSync(userThemesPath)) {

        fs.mkdirSync(userThemesPath, { recursive: true });

      }

  

      const filePath = path.join(userThemesPath, `${newThemeName.replace(/\s+/g, '-').toLowerCase()}.json`);

  

      try {

        // The theme object uses 'palette', but file format uses 'colors'

        const themeForSaving = { ...newTheme, colors: newTheme.palette };

        delete (themeForSaving as any).palette;

  

        fs.writeFileSync(filePath, JSON.stringify(themeForSaving, null, 2), 'utf-8');

        

        this.themes.set(newTheme.name, newTheme);

        logger.info('New theme created successfully', { name: newTheme.name, path: filePath });

        return newTheme;

      } catch (error) {

        logger.error('Failed to create new theme file', { error });

        return null;

      }

    }

  }

  

  export const themeManager = new ThemeManager();

  export default themeManager;
