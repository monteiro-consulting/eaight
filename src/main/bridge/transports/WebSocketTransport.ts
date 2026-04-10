// WebSocket Transport for MCP

import { WebSocketServer, WebSocket } from 'ws';
import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';
import { MCPMessage, MCPConnection } from '../../../shared/types/mcp';
import { logger } from '../../utils/logger';
import { DEFAULT_MCP_PORT, FALLBACK_MCP_PORTS } from '../../../shared/constants/mcp-constants';

interface Client {
  id: string;
  socket: WebSocket;
  name: string;
  connectedAt: number;
  lastActivity: number;
  permissions: string[];
}

export class WebSocketTransport extends EventEmitter {
  private server: WebSocketServer | null = null;
  private clients: Map<string, Client> = new Map();
  private port: number = DEFAULT_MCP_PORT;

  async start(preferredPort?: number): Promise<number> {
    const ports = [preferredPort || DEFAULT_MCP_PORT, ...FALLBACK_MCP_PORTS];

    for (const port of ports) {
      try {
        await this.tryStartOnPort(port);
        this.port = port;
        logger.info('WebSocket MCP server started', { port });
        return port;
      } catch (error) {
        logger.debug('Port unavailable, trying next', { port, error });
      }
    }

    throw new Error('Failed to start WebSocket server on any available port');
  }

  private tryStartOnPort(port: number): Promise<void> {
    return new Promise((resolve, reject) => {
      this.server = new WebSocketServer({ port, path: '/mcp', host: '127.0.0.1' });

      this.server.on('error', (error) => {
        reject(error);
      });

      this.server.on('listening', () => {
        this.setupServerEvents();
        resolve();
      });
    });
  }

  private setupServerEvents(): void {
    if (!this.server) return;

    this.server.on('connection', (socket: WebSocket) => {
      const clientId = uuidv4();
      const client: Client = {
        id: clientId,
        socket,
        name: 'unknown',
        connectedAt: Date.now(),
        lastActivity: Date.now(),
        permissions: [],
      };

      this.clients.set(clientId, client);
      logger.info('Client connected', { clientId });

      socket.on('message', (data: Buffer) => {
        try {
          const message = JSON.parse(data.toString()) as MCPMessage;
          client.lastActivity = Date.now();

          // Handle initialize to get client name
          if ('method' in message && message.method === 'initialize') {
            const params = message.params as { clientInfo?: { name?: string } } | undefined;
            if (params?.clientInfo?.name) {
              client.name = params.clientInfo.name;
            }
          }

          this.emit('message', { clientId, message });
        } catch (error) {
          logger.error('Failed to parse message', { clientId, error });
          this.emit('error', { clientId, error });
        }
      });

      socket.on('close', () => {
        this.clients.delete(clientId);
        logger.info('Client disconnected', { clientId });
        this.emit('disconnection', { clientId });
      });

      socket.on('error', (error) => {
        logger.error('Client socket error', { clientId, error });
        this.emit('error', { clientId, error });
      });

      this.emit('connection', { clientId, clientName: client.name });
    });
  }

  send(clientId: string, message: MCPMessage): boolean {
    const client = this.clients.get(clientId);
    if (!client || client.socket.readyState !== WebSocket.OPEN) {
      return false;
    }

    try {
      client.socket.send(JSON.stringify(message));
      return true;
    } catch (error) {
      logger.error('Failed to send message', { clientId, error });
      return false;
    }
  }

  broadcast(message: MCPMessage): void {
    for (const client of this.clients.values()) {
      if (client.socket.readyState === WebSocket.OPEN) {
        try {
          client.socket.send(JSON.stringify(message));
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
      client.socket.close();
      this.clients.delete(clientId);
    }
  }

  stop(): void {
    // Close all client connections
    for (const client of this.clients.values()) {
      client.socket.terminate();
    }
    this.clients.clear();

    // Close server
    if (this.server) {
      this.server.close();
      this.server = null;
    }

    logger.info('WebSocket MCP server stopped');
  }
}

export default WebSocketTransport;
