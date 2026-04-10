// Theme Resolver - Computes final theme values with fallbacks and customizations

import {
  Theme,
  ThemeColorPalette,
  ThemeSemanticTokens,
  ThemeFonts,
  ThemeSpacing,
  ThemeCustomizations,
  ResolvedTheme,
} from '../../shared/types/theme';

/**
 * Default fonts configuration
 */
export const defaultFonts: ThemeFonts = {
  family: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  monoFamily: "'SF Mono', 'Cascadia Code', 'Fira Code', Consolas, monospace",
  sizeXs: 11,
  sizeSm: 12,
  sizeBase: 13,
  sizeLg: 14,
  sizeXl: 16,
  weightNormal: 400,
  weightMedium: 500,
  weightSemibold: 600,
  weightBold: 700,
};

/**
 * Default spacing configuration
 */
export const defaultSpacing: ThemeSpacing = {
  unit: 4,
  borderRadiusSm: 4,
  borderRadiusMd: 6,
  borderRadiusLg: 8,
  borderRadiusFull: 9999,
};

/**
 * eaight Dark theme palette
 */
export const darkPalette: ThemeColorPalette = {
  'bg.primary': '#1a1a2e',
  'bg.secondary': '#232340',
  'bg.tertiary': '#2d2d4a',
  'bg.elevated': '#363654',

  'fg.primary': '#ffffff',
  'fg.secondary': '#b0b0c0',
  'fg.muted': '#707088',
  'fg.disabled': '#505068',
  'fg.onAccent': '#ffffff',

  'accent.primary': '#25ced1',
  'accent.secondary': '#ea526f',
  'accent.tertiary': '#ff8a5b',

  'success': '#4ade80',
  'warning': '#fbbf24',
  'error': '#f87171',
  'info': '#60a5fa',

  'border.default': '#3a3a5c',
  'border.subtle': '#2a2a44',
  'border.focus': '#25ced1',
};

/**
 * eaight Light theme palette
 */
export const lightPalette: ThemeColorPalette = {
  'bg.primary': '#ffffff',
  'bg.secondary': '#f8f8fa',
  'bg.tertiary': '#f0f0f4',
  'bg.elevated': '#ffffff',

  'fg.primary': '#1a1a2e',
  'fg.secondary': '#5a5a70',
  'fg.muted': '#8a8aa0',
  'fg.disabled': '#b0b0c0',
  'fg.onAccent': '#ffffff',

  'accent.primary': '#0ea5a8',
  'accent.secondary': '#d63d5a',
  'accent.tertiary': '#e67548',

  'success': '#22c55e',
  'warning': '#f59e0b',
  'error': '#ef4444',
  'info': '#3b82f6',

  'border.default': '#e0e0e8',
  'border.subtle': '#f0f0f4',
  'border.focus': '#0ea5a8',
};

/**
 * Generate semantic tokens from a color palette
 * This provides sensible defaults for all UI components
 */
export function generateSemanticTokens(
  palette: ThemeColorPalette,
  type: 'dark' | 'light'
): ThemeSemanticTokens {
  const isDark = type === 'dark';

  return {
    // Title Bar
    'titleBar.background': palette['bg.primary'],
    'titleBar.foreground': palette['fg.primary'],
    'titleBar.border': palette['border.subtle'],
    'titleBar.buttonHoverBackground': palette['bg.tertiary'],
    'titleBar.buttonActiveBackground': palette['bg.elevated'],

    // Tab Bar
    'tabBar.background': palette['bg.secondary'],
    'tabBar.border': palette['border.default'],

    // Tabs
    'tab.background': 'transparent',
    'tab.foreground': palette['fg.secondary'],
    'tab.border': 'transparent',
    'tab.activeBackground': palette['bg.primary'],
    'tab.activeForeground': palette['fg.primary'],
    'tab.activeBorder': 'transparent',
    'tab.activeBorderTop': palette['accent.primary'],
    'tab.hoverBackground': palette['bg.tertiary'],
    'tab.hoverForeground': palette['fg.primary'],
    'tab.closeButtonForeground': palette['fg.muted'],
    'tab.closeButtonHoverBackground': isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
    'tab.closeButtonHoverForeground': palette['fg.primary'],

    // URL Bar
    'urlBar.background': palette['bg.tertiary'],
    'urlBar.foreground': palette['fg.primary'],
    'urlBar.border': palette['border.default'],
    'urlBar.focusBackground': palette['bg.elevated'],
    'urlBar.focusBorder': palette['border.focus'],
    'urlBar.placeholderForeground': palette['fg.muted'],
    'urlBar.selectionBackground': isDark ? 'rgba(37, 206, 209, 0.3)' : 'rgba(14, 165, 168, 0.3)',

    // Navigation Buttons
    'navigation.buttonBackground': 'transparent',
    'navigation.buttonForeground': palette['fg.secondary'],
    'navigation.buttonHoverBackground': palette['bg.tertiary'],
    'navigation.buttonDisabledForeground': palette['fg.disabled'],

    // Bookmarks Bar
    'bookmarksBar.background': palette['bg.secondary'],
    'bookmarksBar.foreground': palette['fg.secondary'],
    'bookmarksBar.border': palette['border.default'],
    'bookmarksBar.buttonHoverBackground': palette['bg.tertiary'],

    // AI Panel
    'aiPanel.background': palette['bg.secondary'],
    'aiPanel.foreground': palette['fg.primary'],
    'aiPanel.border': palette['border.default'],
    'aiPanel.headerBackground': palette['bg.tertiary'],
    'aiPanel.headerForeground': palette['fg.primary'],
    'aiPanel.inputBackground': palette['bg.tertiary'],
    'aiPanel.inputBorder': palette['border.default'],
    'aiPanel.inputFocusBorder': palette['border.focus'],
    'aiPanel.connectionActiveBackground': palette['success'],
    'aiPanel.connectionActiveForeground': palette['fg.onAccent'],
    'aiPanel.connectionInactiveBackground': palette['bg.tertiary'],
    'aiPanel.connectionInactiveForeground': palette['fg.muted'],

    // Scrollbar
    'scrollbar.track': 'transparent',
    'scrollbar.thumb': isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)',
    'scrollbar.thumbHover': isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.25)',

    // Menu
    'menu.background': palette['bg.elevated'],
    'menu.foreground': palette['fg.primary'],
    'menu.border': palette['border.default'],
    'menu.separatorBackground': palette['border.subtle'],
    'menu.itemHoverBackground': palette['bg.tertiary'],
    'menu.itemHoverForeground': palette['fg.primary'],
    'menu.itemDisabledForeground': palette['fg.disabled'],

    // Buttons
    'button.primaryBackground': palette['accent.primary'],
    'button.primaryForeground': palette['fg.onAccent'],
    'button.primaryHoverBackground': isDark ? '#2ee0e3' : '#0c9699',
    'button.secondaryBackground': palette['accent.secondary'],
    'button.secondaryForeground': palette['fg.onAccent'],
    'button.secondaryHoverBackground': isDark ? '#f06680' : '#c4324d',
    'button.ghostForeground': palette['fg.secondary'],
    'button.ghostHoverBackground': palette['bg.tertiary'],

    // Inputs
    'input.background': palette['bg.tertiary'],
    'input.foreground': palette['fg.primary'],
    'input.border': palette['border.default'],
    'input.focusBorder': palette['border.focus'],
    'input.placeholderForeground': palette['fg.muted'],

    // Badges
    'badge.background': palette['accent.primary'],
    'badge.foreground': palette['fg.onAccent'],

    // Tooltips
    'tooltip.background': palette['bg.elevated'],
    'tooltip.foreground': palette['fg.primary'],
    'tooltip.border': palette['border.default'],

    // Status indicators
    'status.loadingBackground': palette['info'],
    'status.loadingForeground': palette['fg.onAccent'],
    'status.successBackground': palette['success'],
    'status.successForeground': palette['fg.onAccent'],
    'status.errorBackground': palette['error'],
    'status.errorForeground': palette['fg.onAccent'],
    'status.warningBackground': palette['warning'],
    'status.warningForeground': isDark ? '#1a1a2e' : '#ffffff',

    // Focus and selection
    'focusRing': palette['border.focus'],
    'selection.background': isDark ? 'rgba(37, 206, 209, 0.25)' : 'rgba(14, 165, 168, 0.2)',
  };
}

/**
 * Default dark theme
 */
export const defaultDarkTheme: Theme = {
  name: 'eaight-dark',
  displayName: 'eaight Dark',
  type: 'dark',
  version: '1.0.0',
  author: 'eaight',
  palette: darkPalette,
  fonts: defaultFonts,
  spacing: defaultSpacing,
};

/**
 * Default light theme
 */
export const defaultLightTheme: Theme = {
  name: 'eaight-light',
  displayName: 'eaight Light',
  type: 'light',
  version: '1.0.0',
  author: 'eaight',
  palette: lightPalette,
  fonts: defaultFonts,
  spacing: defaultSpacing,
};

/**
 * Resolve a theme with customizations applied
 * Returns a complete theme with all tokens computed
 */
export function resolveTheme(
  theme: Theme,
  customizations?: ThemeCustomizations
): ResolvedTheme {
  // Start with theme palette, apply customizations
  const basePalette = theme.type === 'light' || theme.type === 'hc-light' ? lightPalette : darkPalette;
  const palette: ThemeColorPalette = {
    ...basePalette,
    ...theme.palette,
    ...customizations?.palette,
  };

  // Generate semantic tokens from palette (use 'light' for hc-light variants)
  const semanticType = theme.type === 'light' || theme.type === 'hc-light' ? 'light' : 'dark';
  const generatedTokens = generateSemanticTokens(palette, semanticType);

  // Apply theme-specific token overrides, then user customizations
  const tokens: ThemeSemanticTokens = {
    ...generatedTokens,
    ...theme.tokens,
    ...customizations?.tokens,
  };

  // Merge fonts
  const fonts: ThemeFonts = {
    ...defaultFonts,
    ...theme.fonts,
    ...customizations?.fonts,
  };

  // Merge spacing
  const spacing: ThemeSpacing = {
    ...defaultSpacing,
    ...theme.spacing,
    ...customizations?.spacing,
  };

  return {
    name: theme.name,
    type: theme.type,
    palette,
    tokens,
    fonts,
    spacing,
  };
}

/**
 * Convert a resolved theme to CSS custom properties
 */
export function themeToCSSVariables(theme: ResolvedTheme): Record<string, string> {
  const variables: Record<string, string> = {};

  // Palette colors
  if (theme.palette) {
    for (const [key, value] of Object.entries(theme.palette)) {
      variables[`--color-${key.replace(/\./g, '-')}`] = value;
    }
  }

  // Semantic tokens
  if (theme.tokens) {
    for (const [key, value] of Object.entries(theme.tokens)) {
      variables[`--${key.replace(/\./g, '-')}`] = value;
    }
  }

  // Fonts
  variables['--font-family'] = theme.fonts.family;
  variables['--font-mono'] = theme.fonts.monoFamily;
  variables['--font-size-xs'] = `${theme.fonts.sizeXs}px`;
  variables['--font-size-sm'] = `${theme.fonts.sizeSm}px`;
  variables['--font-size-base'] = `${theme.fonts.sizeBase}px`;
  variables['--font-size-lg'] = `${theme.fonts.sizeLg}px`;
  variables['--font-size-xl'] = `${theme.fonts.sizeXl}px`;
  variables['--font-weight-normal'] = String(theme.fonts.weightNormal);
  variables['--font-weight-medium'] = String(theme.fonts.weightMedium);
  variables['--font-weight-semibold'] = String(theme.fonts.weightSemibold);
  variables['--font-weight-bold'] = String(theme.fonts.weightBold);

  // Spacing
  if (theme.spacing) {
    variables['--spacing-unit'] = `${theme.spacing.unit}px`;
    variables['--radius-sm'] = `${theme.spacing.borderRadiusSm}px`;
    variables['--radius-md'] = `${theme.spacing.borderRadiusMd}px`;
    variables['--radius-lg'] = `${theme.spacing.borderRadiusLg}px`;
    variables['--radius-full'] = `${theme.spacing.borderRadiusFull}px`;
  }

  return variables;
}

/**
 * Generate CSS string from theme
 */
export function themeToCSSString(theme: ResolvedTheme): string {
  const variables = themeToCSSVariables(theme);
  const lines = Object.entries(variables).map(([key, value]) => `  ${key}: ${value};`);
  return `:root {\n${lines.join('\n')}\n}`;
}
