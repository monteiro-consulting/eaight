// Chrome Extension Types

export interface ExtensionInfo {
  id: string;
  name: string;
  version: string;
  description: string;
  enabled: boolean;
  path: string;
  icons?: ExtensionIcon[];
  permissions?: string[];
  manifest: ExtensionManifest;
}

export interface ExtensionIcon {
  size: number;
  url: string;
}

export interface ExtensionManifest {
  manifest_version: number;
  name: string;
  version: string;
  description?: string;
  icons?: Record<string, string>;
  permissions?: string[];
  host_permissions?: string[];
  background?: {
    scripts?: string[];
    service_worker?: string;
    persistent?: boolean;
  };
  content_scripts?: ContentScript[];
  action?: {
    default_popup?: string;
    default_icon?: string | Record<string, string>;
    default_title?: string;
  };
  browser_action?: {
    default_popup?: string;
    default_icon?: string | Record<string, string>;
    default_title?: string;
  };
  options_page?: string;
  options_ui?: {
    page: string;
    open_in_tab?: boolean;
  };
}

export interface ContentScript {
  matches: string[];
  js?: string[];
  css?: string[];
  run_at?: 'document_start' | 'document_end' | 'document_idle';
  all_frames?: boolean;
}

export interface InstalledExtension {
  id: string;
  path: string;
  enabled: boolean;
}

export interface ExtensionSettings {
  installedExtensions: InstalledExtension[];
  extensionsEnabled: boolean;
}

export const DEFAULT_EXTENSION_SETTINGS: ExtensionSettings = {
  installedExtensions: [],
  extensionsEnabled: true,
};
