// MCP Server - Main server handling MCP protocol

import { WebSocketTransport } from './transports/WebSocketTransport';
import { SSETransport } from './transports/SSETransport';
import { fileSocket } from './discovery/FileSocket';
import { resources, readResource } from './MCPResources';
import { tools, executeTool } from './MCPTools';
import { prompts, getPrompt } from './MCPPrompts';
import { MCPRequest, MCPResponse, MCPMessage, MCPConnection } from '../../shared/types/mcp';
import { MCPMethods, MCPTools as ToolNames, MCP_SERVER_NAME, MCP_SERVER_VERSION, MCP_VERSION } from '../../shared/constants/mcp-constants';
import { logger } from '../utils/logger';
import settingsManager from '../settings/SettingsManager';

// Transport interface for both WebSocket and SSE
interface Transport {
  start(port?: number): Promise<number>;
  stop(): void;
  send(clientId: string, message: MCPMessage): boolean;
  broadcast(message: MCPMessage): void;
  getConnections(): MCPConnection[];
  getClientCount(): number;
  on(event: string, listener: (...args: unknown[]) => void): void;
}

export class MCPServer {
  private wsTransport: WebSocketTransport;
  private sseTransport: SSETransport;
  private wsPort: number = 0;
  private ssePort: number = 0;
  private isRunning = false;
  private clientCapabilities: Map<string, object> = new Map();
  private clientTransports: Map<string, Transport> = new Map();

  constructor() {
    this.wsTransport = new WebSocketTransport();
    this.sseTransport = new SSETransport();
    this.setupTransportEvents(this.wsTransport, 'WebSocket');
    this.setupTransportEvents(this.sseTransport, 'SSE');
  }

  private setupTransportEvents(transport: Transport, name: string): void {
    transport.on('connection', (data: unknown) => {
      const { clientId } = data as { clientId: string };
      this.clientTransports.set(clientId, transport);
      logger.info(`MCP client connected via ${name}`, { clientId });
    });

    transport.on('disconnection', (data: unknown) => {
      const { clientId } = data as { clientId: string };
      this.clientCapabilities.delete(clientId);
      this.clientTransports.delete(clientId);
      logger.info(`MCP client disconnected from ${name}`, { clientId });
    });

    transport.on('message', async (data: unknown) => {
      const { clientId, message } = data as { clientId: string; message: MCPMessage };
      await this.handleMessage(clientId, message as MCPRequest);
    });

    transport.on('error', (data: unknown) => {
      const { clientId, error } = data as { clientId: string; error: Error };
      logger.error(`MCP ${name} transport error`, { clientId, error });
    });
  }

  async start(): Promise<void> {
    if (this.isRunning) return;

    const preferredPort = settingsManager.getMCPPort();

    // Start WebSocket transport on preferred port
    this.wsPort = await this.wsTransport.start(preferredPort);

    // Start SSE transport on next port
    this.ssePort = await this.sseTransport.start(preferredPort + 1);

    // Write socket file for auto-discovery (use WebSocket port)
    fileSocket.write(this.wsPort);

    this.isRunning = true;
    logger.info('MCP Server started', { wsPort: this.wsPort, ssePort: this.ssePort });
  }

  stop(): void {
    if (!this.isRunning) return;

    this.wsTransport.stop();
    this.sseTransport.stop();
    fileSocket.remove();

    this.isRunning = false;
    logger.info('MCP Server stopped');
  }

  private async handleMessage(clientId: string, request: MCPRequest): Promise<void> {
    logger.debug('MCP request received', { clientId, method: request.method });

    let response: MCPResponse;

    try {
      const result = await this.processRequest(clientId, request);
      response = {
        jsonrpc: '2.0',
        id: request.id,
        result,
      };
    } catch (error) {
      response = {
        jsonrpc: '2.0',
        id: request.id,
        error: {
          code: -32000,
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }

    const transport = this.clientTransports.get(clientId);
    if (transport) {
      transport.send(clientId, response);
    }
  }

  private async processRequest(clientId: string, request: MCPRequest): Promise<unknown> {
    const { method, params } = request;

    switch (method) {
      // Lifecycle
      case MCPMethods.INITIALIZE:
        return this.handleInitialize(clientId, params as Record<string, unknown>);

      case MCPMethods.SHUTDOWN:
        return this.handleShutdown(clientId);

      // Resources
      case MCPMethods.RESOURCES_LIST:
        return { resources };

      case MCPMethods.RESOURCES_READ:
        return this.handleResourceRead(params as { uri: string });

      // Tools
      case MCPMethods.TOOLS_LIST:
        return { tools };

      case MCPMethods.TOOLS_CALL:
        return this.handleToolCall(params as { name: string; arguments?: Record<string, unknown> });

      // Prompts
      case MCPMethods.PROMPTS_LIST:
        return { prompts };

      case MCPMethods.PROMPTS_GET:
        return this.handlePromptGet(params as { name: string; arguments?: Record<string, string> });

      default:
        throw new Error(`Unknown method: ${method}`);
    }
  }

  private handleInitialize(clientId: string, params: Record<string, unknown>): object {
    // Store client capabilities
    if (params.capabilities) {
      this.clientCapabilities.set(clientId, params.capabilities as object);
    }

    logger.info('MCP client initialized', {
      clientId,
      clientInfo: params.clientInfo,
    });

    return {
      protocolVersion: MCP_VERSION,
      serverInfo: {
        name: MCP_SERVER_NAME,
        version: MCP_SERVER_VERSION,
      },
      capabilities: {
        resources: {
          subscribe: true,
          listChanged: true,
        },
        tools: {
          listChanged: true,
        },
        prompts: {
          listChanged: true,
        },
      },
      instructions: `You are connected to eaight, an AI-powered web browser. You have FULL CONTROL over the browser.

IMPORTANT: You have access to browser automation tools. Use them to:
- Navigate: browser_navigate { "url": "https://..." }
- Click: browser_click { "selector": "button" } or { "text": "Click me" }
- Type: browser_type { "selector": "input", "text": "hello" }
- Scroll: browser_scroll { "direction": "down" }
- Read page: Use resources browser://dom, browser://text, browser://state
- Screenshot: browser_screenshot {}

To get started:
1. Read browser://state to see current URL
2. Use browser_navigate to go somewhere
3. Use browser_click, browser_type to interact

Example - Go to Google and search:
1. browser_navigate { "url": "https://google.com" }
2. browser_type { "selector": "textarea[name='q']", "text": "hello world", "pressEnter": true }

Call prompts/get with name "eaight_capabilities" for full documentation.`,
    };
  }

  private handleShutdown(clientId: string): object {
    this.clientCapabilities.delete(clientId);
    logger.info('MCP client shutdown', { clientId });
    return {};
  }

  private async handleResourceRead(params: { uri: string }): Promise<object> {
    const { uri } = params;
    const { content, mimeType } = await readResource(uri);

    return {
      contents: [
        {
          uri,
          mimeType,
          text: mimeType.startsWith('image/') ? undefined : content,
          blob: mimeType.startsWith('image/') ? content : undefined,
        },
      ],
    };
  }

  private async handleToolCall(params: { name: string; arguments?: Record<string, unknown> }): Promise<object> {
    const { name, arguments: args = {} } = params;
    const result = await executeTool(name, args);

    if (!result.success) {
      throw new Error(result.error || 'Tool execution failed');
    }

    // Handle screenshot tool - save to file and return path
    // (workaround for Claude Code CLI image processing bug)
    if (name === ToolNames.SCREENSHOT && result.result) {
      const screenshotResult = result.result as {
        screenshot?: string;
        pageScreenshot?: string;
        dimensions?: { width: number; height: number };
      };

      if (screenshotResult.screenshot) {
        const fs = await import('fs');
        const path = await import('path');
        const os = await import('os');

        const timestamp = Date.now();
        const tmpDir = path.join(os.tmpdir(), 'eaight-screenshots');

        // Ensure directory exists
        if (!fs.existsSync(tmpDir)) {
          fs.mkdirSync(tmpDir, { recursive: true });
        }

        const screenshotPath = path.join(tmpDir, `screenshot-${timestamp}.png`);
        fs.writeFileSync(screenshotPath, Buffer.from(screenshotResult.screenshot, 'base64'));

        let responseText = `Screenshot saved to: ${screenshotPath}`;

        // If includeUI was used, also save the page screenshot
        if (screenshotResult.pageScreenshot) {
          const pageScreenshotPath = path.join(tmpDir, `screenshot-page-${timestamp}.png`);
          fs.writeFileSync(pageScreenshotPath, Buffer.from(screenshotResult.pageScreenshot, 'base64'));
          responseText += `\nPage screenshot saved to: ${pageScreenshotPath}`;
        }

        return {
          content: [
            {
              type: 'text',
              text: responseText,
            },
          ],
        };
      }
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result.result ?? { success: true }),
        },
      ],
    };
  }

  private handlePromptGet(params: { name: string; arguments?: Record<string, string> }): object {
    const { name, arguments: args = {} } = params;
    const result = getPrompt(name, args);

    if (!result) {
      throw new Error(`Unknown prompt: ${name}`);
    }

    return result;
  }

  // Public API
  getPort(): number {
    return this.wsPort;
  }

  getSSEPort(): number {
    return this.ssePort;
  }

  isActive(): boolean {
    return this.isRunning;
  }

  getConnections(): MCPConnection[] {
    return [
      ...this.wsTransport.getConnections(),
      ...this.sseTransport.getConnections(),
    ];
  }

  getClientCount(): number {
    return this.wsTransport.getClientCount() + this.sseTransport.getClientCount();
  }

  // Notify all clients of resource update
  notifyResourceUpdate(uri: string): void {
    if (!this.isRunning) return;

    const notification: MCPMessage = {
      jsonrpc: '2.0',
      method: MCPMethods.RESOURCE_UPDATED,
      params: { uri },
    };

    this.wsTransport.broadcast(notification);
    this.sseTransport.broadcast(notification);
  }
}

export const mcpServer = new MCPServer();
export default mcpServer;
