#!/usr/bin/env node
// MCP Stdio Bridge - Connects Claude Code (stdio) to eaight MCP server (WebSocket)
// This script is launched by Claude Code and forwards MCP messages to eaight

const WebSocket = require('ws');
const readline = require('readline');
const fs = require('fs');
const path = require('path');

const MCP_SOCKET_FILENAME = 'mcp-server.json';

function getSocketPath() {
  if (process.platform === 'win32') {
    return path.join(process.env.APPDATA || '', 'eaight', MCP_SOCKET_FILENAME);
  }
  return path.join(process.env.HOME || '', '.eaight', MCP_SOCKET_FILENAME);
}

function readSocketInfo() {
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
  constructor() {
    this.ws = null;
    this.connected = false;
    this.messageQueue = [];

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

  async connect() {
    // Try to read endpoint from socket file
    const socketInfo = readSocketInfo();
    const wsUrl = socketInfo?.endpoint || 'ws://localhost:9222/mcp';

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

  handleStdinMessage(line) {
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

  sendToServer(message) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(message);
    }
  }

  handleServerMessage(message) {
    try {
      // Validate it's valid JSON before sending to stdout
      JSON.parse(message);
      // Send to stdout (Claude Code)
      process.stdout.write(message + '\n');
    } catch (error) {
      this.logError(`Invalid JSON from server: ${message}`);
    }
  }

  logError(message) {
    // Log to stderr so it doesn't interfere with MCP protocol on stdout
    process.stderr.write(`[eaight-bridge] ${message}\n`);
  }

  cleanup() {
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
