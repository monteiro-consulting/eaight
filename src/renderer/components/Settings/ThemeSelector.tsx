// src/renderer/components/Settings/ThemeSelector.tsx
import React, { useState, useEffect } from 'react';
import { useTheme } from '../../hooks/useIPC';
import { Theme } from '../../../shared/types/theme';

export const ThemeSelector: React.FC = () => {
  const { theme: activeTheme, setTheme } = useTheme();
  const [availableThemes, setAvailableThemes] = useState<Theme[]>([]);

  useEffect(() => {
    const fetchThemes = async () => {
      try {
        const themes = await window.electronAPI.getAllThemes();
        setAvailableThemes(themes);
      } catch (error) {
        console.error('Failed to fetch themes:', error);
      }
    };
    fetchThemes();
  }, []);

  const handleThemeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setTheme(event.target.value);
  };

  return (
    <div className="setting-row">
      <label htmlFor="theme-selector">Theme</label>
      <select
        id="theme-selector"
        value={activeTheme || ''}
        onChange={handleThemeChange}
        className="form-select"
      >
        <option value="system">System Default</option>
        {availableThemes.map((theme) => (
          <option key={theme.name} value={theme.name}>
            {theme.displayName || theme.name} ({theme.type})
          </option>
        ))}
      </select>
    </div>
  );
};
