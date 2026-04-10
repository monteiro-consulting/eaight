import { describe, it, expect } from 'vitest';
import {
  isValidUrl,
  normalizeUrl,
  isValidPort,
  sanitizeHtml,
  truncateText,
  validateTabId,
  validateCoordinates,
} from '../../../src/shared/utils/validators';

describe('isValidUrl', () => {
  it('should return true for valid HTTP URLs', () => {
    expect(isValidUrl('http://example.com')).toBe(true);
    expect(isValidUrl('https://example.com')).toBe(true);
    expect(isValidUrl('https://sub.example.com/path')).toBe(true);
    expect(isValidUrl('https://example.com:8080/path?query=1')).toBe(true);
  });

  it('should return true for other valid URLs', () => {
    expect(isValidUrl('file:///path/to/file')).toBe(true);
    expect(isValidUrl('ftp://ftp.example.com')).toBe(true);
  });

  it('should return false for invalid URLs', () => {
    expect(isValidUrl('')).toBe(false);
    expect(isValidUrl('not-a-url')).toBe(false);
    expect(isValidUrl('example.com')).toBe(false);
    expect(isValidUrl('://missing-protocol.com')).toBe(false);
  });
});

describe('normalizeUrl', () => {
  it('should return valid URLs unchanged', () => {
    expect(normalizeUrl('https://example.com')).toBe('https://example.com');
    expect(normalizeUrl('http://example.com/path')).toBe('http://example.com/path');
  });

  it('should add https:// to domain-like strings', () => {
    expect(normalizeUrl('example.com')).toBe('https://example.com');
    expect(normalizeUrl('sub.example.com')).toBe('https://sub.example.com');
    expect(normalizeUrl('www.google.com')).toBe('https://www.google.com');
  });

  it('should trim whitespace', () => {
    expect(normalizeUrl('  https://example.com  ')).toBe('https://example.com');
    expect(normalizeUrl('  example.com  ')).toBe('https://example.com');
  });

  it('should return empty string for search queries', () => {
    expect(normalizeUrl('hello world')).toBe('');
    expect(normalizeUrl('search query')).toBe('');
  });
});

describe('isValidPort', () => {
  it('should return true for valid ports', () => {
    expect(isValidPort(1)).toBe(true);
    expect(isValidPort(80)).toBe(true);
    expect(isValidPort(443)).toBe(true);
    expect(isValidPort(9222)).toBe(true);
    expect(isValidPort(65535)).toBe(true);
  });

  it('should return false for invalid ports', () => {
    expect(isValidPort(0)).toBe(false);
    expect(isValidPort(-1)).toBe(false);
    expect(isValidPort(65536)).toBe(false);
    expect(isValidPort(1.5)).toBe(false);
    expect(isValidPort(NaN)).toBe(false);
  });
});

describe('sanitizeHtml', () => {
  it('should remove script tags', () => {
    const input = '<div>Hello</div><script>alert("xss")</script>';
    expect(sanitizeHtml(input)).toBe('<div>Hello</div>');
  });

  it('should remove style tags', () => {
    const input = '<style>body { color: red; }</style><p>Text</p>';
    expect(sanitizeHtml(input)).toBe('<p>Text</p>');
  });

  it('should remove HTML comments', () => {
    const input = '<div>Content</div><!-- comment --><p>More</p>';
    expect(sanitizeHtml(input)).toBe('<div>Content</div><p>More</p>');
  });

  it('should handle nested scripts', () => {
    // Note: The regex-based sanitizer removes the first matching script tag
    // For production, consider using a proper HTML parser
    const input = '<script>alert("xss")</script><script>more</script><p>Safe</p>';
    const result = sanitizeHtml(input);
    expect(result).toBe('<p>Safe</p>');
  });
});

describe('truncateText', () => {
  it('should not truncate short text', () => {
    expect(truncateText('Hello', 10)).toBe('Hello');
    expect(truncateText('Hello', 5)).toBe('Hello');
  });

  it('should truncate long text with ellipsis', () => {
    expect(truncateText('Hello World', 8)).toBe('Hello...');
    expect(truncateText('This is a long text', 10)).toBe('This is...');
  });

  it('should handle edge cases', () => {
    expect(truncateText('', 10)).toBe('');
    expect(truncateText('Hi', 3)).toBe('Hi');
  });
});

describe('validateTabId', () => {
  it('should return true for valid tab IDs', () => {
    expect(validateTabId('123')).toBe(true);
    expect(validateTabId('tab-abc-123')).toBe(true);
    expect(validateTabId('a')).toBe(true);
  });

  it('should return false for invalid tab IDs', () => {
    expect(validateTabId('')).toBe(false);
    expect(validateTabId(null)).toBe(false);
    expect(validateTabId(undefined)).toBe(false);
    expect(validateTabId(123)).toBe(false);
    expect(validateTabId({})).toBe(false);
  });
});

describe('validateCoordinates', () => {
  it('should return true for valid coordinates', () => {
    expect(validateCoordinates({ x: 0, y: 0 })).toBe(true);
    expect(validateCoordinates({ x: 100, y: 200 })).toBe(true);
    expect(validateCoordinates({ x: -10, y: -20 })).toBe(true);
    expect(validateCoordinates({ x: 1.5, y: 2.5 })).toBe(true);
  });

  it('should return false for invalid coordinates', () => {
    expect(validateCoordinates(null)).toBe(false);
    expect(validateCoordinates(undefined)).toBe(false);
    expect(validateCoordinates({})).toBe(false);
    expect(validateCoordinates({ x: 0 })).toBe(false);
    expect(validateCoordinates({ y: 0 })).toBe(false);
    expect(validateCoordinates({ x: '0', y: 0 })).toBe(false);
    expect(validateCoordinates([0, 0])).toBe(false);
  });
});
