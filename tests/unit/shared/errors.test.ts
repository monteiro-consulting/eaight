import { describe, it, expect } from 'vitest';
import {
  BrowserError,
  ErrorCode,
  ok,
  err,
  browserErr,
  tryCatchSync,
  unwrap,
  unwrapOr,
  mapResult,
  Result,
} from '../../../src/shared/types/errors';

describe('BrowserError', () => {
  it('should create error with message and code', () => {
    const error = new BrowserError('Navigation failed', ErrorCode.NAV_ERROR);

    expect(error.message).toBe('Navigation failed');
    expect(error.code).toBe(ErrorCode.NAV_ERROR);
    expect(error.name).toBe('BrowserError');
    expect(error.timestamp).toBeDefined();
  });

  it('should include context when provided', () => {
    const error = new BrowserError(
      'Tab not found',
      ErrorCode.TAB_NOT_FOUND,
      { tabId: '123', requestedAction: 'close' }
    );

    expect(error.context).toEqual({
      tabId: '123',
      requestedAction: 'close',
    });
  });

  it('should default to UNKNOWN_ERROR code', () => {
    const error = new BrowserError('Something went wrong');

    expect(error.code).toBe(ErrorCode.UNKNOWN_ERROR);
  });

  it('should serialize to JSON correctly', () => {
    const error = new BrowserError(
      'Test error',
      ErrorCode.MCP_TOOL_ERROR,
      { tool: 'browser_click' }
    );

    const json = error.toJSON();

    expect(json.name).toBe('BrowserError');
    expect(json.message).toBe('Test error');
    expect(json.code).toBe(ErrorCode.MCP_TOOL_ERROR);
    expect(json.context).toEqual({ tool: 'browser_click' });
    expect(json.timestamp).toBeDefined();
  });

  it('should create from standard Error', () => {
    const standardError = new Error('Standard error message');
    const browserError = BrowserError.fromError(standardError, ErrorCode.JS_EXECUTION_ERROR);

    expect(browserError.message).toBe('Standard error message');
    expect(browserError.code).toBe(ErrorCode.JS_EXECUTION_ERROR);
    expect(browserError.context?.originalName).toBe('Error');
  });

  it('should return same BrowserError if already BrowserError', () => {
    const original = new BrowserError('Original', ErrorCode.NAV_ERROR);
    const result = BrowserError.fromError(original);

    expect(result).toBe(original);
  });

  it('should create from string', () => {
    const browserError = BrowserError.fromError('String error');

    expect(browserError.message).toBe('String error');
    expect(browserError.code).toBe(ErrorCode.UNKNOWN_ERROR);
  });
});

describe('Result type helpers', () => {
  describe('ok()', () => {
    it('should create successful result', () => {
      const result = ok(42);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(42);
      }
    });

    it('should work with objects', () => {
      const result = ok({ id: '123', name: 'test' });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual({ id: '123', name: 'test' });
      }
    });
  });

  describe('err()', () => {
    it('should create failed result', () => {
      const error = new BrowserError('Failed', ErrorCode.NAV_ERROR);
      const result = err(error);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe(error);
      }
    });
  });

  describe('browserErr()', () => {
    it('should create failed result with BrowserError', () => {
      const result = browserErr('Tab not found', ErrorCode.TAB_NOT_FOUND);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toBe('Tab not found');
        expect(result.error.code).toBe(ErrorCode.TAB_NOT_FOUND);
      }
    });
  });

  describe('tryCatchSync()', () => {
    it('should return ok for successful operation', () => {
      const result = tryCatchSync(() => 42);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(42);
      }
    });

    it('should return err for throwing operation', () => {
      const result = tryCatchSync(() => {
        throw new Error('Oops');
      }, ErrorCode.JS_EXECUTION_ERROR);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe(ErrorCode.JS_EXECUTION_ERROR);
      }
    });
  });

  describe('unwrap()', () => {
    it('should return data for successful result', () => {
      const result: Result<number> = ok(42);
      expect(unwrap(result)).toBe(42);
    });

    it('should throw for failed result', () => {
      const result: Result<number> = browserErr('Failed', ErrorCode.NAV_ERROR);
      expect(() => unwrap(result)).toThrow();
    });
  });

  describe('unwrapOr()', () => {
    it('should return data for successful result', () => {
      const result: Result<number> = ok(42);
      expect(unwrapOr(result, 0)).toBe(42);
    });

    it('should return default for failed result', () => {
      const result: Result<number> = browserErr('Failed', ErrorCode.NAV_ERROR);
      expect(unwrapOr(result, 0)).toBe(0);
    });
  });

  describe('mapResult()', () => {
    it('should transform successful result', () => {
      const result: Result<number> = ok(42);
      const mapped = mapResult(result, (n) => n * 2);

      expect(mapped.success).toBe(true);
      if (mapped.success) {
        expect(mapped.data).toBe(84);
      }
    });

    it('should pass through failed result', () => {
      const result: Result<number> = browserErr('Failed', ErrorCode.NAV_ERROR);
      const mapped = mapResult(result, (n) => n * 2);

      expect(mapped.success).toBe(false);
    });
  });
});

describe('ErrorCode enum', () => {
  it('should have navigation error codes', () => {
    expect(ErrorCode.NAV_ERROR).toBe('NAV_ERROR');
    expect(ErrorCode.NAV_TIMEOUT).toBe('NAV_TIMEOUT');
    expect(ErrorCode.NAV_BLOCKED).toBe('NAV_BLOCKED');
    expect(ErrorCode.NAV_INVALID_URL).toBe('NAV_INVALID_URL');
  });

  it('should have tab error codes', () => {
    expect(ErrorCode.TAB_NOT_FOUND).toBe('TAB_NOT_FOUND');
    expect(ErrorCode.TAB_LIMIT_REACHED).toBe('TAB_LIMIT_REACHED');
    expect(ErrorCode.TAB_CREATE_FAILED).toBe('TAB_CREATE_FAILED');
  });

  it('should have MCP error codes', () => {
    expect(ErrorCode.MCP_CONNECTION_FAILED).toBe('MCP_CONNECTION_FAILED');
    expect(ErrorCode.MCP_AUTH_FAILED).toBe('MCP_AUTH_FAILED');
    expect(ErrorCode.MCP_TOOL_ERROR).toBe('MCP_TOOL_ERROR');
    expect(ErrorCode.MCP_RESOURCE_ERROR).toBe('MCP_RESOURCE_ERROR');
  });
});
