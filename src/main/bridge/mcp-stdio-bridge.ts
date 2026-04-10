#!/usr/bin/env node
// MCP Stdio Bridge - Connects Claude Code (stdio) to eaight MCP server (WebSocket)

import WebSocket from 'ws';
import * as readline from 'readline';
import * as fs from 'fs';
import * as path from 'path';

const MCP_SOCKET_FILENAME = 'mcp-server.json';

interface SocketInfo {
  port: number;
  pid: number;
  startTime: string;
}

function getSocketPath(): string {
  if (process.platform === 'win32') {
    return path.join(process.env.APPDATA || '', 'eaight', MCP_SOCKET_FILENAME);
  }
  return path.join(process.env.HOME || '', '.eaight', MCP_SOCKET_FILENAME);
}

function readSocketInfo(): SocketInfo | null {
  const socketPath = getSocketPath();
  try {
    if (fs.existsSync(socketPath)) {
      const content = fs.readFileSync(socketPath, 'utf-8');
      return JSON.parse(content);
    }
  } catch {
    // Ignore errors
  }
  return null;
}

class MCPStdioBridge {
  private ws: WebSocket | null = null;
  private rl: readline.Interface;
  private connected = false;
  private messageQueue: string[] = [];

  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: false,
    });

    this.rl.on('line', (line) => {
      this.handleStdinMessage(line);
    });

    this.rl.on('close', () => {
      this.cleanup();
      process.exit(0);
    });
  }

  async connect(): Promise<void> {
    // Try to read port from socket file
    const socketInfo = readSocketInfo();
    const port = socketInfo?.port || 9222;
    const wsUrl = `ws://localhost:${port}/mcp`;

    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(wsUrl);

      this.ws.on('open', () => {
        this.connected = true;
        // Process any queued messages
        while (this.messageQueue.length > 0) {
          const msg = this.messageQueue.shift();
          if (msg) this.sendToServer(msg);
        }
        resolve();
      });

      this.ws.on('message', (data) => {
        const message = data.toString();
        this.handleServerMessage(message);
      });

      this.ws.on('error', (error) => {
        this.logError(`WebSocket error: ${error.message}`);
        reject(error);
      });

      this.ws.on('close', () => {
        this.connected = false;
        this.cleanup();
      });
    });
  }

  private handleStdinMessage(line: string): void {
    if (!line.trim()) return;

    try {
      // Validate JSON
      JSON.parse(line);

      if (this.connected) {
        this.sendToServer(line);
      } else {
        this.messageQueue.push(line);
      }
    } catch (error) {
      this.logError(`Invalid JSON from stdin: ${line}`);
    }
  }

  private sendToServer(message: string): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(message);
    }
  }

  private handleServerMessage(message: string): void {
    try {
      // Validate it's valid JSON before sending to stdout
      JSON.parse(message);
      // Send to stdout (Claude Code)
      process.stdout.write(message + '\n');
    } catch (error) {
      this.logError(`Invalid JSON from server: ${message}`);
    }
  }

  private logError(message: string): void {
    // Log to stderr so it doesn't interfere with MCP protocol on stdout
    process.stderr.write(`[eaight-bridge] ${message}\n`);
  }

  private cleanup(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.rl.close();
  }
}

// Main entry point
async function main() {
  const bridge = new MCPStdioBridge();

  try {
    await bridge.connect();
  } catch (error) {
    process.stderr.write(`[eaight-bridge] Failed to connect to eaight MCP server. Make sure eaight is running.\n`);
    process.exit(1);
  }
}

main().catch((error) => {
  process.stderr.write(`[eaight-bridge] Fatal error: ${error.message}\n`);
  process.exit(1);
});
