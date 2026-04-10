// Default values and constants

export const DEFAULT_WINDOW_WIDTH = 1280;
export const DEFAULT_WINDOW_HEIGHT = 800;
export const MIN_WINDOW_WIDTH = 400;
export const MIN_WINDOW_HEIGHT = 300;

export const DEFAULT_AI_PANEL_WIDTH = 350;
export const MIN_AI_PANEL_WIDTH = 280;
export const MAX_AI_PANEL_WIDTH = 600;

export const DEFAULT_TAB_HEIGHT = 36;
export const DEFAULT_URL_BAR_HEIGHT = 44;

export const DEFAULT_START_PAGE = 'https://www.google.com';
export const NEW_TAB_URL = 'about:blank';

export const MAX_TABS = 100;
export const MAX_HISTORY_ENTRIES = 1000;

export const SCREENSHOT_QUALITY = 80;
export const MAX_DOM_DEPTH = 20;
export const MAX_TEXT_LENGTH = 100000;

export const DEBOUNCE_DOM_CHANGE = 100;
export const DEBOUNCE_RESIZE = 50;

export const CONNECTION_TIMEOUT = 30000;
export const NAVIGATION_TIMEOUT = 60000;
export const SELECTOR_TIMEOUT = 10000;

export const SEARCH_ENGINES = {
  google: 'https://www.google.com/search?q=',
  bing: 'https://www.bing.com/search?q=',
  duckduckgo: 'https://duckduckgo.com/?q=',
} as const;
