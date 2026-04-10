// Browser State Types

export interface WindowBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface WindowState {
  id: string;
  bounds: WindowBounds;
  isMaximized: boolean;
  isFullscreen: boolean;
}

export interface Tab {
  id: string;
  url: string;
  title: string;
  favicon: string | null;
  isLoading: boolean;
  isAudible: boolean;
  isMuted: boolean;
  isPinned: boolean;
  groupId: string | null;
  createdAt: number;
  lastAccessed: number;
}

export interface TabGroup {
  id: string;
  name: string;
  color: string;
  isCollapsed: boolean;
}

export interface BrowserState {
  window: WindowState;
  tabs: Tab[];
  tabGroups: TabGroup[];
  activeTabId: string | null;
  canGoBack: boolean;
  canGoForward: boolean;
  isLoading: boolean;
  mcpConnections: import('./mcp').MCPConnection[];
  theme: 'dark' | 'light' | 'system';
  aiPanelVisible: boolean;
}

export interface NavigationResult {
  success: boolean;
  url?: string;
  error?: string;
}

export interface ClickOptions {
  selector?: string;
  text?: string;
  coordinates?: { x: number; y: number };
}

export interface TypeOptions {
  selector: string;
  text: string;
  clear?: boolean;
  pressEnter?: boolean;
}

export interface ScrollOptions {
  direction: 'up' | 'down' | 'left' | 'right';
  amount?: number;
  selector?: string;
}

export interface WaitOptions {
  type: 'selector' | 'navigation' | 'timeout';
  value?: string;
  timeout?: number;
}

export interface ScreenshotOptions {
  fullPage?: boolean;
  selector?: string;
}

export interface ElementInfo {
  tagName: string;
  id?: string;
  className?: string;
  text?: string;
  href?: string;
  src?: string;
  value?: string;
  attributes: Record<string, string>;
  rect: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}
