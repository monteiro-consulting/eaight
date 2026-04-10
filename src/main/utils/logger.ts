// Structured Logger with file output support
import * as fs from 'fs';
import * as path from 'path';
import { app } from 'electron';
import { BrowserError } from '../../shared/types/errors';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  level: LogLevel;
  timestamp: string;
  message: string;
  context?: Record<string, unknown>;
  source?: string;
}

export interface LoggerOptions {
  enableFileLogging?: boolean;
  maxFileSize?: number; // in bytes
  maxFiles?: number;
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

class Logger {
  private isDev: boolean;
  private minLevel: LogLevel;
  private enableFileLogging: boolean;
  private logDir: string | null = null;
  private logFilePath: string | null = null;
  private maxFileSize: number;
  private maxFiles: number;
  private buffer: LogEntry[] = [];
  private flushInterval: NodeJS.Timeout | null = null;

  constructor(options: LoggerOptions = {}) {
    this.isDev = process.env.NODE_ENV !== 'production';
    this.minLevel = this.isDev ? 'debug' : 'info';
    this.enableFileLogging = options.enableFileLogging ?? true;
    this.maxFileSize = options.maxFileSize ?? 5 * 1024 * 1024; // 5MB
    this.maxFiles = options.maxFiles ?? 5;

    this.initFileLogging();
  }

  private initFileLogging(): void {
    if (!this.enableFileLogging) return;

    try {
      // Get log directory from app userData
      const userDataPath = app?.getPath?.('userData');
      if (!userDataPath) {
        // App not ready yet, will be initialized later
        return;
      }

      this.logDir = path.join(userDataPath, 'logs');

      // Ensure log directory exists
      if (!fs.existsSync(this.logDir)) {
        fs.mkdirSync(this.logDir, { recursive: true });
      }

      this.logFilePath = path.join(this.logDir, 'eaight.log');

      // Start flush interval (every 5 seconds)
      this.flushInterval = setInterval(() => this.flush(), 5000);
    } catch {
      // File logging disabled if we can't initialize
      this.enableFileLogging = false;
    }
  }

  /**
   * Initialize logger after app is ready
   */
  init(): void {
    if (!this.logDir) {
      this.initFileLogging();
    }
  }

  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVELS[level] >= LOG_LEVELS[this.minLevel];
  }

  private log(
    level: LogLevel,
    message: string,
    context?: Record<string, unknown>,
    source?: string
  ): void {
    if (!this.shouldLog(level)) {
      return;
    }

    const entry: LogEntry = {
      level,
      timestamp: new Date().toISOString(),
      message,
      context,
      source,
    };

    // Console output
    const formatted = this.format(entry);
    switch (level) {
      case 'debug':
      case 'info':
        console.log(formatted);
        break;
      case 'warn':
        console.warn(formatted);
        break;
      case 'error':
        console.error(formatted);
        break;
    }

    // Buffer for file output
    if (this.enableFileLogging) {
      this.buffer.push(entry);
    }
  }

  private format(entry: LogEntry): string {
    const { level, timestamp, message, context, source } = entry;
    const levelStr = level.toUpperCase().padEnd(5);
    const sourceStr = source ? `[${source}] ` : '';
    const contextStr = context ? ` ${JSON.stringify(context)}` : '';
    return `[${timestamp}] ${levelStr} ${sourceStr}${message}${contextStr}`;
  }

  private formatForFile(entry: LogEntry): string {
    return JSON.stringify(entry) + '\n';
  }

  /**
   * Flush buffered logs to file
   */
  flush(): void {
    if (!this.enableFileLogging || !this.logFilePath || this.buffer.length === 0) {
      return;
    }

    try {
      // Check file size and rotate if needed
      this.rotateIfNeeded();

      // Write buffered entries
      const content = this.buffer.map(e => this.formatForFile(e)).join('');
      fs.appendFileSync(this.logFilePath, content, 'utf-8');
      this.buffer = [];
    } catch (error) {
      console.error('Failed to write to log file:', error);
    }
  }

  private rotateIfNeeded(): void {
    if (!this.logFilePath || !this.logDir) return;

    try {
      const stats = fs.statSync(this.logFilePath);
      if (stats.size < this.maxFileSize) {
        return;
      }

      // Rotate files
      for (let i = this.maxFiles - 1; i >= 1; i--) {
        const oldPath = path.join(this.logDir, `eaight.${i}.log`);
        const newPath = path.join(this.logDir, `eaight.${i + 1}.log`);
        if (fs.existsSync(oldPath)) {
          if (i === this.maxFiles - 1) {
            fs.unlinkSync(oldPath);
          } else {
            fs.renameSync(oldPath, newPath);
          }
        }
      }

      // Rename current log
      fs.renameSync(this.logFilePath, path.join(this.logDir, 'eaight.1.log'));
    } catch {
      // Ignore rotation errors
    }
  }

  /**
   * Create a child logger with a source prefix
   */
  child(source: string): ChildLogger {
    return new ChildLogger(this, source);
  }

  debug(message: string, context?: Record<string, unknown>): void {
    this.log('debug', message, context);
  }

  info(message: string, context?: Record<string, unknown>): void {
    this.log('info', message, context);
  }

  warn(message: string, context?: Record<string, unknown>): void {
    this.log('warn', message, context);
  }

  error(message: string, context?: Record<string, unknown>): void {
    this.log('error', message, context);
  }

  /**
   * Log a BrowserError with full context
   */
  browserError(error: BrowserError): void {
    this.log('error', error.message, {
      code: error.code,
      ...error.context,
      stack: error.stack,
    });
  }

  /**
   * Log an unknown error
   */
  exception(error: unknown, message?: string): void {
    if (error instanceof BrowserError) {
      this.browserError(error);
      return;
    }

    if (error instanceof Error) {
      this.log('error', message || error.message, {
        name: error.name,
        stack: error.stack,
      });
      return;
    }

    this.log('error', message || 'Unknown error', { error: String(error) });
  }

  /**
   * Set minimum log level
   */
  setLevel(level: LogLevel): void {
    this.minLevel = level;
  }

  /**
   * Get current log file path
   */
  getLogFilePath(): string | null {
    return this.logFilePath;
  }

  /**
   * Cleanup on shutdown
   */
  shutdown(): void {
    this.flush();
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
      this.flushInterval = null;
    }
  }

  // Internal method for child loggers
  _log(
    level: LogLevel,
    message: string,
    context?: Record<string, unknown>,
    source?: string
  ): void {
    this.log(level, message, context, source);
  }
}

/**
 * Child logger with a source prefix
 */
class ChildLogger {
  constructor(
    private parent: Logger,
    private source: string
  ) {}

  debug(message: string, context?: Record<string, unknown>): void {
    this.parent._log('debug', message, context, this.source);
  }

  info(message: string, context?: Record<string, unknown>): void {
    this.parent._log('info', message, context, this.source);
  }

  warn(message: string, context?: Record<string, unknown>): void {
    this.parent._log('warn', message, context, this.source);
  }

  error(message: string, context?: Record<string, unknown>): void {
    this.parent._log('error', message, context, this.source);
  }
}

export const logger = new Logger();
export default logger;
