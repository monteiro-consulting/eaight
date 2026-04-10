// Event Types

export type BrowserEventType =
  | 'navigation-started'
  | 'navigation-completed'
  | 'navigation-failed'
  | 'dom-changed'
  | 'tab-created'
  | 'tab-closed'
  | 'tab-switched'
  | 'tab-updated'
  | 'page-loaded'
  | 'page-error'
  | 'console-message'
  | 'network-request'
  | 'network-response'
  | 'mcp-connected'
  | 'mcp-disconnected';

export interface BrowserEvent<T = unknown> {
  type: BrowserEventType;
  timestamp: number;
  tabId?: string;
  data: T;
}

export interface NavigationEvent {
  url: string;
  tabId: string;
}

export interface DOMChangeEvent {
  type: 'mutation' | 'full';
  selector?: string;
}

export interface TabEvent {
  tabId: string;
  url?: string;
  title?: string;
}

export interface ConsoleMessageEvent {
  level: 'log' | 'warn' | 'error' | 'info' | 'debug';
  message: string;
  source?: string;
  line?: number;
}

export interface NetworkRequestEvent {
  requestId: string;
  url: string;
  method: string;
  headers: Record<string, string>;
  timestamp: number;
}

export interface NetworkResponseEvent {
  requestId: string;
  url: string;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  timestamp: number;
}

export interface MCPConnectionEvent {
  connectionId: string;
  clientName: string;
}
