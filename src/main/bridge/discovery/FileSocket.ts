// File Socket Discovery - Writes server info for auto-discovery

import * as fs from 'fs';
import { MCPServerInfo } from '../../../shared/types/mcp';
import { MCP_SERVER_NAME, MCP_SERVER_VERSION } from '../../../shared/constants/mcp-constants';
import { getSocketPath, getTokenPath, ensureSocketDir } from '../../utils/paths';
import { logger } from '../../utils/logger';

export class FileSocket {
  private socketPath: string;
  private written = false;

  constructor() {
    this.socketPath = getSocketPath();
  }

  write(port: number): void {
    ensureSocketDir();

    const serverInfo: MCPServerInfo = {
      name: MCP_SERVER_NAME,
      version: MCP_SERVER_VERSION,
      protocol: 'mcp',
      transport: 'websocket',
      endpoint: `ws://localhost:${port}/mcp`,
      pid: process.pid,
      startedAt: new Date().toISOString(),
      capabilities: ['resources', 'tools', 'prompts'],
      auth: {
        type: 'token',
        tokenPath: getTokenPath(),
      },
    };

    try {
      fs.writeFileSync(this.socketPath, JSON.stringify(serverInfo, null, 2), 'utf-8');
      this.written = true;
      logger.info('Socket file written', { path: this.socketPath });
    } catch (error) {
      logger.error('Failed to write socket file', { path: this.socketPath, error });
    }
  }

  remove(): void {
    if (!this.written) return;

    try {
      if (fs.existsSync(this.socketPath)) {
        fs.unlinkSync(this.socketPath);
        logger.info('Socket file removed', { path: this.socketPath });
      }
    } catch (error) {
      logger.error('Failed to remove socket file', { path: this.socketPath, error });
    }

    this.written = false;
  }

  getPath(): string {
    return this.socketPath;
  }

  exists(): boolean {
    return fs.existsSync(this.socketPath);
  }

  read(): MCPServerInfo | null {
    try {
      const content = fs.readFileSync(this.socketPath, 'utf-8');
      return JSON.parse(content) as MCPServerInfo;
    } catch {
      return null;
    }
  }
}

export const fileSocket = new FileSocket();
export default fileSocket;
