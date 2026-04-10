// MCP Protocol Types

export interface MCPResource {
  uri: string;
  name: string;
  description: string;
  mimeType: string;
}

export interface MCPTool {
  name: string;
  description: string;
  inputSchema?: {
    type: 'object';
    properties?: Record<string, unknown>;
    required?: string[];
  };
}

export interface MCPPrompt {
  name: string;
  description: string;
  arguments?: MCPPromptArgument[];
}

export interface MCPPromptArgument {
  name: string;
  description: string;
  required: boolean;
}

export interface MCPServerInfo {
  name: string;
  version: string;
  protocol: 'mcp';
  transport: 'websocket' | 'stdio';
  endpoint: string;
  pid: number;
  startedAt: string;
  capabilities: ('resources' | 'tools' | 'prompts')[];
  auth?: {
    type: 'none' | 'token';
    tokenPath?: string;
  };
}

export interface MCPRequest {
  jsonrpc: '2.0';
  id: string | number;
  method: string;
  params?: Record<string, unknown>;
}

export interface MCPResponse {
  jsonrpc: '2.0';
  id: string | number;
  result?: unknown;
  error?: {
    code: number;
    message: string;
    data?: unknown;
  };
}

export interface MCPNotification {
  jsonrpc: '2.0';
  method: string;
  params?: Record<string, unknown>;
}

export type MCPMessage = MCPRequest | MCPResponse | MCPNotification;

export interface MCPConnection {
  id: string;
  clientName: string;
  connectedAt: number;
  permissions: string[];
  lastActivity: number;
}
