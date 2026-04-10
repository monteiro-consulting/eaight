// MCP Event Types

export type MCPEventType =
  | 'connection'
  | 'disconnection'
  | 'message'
  | 'error'
  | 'resource-updated'
  | 'tool-executed';

export interface MCPEventData {
  connection: { clientId: string; clientName: string };
  disconnection: { clientId: string; reason?: string };
  message: { clientId: string; message: unknown };
  error: { clientId?: string; error: Error };
  'resource-updated': { uri: string };
  'tool-executed': { tool: string; result: unknown };
}

export interface MCPEvent<T extends MCPEventType = MCPEventType> {
  type: T;
  timestamp: number;
  data: MCPEventData[T];
}
