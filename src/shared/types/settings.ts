// Settings Types
import { ThemeSetting } from './theme';
import { ExtensionSettings, DEFAULT_EXTENSION_SETTINGS } from './extension';

export interface GeneralSettings {
  startPage: string;
  searchEngine: 'google' | 'bing' | 'duckduckgo';
  language: string;
  downloadPath: string;
}

export interface AppearanceSettings {
  theme: ThemeSetting;
  customThemePath: string | null;
  showAIPanel: boolean;
  aiPanelPosition: 'left' | 'right';
  aiPanelWidth: number;
}

export interface MCPAuthSettings {
  enabled: boolean;
  type: 'none' | 'token' | 'approval';
  allowedApps: string[];
  requireApproval: boolean;
}

export interface DataSharingSettings {
  shareScreenshots: boolean;
  shareDOM: boolean;
  shareCookies: boolean;
  sharePasswords: boolean;
}

export interface SecuritySettings {
  mcpAuth: MCPAuthSettings;
  dataSharing: DataSharingSettings;
}

export interface PrivacySettings {
  doNotTrack: boolean;
  clearDataOnExit: boolean;
  blockThirdPartyCookies: boolean;
}

export interface ProxySettings {
  enabled: boolean;
  type: 'http' | 'https' | 'socks5';
  host: string;
  port: number;
}

export interface AdvancedSettings {
  mcpPort: number;
  enableDevTools: boolean;
  hardwareAcceleration: boolean;
  proxy: ProxySettings;
}

export interface AppSettings {
  general: GeneralSettings;
  appearance: AppearanceSettings;
  security: SecuritySettings;
  privacy: PrivacySettings;
  advanced: AdvancedSettings;
  extensions: ExtensionSettings;
}

export const DEFAULT_SETTINGS: AppSettings = {
  general: {
    startPage: 'about:blank',
    searchEngine: 'google',
    language: 'fr',
    downloadPath: '~/Downloads',
  },
  appearance: {
    theme: 'dark',
    customThemePath: null,
    showAIPanel: true,
    aiPanelPosition: 'right',
    aiPanelWidth: 350,
  },
  security: {
    mcpAuth: {
      enabled: true,
      type: 'token',
      allowedApps: ['claude-code', 'codex-cli', 'gemini-cli'],
      requireApproval: false,
    },
    dataSharing: {
      shareScreenshots: true,
      shareDOM: true,
      shareCookies: false,
      sharePasswords: false,
    },
  },
  privacy: {
    doNotTrack: true,
    clearDataOnExit: false,
    blockThirdPartyCookies: true,
  },
  advanced: {
    mcpPort: 9222,
    enableDevTools: true,
    hardwareAcceleration: true,
    proxy: {
      enabled: false,
      type: 'http',
      host: '',
      port: 8080,
    },
  },
  extensions: DEFAULT_EXTENSION_SETTINGS,
};
