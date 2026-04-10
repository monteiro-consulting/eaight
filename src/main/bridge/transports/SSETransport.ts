// SSE Transport for MCP (Server-Sent Events)
// Compatible with Claude Code CLI

import { createServer, Server, IncomingMessage, ServerResponse } from 'http';
import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';
import { MCPMessage, MCPConnection } from '../../../shared/types/mcp';
import { logger } from '../../utils/logger';
import { DEFAULT_MCP_PORT, FALLBACK_MCP_PORTS } from '../../../shared/constants/mcp-constants';

interface Client {
  id: string;
  response: ServerResponse;
  name: string;
  connectedAt: number;
  lastActivity: number;
  permissions: string[];
}

export class SSETransport extends EventEmitter {
  private server: Server | null = null;
  private clients: Map<string, Client> = new Map();
  private port: number = DEFAULT_MCP_PORT;

  async start(preferredPort?: number): Promise<number> {
    const ports = [preferredPort || DEFAULT_MCP_PORT, ...FALLBACK_MCP_PORTS];

    for (const port of ports) {
      try {
        await this.tryStartOnPort(port);
        this.port = port;
        logger.info('SSE MCP server started', { port });
        return port;
      } catch (error) {
        logger.debug('Port unavailable, trying next', { port, error });
      }
    }

    throw new Error('Failed to start SSE server on any available port');
  }

  private tryStartOnPort(port: number): Promise<void> {
    return new Promise((resolve, reject) => {
      this.server = createServer((req, res) => this.handleRequest(req, res));

      this.server.on('error', (error) => {
        reject(error);
      });

      this.server.listen(port, '127.0.0.1', () => {
        resolve();
      });
    });
  }

  private handleRequest(req: IncomingMessage, res: ServerResponse): void {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      res.writeHead(200);
      res.end();
      return;
    }

    const url = new URL(req.url || '/', `http://localhost:${this.port}`);

    if (url.pathname === '/mcp' || url.pathname === '/sse') {
      if (req.method === 'GET') {
        // SSE connection
        this.handleSSEConnection(req, res);
      } else if (req.method === 'POST') {
        // Message from client
        this.handleMessage(req, res);
      } else {
        res.writeHead(405);
        res.end('Method not allowed');
      }
    } else {
      res.writeHead(404);
      res.end('Not found');
    }
  }

  private handleSSEConnection(req: IncomingMessage, res: ServerResponse): void {
    const clientId = uuidv4();

    // SSE headers
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    });

    const client: Client = {
      id: clientId,
      response: res,
      name: 'unknown',
      connectedAt: Date.now(),
      lastActivity: Date.now(),
      permissions: [],
    };

    this.clients.set(clientId, client);
    logger.info('SSE client connected', { clientId });

    // Send the client ID as the first event
    res.write(`event: endpoint\ndata: /mcp?clientId=${clientId}\n\n`);

    // Keep-alive
    const keepAlive = setInterval(() => {
      if (res.writable) {
        res.write(':ping\n\n');
      }
    }, 30000);

    req.on('close', () => {
      clearInterval(keepAlive);
      this.clients.delete(clientId);
      logger.info('SSE client disconnected', { clientId });
      this.emit('disconnection', { clientId });
    });

    this.emit('connection', { clientId, clientName: client.name });
  }

  private handleMessage(req: IncomingMessage, res: ServerResponse): void {
    const url = new URL(req.url || '/', `http://localhost:${this.port}`);
    const clientId = url.searchParams.get('clientId');
    logger.debug('SSE POST received', { clientId, url: req.url });

    if (!clientId) {
      res.writeHead(400);
      res.end(JSON.stringify({ error: 'Missing clientId' }));
      return;
    }

    const client = this.clients.get(clientId);
    if (!client) {
      logger.debug('SSE client not found', { clientId, clients: Array.from(this.clients.keys()) });
      res.writeHead(404);
      res.end(JSON.stringify({ error: 'Client not found' }));
      return;
    }

    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
      logger.debug('SSE POST data chunk', { clientId, chunkLen: chunk.length });
    });

    req.on('end', () => {
      logger.debug('SSE POST end', { clientId, bodyLen: body.length });
      try {
        const message = JSON.parse(body) as MCPMessage;
        client.lastActivity = Date.now();

        // Handle initialize to get client name
        if ('method' in message && message.method === 'initialize') {
          const params = message.params as { clientInfo?: { name?: string } } | undefined;
          if (params?.clientInfo?.name) {
            client.name = params.clientInfo.name;
          }
        }

        this.emit('message', { clientId, message });

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'ok' }));
      } catch (error) {
        logger.error('Failed to parse message', { clientId, error });
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid JSON' }));
      }
    });

    req.on('error', (err) => {
      logger.error('SSE POST request error', { clientId, error: err.message });
    });
  }

  send(clientId: string, message: MCPMessage): boolean {
    const client = this.clients.get(clientId);
    if (!client || !client.response.writable) {
      return false;
    }

    try {
      const data = JSON.stringify(message);
      client.response.write(`event: message\ndata: ${data}\n\n`);
      return true;
    } catch (error) {
      logger.error('Failed to send message', { clientId, error });
      return false;
    }
  }

  broadcast(message: MCPMessage): void {
    const data = JSON.stringify(message);
    for (const client of this.clients.values()) {
      if (client.response.writable) {
        try {
          client.response.write(`event: message\ndata: ${data}\n\n`);
        } catch (error) {
          logger.error('Failed to broadcast to client', { clientId: client.id, error });
        }
      }
    }
  }

  getConnections(): MCPConnection[] {
    return Array.from(this.clients.values()).map(client => ({
      id: client.id,
      clientName: client.name,
      connectedAt: client.connectedAt,
      permissions: client.permissions,
      lastActivity: client.lastActivity,
    }));
  }

  getPort(): number {
    return this.port;
  }

  getClientCount(): number {
    return this.clients.size;
  }

  disconnectClient(clientId: string): void {
    const client = this.clients.get(clientId);
    if (client) {
      client.response.end();
      this.clients.delete(clientId);
    }
  }

  stop(): void {
    // Close all client connections
    for (const client of this.clients.values()) {
      client.response.end();
    }
    this.clients.clear();

    // Close server and all connections
    if (this.server) {
      this.server.closeAllConnections();
      this.server.close();
      this.server = null;
    }

    logger.info('SSE MCP server stopped');
  }
}

export default SSETransport;
