// Theme Settings - VS Code-like theme customization UI

import React, { useState, useCallback, useMemo } from 'react';
import { useThemeCustomizations } from '../../hooks/useThemeCSS';
import { Button } from '../common';

interface ColorGroup {
  name: string;
  description: string;
  tokens: Array<{
    key: string;
    label: string;
    description: string;
  }>;
}

// Organized color groups for the UI
const colorGroups: ColorGroup[] = [
  {
    name: 'Base Colors',
    description: 'Foundation colors used throughout the UI',
    tokens: [
      { key: 'bg.primary', label: 'Background Primary', description: 'Main window background' },
      { key: 'bg.secondary', label: 'Background Secondary', description: 'Panels and sidebars' },
      { key: 'bg.tertiary', label: 'Background Tertiary', description: 'Inputs and hover states' },
      { key: 'fg.primary', label: 'Text Primary', description: 'Main text color' },
      { key: 'fg.secondary', label: 'Text Secondary', description: 'Secondary text' },
      { key: 'fg.muted', label: 'Text Muted', description: 'Disabled and placeholder text' },
    ],
  },
  {
    name: 'Accent Colors',
    description: 'Brand and highlight colors',
    tokens: [
      { key: 'accent.primary', label: 'Accent Primary', description: 'Primary accent (links, buttons)' },
      { key: 'accent.secondary', label: 'Accent Secondary', description: 'Secondary accent' },
      { key: 'accent.tertiary', label: 'Accent Tertiary', description: 'Tertiary accent' },
    ],
  },
  {
    name: 'Status Colors',
    description: 'Colors for status indicators',
    tokens: [
      { key: 'success', label: 'Success', description: 'Success states' },
      { key: 'warning', label: 'Warning', description: 'Warning states' },
      { key: 'error', label: 'Error', description: 'Error states' },
      { key: 'info', label: 'Info', description: 'Information states' },
    ],
  },
  {
    name: 'Border Colors',
    description: 'Colors for borders and dividers',
    tokens: [
      { key: 'border.default', label: 'Border Default', description: 'Standard borders' },
      { key: 'border.subtle', label: 'Border Subtle', description: 'Subtle dividers' },
      { key: 'border.focus', label: 'Border Focus', description: 'Focus ring color' },
    ],
  },
  {
    name: 'Tab Bar',
    description: 'Tab bar and tab customization',
    tokens: [
      { key: 'tabBar.background', label: 'Tab Bar Background', description: 'Tab bar background' },
      { key: 'tab.activeBackground', label: 'Active Tab Background', description: 'Active tab background' },
      { key: 'tab.activeForeground', label: 'Active Tab Text', description: 'Active tab text color' },
      { key: 'tab.activeBorderTop', label: 'Active Tab Border', description: 'Active tab top border' },
      { key: 'tab.hoverBackground', label: 'Tab Hover Background', description: 'Tab hover background' },
    ],
  },
  {
    name: 'URL Bar',
    description: 'URL bar customization',
    tokens: [
      { key: 'urlBar.background', label: 'URL Bar Background', description: 'URL bar background' },
      { key: 'urlBar.foreground', label: 'URL Bar Text', description: 'URL bar text' },
      { key: 'urlBar.border', label: 'URL Bar Border', description: 'URL bar border' },
      { key: 'urlBar.focusBorder', label: 'URL Bar Focus Border', description: 'URL bar focus border' },
    ],
  },
  {
    name: 'AI Panel',
    description: 'AI sidebar panel customization',
    tokens: [
      { key: 'aiPanel.background', label: 'Panel Background', description: 'AI panel background' },
      { key: 'aiPanel.headerBackground', label: 'Panel Header', description: 'AI panel header' },
      { key: 'aiPanel.border', label: 'Panel Border', description: 'AI panel border' },
    ],
  },
  {
    name: 'Buttons',
    description: 'Button customization',
    tokens: [
      { key: 'button.primaryBackground', label: 'Primary Button', description: 'Primary button background' },
      { key: 'button.primaryForeground', label: 'Primary Button Text', description: 'Primary button text' },
      { key: 'button.secondaryBackground', label: 'Secondary Button', description: 'Secondary button background' },
    ],
  },
];

interface ColorInputProps {
  token: { key: string; label: string; description: string };
  currentValue: string | undefined;
  onChange: (value: string) => void;
  onReset: () => void;
  isCustomized: boolean;
}

function ColorInput({ token, currentValue, onChange, onReset, isCustomized }: ColorInputProps) {
  const [localValue, setLocalValue] = useState(currentValue || '');

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalValue(value);
    // Only trigger onChange for valid hex colors
    if (/^#[0-9A-Fa-f]{6}$/.test(value) || value === '') {
      onChange(value);
    }
  }, [onChange]);

  const handleColorPickerChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalValue(value);
    onChange(value);
  }, [onChange]);

  // Compute display value from CSS variable if not customized
  const displayColor = useMemo(() => {
    if (currentValue && /^#[0-9A-Fa-f]{6}$/.test(currentValue)) {
      return currentValue;
    }
    // Get computed value from CSS variable
    const cssVar = `--color-${token.key.replace(/\./g, '-')}`;
    const computed = getComputedStyle(document.documentElement).getPropertyValue(cssVar).trim();
    return computed || '#000000';
  }, [currentValue, token.key]);

  return (
    <div className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-[var(--color-bg-tertiary)] transition-colors">
      {/* Color preview and picker */}
      <div className="relative">
        <div
          className="w-8 h-8 rounded border-2"
          style={{
            backgroundColor: displayColor,
            borderColor: 'var(--color-border-default)',
          }}
        />
        <input
          type="color"
          value={displayColor}
          onChange={handleColorPickerChange}
          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
        />
      </div>

      {/* Label and description */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm" style={{ color: 'var(--color-fg-primary)' }}>
            {token.label}
          </span>
          {isCustomized && (
            <span
              className="px-1.5 py-0.5 text-xs rounded"
              style={{
                backgroundColor: 'var(--color-accent-primary)',
                color: 'var(--color-fg-onAccent)',
              }}
            >
              Modified
            </span>
          )}
        </div>
        <p className="text-xs truncate" style={{ color: 'var(--color-fg-muted)' }}>
          {token.description}
        </p>
      </div>

      {/* Hex input */}
      <input
        type="text"
        value={localValue || displayColor}
        onChange={handleChange}
        placeholder="#000000"
        className="w-24 px-2 py-1 text-sm rounded eaight-input"
        style={{
          fontFamily: 'var(--font-mono)',
        }}
      />

      {/* Reset button */}
      {isCustomized && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onReset}
          title="Reset to default"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </Button>
      )}
    </div>
  );
}

export function ThemeSettings() {
  const {
    customizations,
    isLoading,
    setColorToken,
    resetColorToken,
    resetAll,
  } = useThemeCustomizations();

  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['Base Colors', 'Accent Colors']));
  const [searchQuery, setSearchQuery] = useState('');

  const toggleGroup = useCallback((groupName: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      if (next.has(groupName)) {
        next.delete(groupName);
      } else {
        next.add(groupName);
      }
      return next;
    });
  }, []);

  const isTokenCustomized = useCallback((key: string): boolean => {
    const paletteKey = key as keyof typeof customizations.palette;
    const tokenKey = key as keyof typeof customizations.tokens;
    return !!(customizations.palette?.[paletteKey] || customizations.tokens?.[tokenKey]);
  }, [customizations]);

  const getTokenValue = useCallback((key: string): string | undefined => {
    const paletteKey = key as keyof typeof customizations.palette;
    const tokenKey = key as keyof typeof customizations.tokens;
    return customizations.palette?.[paletteKey] || customizations.tokens?.[tokenKey];
  }, [customizations]);

  const handleColorChange = useCallback((key: string, value: string) => {
    if (value) {
      setColorToken(key, value);
    }
  }, [setColorToken]);

  const handleReset = useCallback((key: string) => {
    resetColorToken(key);
  }, [resetColorToken]);

  const filteredGroups = useMemo(() => {
    if (!searchQuery) return colorGroups;
    const query = searchQuery.toLowerCase();
    return colorGroups
      .map(group => ({
        ...group,
        tokens: group.tokens.filter(
          t =>
            t.label.toLowerCase().includes(query) ||
            t.description.toLowerCase().includes(query) ||
            t.key.toLowerCase().includes(query)
        ),
      }))
      .filter(g => g.tokens.length > 0);
  }, [searchQuery]);

  const customizedCount = useMemo(() => {
    let count = 0;
    if (customizations.palette) count += Object.keys(customizations.palette).length;
    if (customizations.tokens) count += Object.keys(customizations.tokens).length;
    return count;
  }, [customizations]);

  const handleImport = async () => {
    const filePath = await window.electronAPI.showOpenDialog();
    if (filePath) {
      try {
        const theme = await window.electronAPI.importTheme(filePath);
        if (theme) {
          alert(`Theme "${theme.name}" imported successfully!`);
          // Note: To auto-switch, we would need to refresh the theme list
        } else {
          alert('Failed to import theme. Check file format.');
        }
      } catch (error) {
        console.error('Import error:', error);
        alert('An error occurred during import.');
      }
    }
  };

  const handleExport = async () => {
    const filePath = await window.electronAPI.showSaveDialog();
    if (filePath) {
      try {
        const success = await window.electronAPI.exportTheme(filePath);
        if (success) {
          alert('Theme exported successfully!');
        } else {
          alert('Failed to export theme.');
        }
      } catch (error) {
        console.error('Export error:', error);
        alert('An error occurred during export.');
      }
    }
  };

  const handleCreate = async () => {
    const newThemeName = prompt('Enter a name for your new theme:');
    if (!newThemeName) return;

    // In a real UI, this would be a dropdown of available themes.
    // For now, we'll let the user type or use a default.
    const baseThemeName = prompt('Enter a base theme to start from:', 'Dark+');
    if (!baseThemeName) return;

    try {
      const newTheme = await window.electronAPI.createTheme({ newThemeName, baseThemeName });
      if (newTheme) {
        alert(`Theme "${newTheme.name}" created successfully! It will be available after restarting the application.`);
      } else {
        alert('Failed to create theme. The base theme might not exist or there was a file system error.');
      }
    } catch (error) {
      console.error('Create theme error:', error);
      alert('An error occurred while creating the theme.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center" style={{ color: 'var(--color-fg-muted)' }}>
        Loading theme settings...
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--color-border-default)' }}>
        <div>
          <h2 className="font-semibold" style={{ color: 'var(--color-fg-primary)' }}>Color Customization</h2>
          <p className="text-xs" style={{ color: 'var(--color-fg-muted)' }}>
            {customizedCount > 0 ? `${customizedCount} color${customizedCount > 1 ? 's' : ''} customized` : 'No customizations'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {customizedCount > 0 && (
            <Button variant="ghost" size="sm" onClick={resetAll}>
              Reset All
            </Button>
          )}
          <Button variant="outline" onClick={handleImport}>Import...</Button>
          <Button variant="outline" onClick={handleExport}>Export...</Button>
          <Button variant="primary" onClick={handleCreate}>Create New...</Button>
        </div>
      </div>

      {/* Search */}
      <div className="px-4 py-3">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search colors..."
          className="w-full eaight-input"
        />
      </div>

      {/* Color groups */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {filteredGroups.map((group) => (
          <div key={group.name} className="mb-4">
            {/* Group header */}
            <button
              className="w-full flex items-center gap-2 py-2 text-left"
              onClick={() => toggleGroup(group.name)}
            >
              <svg
                className={`w-4 h-4 transition-transform ${expandedGroups.has(group.name) ? 'rotate-90' : ''}`}
                style={{ color: 'var(--color-fg-secondary)' }}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <span className="font-medium" style={{ color: 'var(--color-fg-primary)' }}>
                {group.name}
              </span>
              <span className="text-xs" style={{ color: 'var(--color-fg-muted)' }}>
                ({group.tokens.length} colors)
              </span>
            </button>

            {/* Group description */}
            {expandedGroups.has(group.name) && (
              <p className="text-xs mb-2 ml-6" style={{ color: 'var(--color-fg-muted)' }}>
                {group.description}
              </p>
            )}

            {/* Color tokens */}
            {expandedGroups.has(group.name) && (
              <div className="ml-2 border-l-2 pl-4" style={{ borderColor: 'var(--color-border-subtle)' }}>
                {group.tokens.map((token) => (
                  <ColorInput
                    key={token.key}
                    token={token}
                    currentValue={getTokenValue(token.key)}
                    onChange={(value) => handleColorChange(token.key, value)}
                    onReset={() => handleReset(token.key)}
                    isCustomized={isTokenCustomized(token.key)}
                  />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default ThemeSettings;
