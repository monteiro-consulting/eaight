// Console Capture Module

import { WebContents } from 'electron';
import { EventEmitter } from 'events';

export interface ConsoleMessage {
  level: 'log' | 'warn' | 'error' | 'info' | 'debug';
  message: string;
  source: string;
  line: number;
  timestamp: number;
}

class ConsoleCapture extends EventEmitter {
  private messages: ConsoleMessage[] = [];
  private maxMessages = 100;

  setupForWebContents(webContents: WebContents): void {
    webContents.on('console-message', (_event, level, message, line, sourceId) => {
      const logLevel = this.mapLogLevel(level);
      const consoleMessage: ConsoleMessage = {
        level: logLevel,
        message,
        source: sourceId,
        line,
        timestamp: Date.now(),
      };

      this.messages.push(consoleMessage);
      if (this.messages.length > this.maxMessages) {
        this.messages.shift();
      }

      this.emit('message', consoleMessage);
    });
  }

  private mapLogLevel(level: number): ConsoleMessage['level'] {
    switch (level) {
      case 0:
        return 'debug';
      case 1:
        return 'log';
      case 2:
        return 'warn';
      case 3:
        return 'error';
      default:
        return 'info';
    }
  }

  getMessages(): ConsoleMessage[] {
    return this.messages;
  }

  getByLevel(level: ConsoleMessage['level']): ConsoleMessage[] {
    return this.messages.filter((m) => m.level === level);
  }

  clear(): void {
    this.messages = [];
  }
}

export const consoleCapture = new ConsoleCapture();
export default consoleCapture;
