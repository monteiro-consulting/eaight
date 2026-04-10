// Error Types for eaight Browser

/**
 * Error codes for browser operations
 */
export enum ErrorCode {
  // Navigation errors
  NAV_ERROR = 'NAV_ERROR',
  NAV_TIMEOUT = 'NAV_TIMEOUT',
  NAV_BLOCKED = 'NAV_BLOCKED',
  NAV_INVALID_URL = 'NAV_INVALID_URL',

  // Tab errors
  TAB_NOT_FOUND = 'TAB_NOT_FOUND',
  TAB_LIMIT_REACHED = 'TAB_LIMIT_REACHED',
  TAB_CREATE_FAILED = 'TAB_CREATE_FAILED',
  TAB_CLOSE_FAILED = 'TAB_CLOSE_FAILED',

  // MCP errors
  MCP_CONNECTION_FAILED = 'MCP_CONNECTION_FAILED',
  MCP_AUTH_FAILED = 'MCP_AUTH_FAILED',
  MCP_TOOL_ERROR = 'MCP_TOOL_ERROR',
  MCP_RESOURCE_ERROR = 'MCP_RESOURCE_ERROR',
  MCP_INVALID_REQUEST = 'MCP_INVALID_REQUEST',
  MCP_TIMEOUT = 'MCP_TIMEOUT',

  // DOM/JS errors
  ELEMENT_NOT_FOUND = 'ELEMENT_NOT_FOUND',
  JS_EXECUTION_ERROR = 'JS_EXECUTION_ERROR',
  SELECTOR_INVALID = 'SELECTOR_INVALID',

  // Capture errors
  SCREENSHOT_FAILED = 'SCREENSHOT_FAILED',
  DOM_CAPTURE_FAILED = 'DOM_CAPTURE_FAILED',

  // Security errors
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  TOKEN_INVALID = 'TOKEN_INVALID',
  WHITELIST_BLOCKED = 'WHITELIST_BLOCKED',

  // Settings errors
  SETTINGS_LOAD_FAILED = 'SETTINGS_LOAD_FAILED',
  SETTINGS_SAVE_FAILED = 'SETTINGS_SAVE_FAILED',
  THEME_LOAD_FAILED = 'THEME_LOAD_FAILED',

  // General errors
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  TIMEOUT = 'TIMEOUT',
  INVALID_ARGUMENT = 'INVALID_ARGUMENT',
}

/**
 * Browser Error class with code and context
 */
export class BrowserError extends Error {
  public readonly code: ErrorCode;
  public readonly context?: Record<string, unknown>;
  public readonly timestamp: string;

  constructor(
    message: string,
    code: ErrorCode = ErrorCode.UNKNOWN_ERROR,
    context?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'BrowserError';
    this.code = code;
    this.context = context;
    this.timestamp = new Date().toISOString();

    // Maintain proper stack trace in V8 environments
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, BrowserError);
    }
  }

  /**
   * Convert error to JSON for logging/serialization
   */
  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      context: this.context,
      timestamp: this.timestamp,
      stack: this.stack,
    };
  }

  /**
   * Create a BrowserError from an unknown error
   */
  static fromError(error: unknown, code?: ErrorCode): BrowserError {
    if (error instanceof BrowserError) {
      return error;
    }

    if (error instanceof Error) {
      const browserError = new BrowserError(
        error.message,
        code || ErrorCode.UNKNOWN_ERROR,
        { originalName: error.name }
      );
      browserError.stack = error.stack;
      return browserError;
    }

    return new BrowserError(
      String(error),
      code || ErrorCode.UNKNOWN_ERROR
    );
  }
}

/**
 * Result type for operations that can fail
 * Use this instead of throwing exceptions for expected failures
 */
export type Result<T, E = BrowserError> =
  | { success: true; data: T }
  | { success: false; error: E };

/**
 * Helper to create a successful result
 */
export function ok<T>(data: T): Result<T, never> {
  return { success: true, data };
}

/**
 * Helper to create a failed result
 */
export function err<E = BrowserError>(error: E): Result<never, E> {
  return { success: false, error };
}

/**
 * Helper to create a BrowserError result
 */
export function browserErr(
  message: string,
  code: ErrorCode = ErrorCode.UNKNOWN_ERROR,
  context?: Record<string, unknown>
): Result<never, BrowserError> {
  return err(new BrowserError(message, code, context));
}

/**
 * Wrap an async operation in a Result
 */
export async function tryCatch<T>(
  fn: () => Promise<T>,
  errorCode?: ErrorCode
): Promise<Result<T, BrowserError>> {
  try {
    const data = await fn();
    return ok(data);
  } catch (error) {
    return err(BrowserError.fromError(error, errorCode));
  }
}

/**
 * Wrap a sync operation in a Result
 */
export function tryCatchSync<T>(
  fn: () => T,
  errorCode?: ErrorCode
): Result<T, BrowserError> {
  try {
    const data = fn();
    return ok(data);
  } catch (error) {
    return err(BrowserError.fromError(error, errorCode));
  }
}

/**
 * Assert that a result is successful, or throw
 */
export function unwrap<T>(result: Result<T>): T {
  if (result.success) {
    return result.data;
  }
  throw result.error;
}

/**
 * Get the data from a result, or return a default value
 */
export function unwrapOr<T>(result: Result<T>, defaultValue: T): T {
  if (result.success) {
    return result.data;
  }
  return defaultValue;
}

/**
 * Map over a successful result
 */
export function mapResult<T, U>(
  result: Result<T>,
  fn: (data: T) => U
): Result<U> {
  if (result.success) {
    return ok(fn(result.data));
  }
  return result;
}
