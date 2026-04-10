// IPC Channels for Electron communication

export enum IPCChannel {
  // Navigation
  NAVIGATE = 'navigate',
  GO_BACK = 'go-back',
  GO_FORWARD = 'go-forward',
  RELOAD = 'reload',
  STOP = 'stop',

  // State
  GET_STATE = 'get-state',
  STATE_CHANGED = 'state-changed',

  // Content
  GET_DOM = 'get-dom',
  GET_TEXT = 'get-text',
  GET_SCREENSHOT = 'get-screenshot',
  EXECUTE_JS = 'execute-js',

  // Tabs
  CREATE_TAB = 'create-tab',
  CLOSE_TAB = 'close-tab',
  SWITCH_TAB = 'switch-tab',
  UPDATE_TAB = 'update-tab',
  GET_TABS = 'get-tabs',

  // Tab Groups
  CREATE_TAB_GROUP = 'create-tab-group',
  DELETE_TAB_GROUP = 'delete-tab-group',
  UPDATE_TAB_GROUP = 'update-tab-group',
  ADD_TAB_TO_GROUP = 'add-tab-to-group',
  REMOVE_TAB_FROM_GROUP = 'remove-tab-from-group',
  GET_TAB_GROUPS = 'get-tab-groups',
  TOGGLE_GROUP_COLLAPSE = 'toggle-group-collapse',

  // AI/MCP
  AI_ACTION = 'ai-action',
  AI_EVENT = 'ai-event',
  MCP_STATUS = 'mcp-status',

  // Settings
  GET_SETTINGS = 'get-settings',
  SET_SETTINGS = 'set-settings',
  SETTINGS_CHANGED = 'settings-changed',
  SET_OVERLAY_VISIBLE = 'set-overlay-visible',
  SHOW_APP_MENU = 'show-app-menu',

  // Window
  MINIMIZE = 'minimize',
  MAXIMIZE = 'maximize',
  CLOSE = 'close',
  TOGGLE_FULLSCREEN = 'toggle-fullscreen',

  // DevTools
  TOGGLE_DEVTOOLS = 'toggle-devtools',

  // AI Panel
  TOGGLE_AI_PANEL = 'toggle-ai-panel',
  AI_PANEL_CHANGED = 'ai-panel-changed',

  // Theme
  GET_THEME = 'get-theme',
  SET_THEME = 'set-theme',
  THEME_CHANGED = 'theme-changed',
  GET_THEME_CSS = 'get-theme-css',
  THEME_CSS_UPDATED = 'theme-css-updated',
  GET_ALL_THEMES = 'get-all-themes',
  GET_THEME_CUSTOMIZATIONS = 'get-theme-customizations',
  SET_THEME_CUSTOMIZATIONS = 'set-theme-customizations',
  SET_COLOR_TOKEN = 'set-color-token',
  RESET_COLOR_TOKEN = 'reset-color-token',
  RESET_ALL_CUSTOMIZATIONS = 'reset-all-customizations',
  IMPORT_THEME = 'import-theme',
  EXPORT_THEME = 'export-theme',
  CREATE_THEME = 'create-theme',

  // Dialogs
  SHOW_OPEN_DIALOG = 'show-open-dialog',
  SHOW_SAVE_DIALOG = 'show-save-dialog',

  // Color Picker Popup
  SHOW_COLOR_PICKER = 'show-color-picker',
  COLOR_PICKER_RESULT = 'color-picker-result',

  // External AI Apps
  OPEN_AI_IN_TERMINAL = 'open-ai-in-terminal',
  OPEN_AI_IN_VSCODE = 'open-ai-in-vscode',
  SELECT_FOLDER = 'select-folder',
  LIST_FOLDERS = 'list-folders',
  GET_USER_HOME = 'get-user-home',

  // Extensions
  EXTENSION_GET_ALL = 'extension-get-all',
  EXTENSION_INSTALL = 'extension-install',
  EXTENSION_INSTALL_CRX = 'extension-install-crx',
  EXTENSION_UNINSTALL = 'extension-uninstall',
  EXTENSION_ENABLE = 'extension-enable',
  EXTENSION_DISABLE = 'extension-disable',
  EXTENSION_INSTALLED = 'extension-installed',
  EXTENSION_REMOVED = 'extension-removed',
  EXTENSION_UPDATED = 'extension-updated',
}

export default IPCChannel;
