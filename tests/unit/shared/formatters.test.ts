import { describe, it, expect } from 'vitest';
import {
  formatBytes,
  formatDuration,
  formatTimestamp,
  formatUrl,
  extractDomain,
  formatTabTitle,
  generateId,
} from '../../../src/shared/utils/formatters';

describe('formatBytes', () => {
  it('should format zero bytes', () => {
    expect(formatBytes(0)).toBe('0 B');
  });

  it('should format bytes', () => {
    expect(formatBytes(100)).toBe('100 B');
    expect(formatBytes(1023)).toBe('1023 B');
  });

  it('should format kilobytes', () => {
    expect(formatBytes(1024)).toBe('1 KB');
    expect(formatBytes(1536)).toBe('1.5 KB');
    expect(formatBytes(10240)).toBe('10 KB');
  });

  it('should format megabytes', () => {
    expect(formatBytes(1048576)).toBe('1 MB');
    expect(formatBytes(5242880)).toBe('5 MB');
  });

  it('should format gigabytes', () => {
    expect(formatBytes(1073741824)).toBe('1 GB');
  });
});

describe('formatDuration', () => {
  it('should format milliseconds', () => {
    expect(formatDuration(0)).toBe('0ms');
    expect(formatDuration(100)).toBe('100ms');
    expect(formatDuration(999)).toBe('999ms');
  });

  it('should format seconds', () => {
    expect(formatDuration(1000)).toBe('1.0s');
    expect(formatDuration(1500)).toBe('1.5s');
    expect(formatDuration(30000)).toBe('30.0s');
  });

  it('should format minutes and seconds', () => {
    expect(formatDuration(60000)).toBe('1m 0s');
    expect(formatDuration(90000)).toBe('1m 30s');
    expect(formatDuration(125000)).toBe('2m 5s');
  });
});

describe('formatTimestamp', () => {
  it('should format timestamp to ISO string', () => {
    const timestamp = Date.UTC(2024, 0, 15, 10, 30, 0);
    expect(formatTimestamp(timestamp)).toBe('2024-01-15T10:30:00.000Z');
  });
});

describe('formatUrl', () => {
  it('should not truncate short URLs', () => {
    const url = 'https://example.com';
    expect(formatUrl(url)).toBe(url);
  });

  it('should truncate long URLs', () => {
    const url = 'https://example.com/very/long/path/that/exceeds/the/maximum/length/allowed';
    const result = formatUrl(url, 30);
    expect(result.length).toBeLessThanOrEqual(30);
    expect(result.endsWith('...')).toBe(true);
  });

  it('should handle invalid URLs', () => {
    const url = 'not-a-valid-url-but-very-long-string-that-needs-truncation';
    const result = formatUrl(url, 30);
    expect(result.length).toBeLessThanOrEqual(30);
    expect(result.endsWith('...')).toBe(true);
  });
});

describe('extractDomain', () => {
  it('should extract domain from URL', () => {
    expect(extractDomain('https://example.com')).toBe('example.com');
    expect(extractDomain('https://sub.example.com/path')).toBe('sub.example.com');
    expect(extractDomain('http://localhost:3000')).toBe('localhost');
  });

  it('should return input for invalid URLs', () => {
    expect(extractDomain('not-a-url')).toBe('not-a-url');
    expect(extractDomain('')).toBe('');
  });
});

describe('formatTabTitle', () => {
  it('should return "New Tab" for empty title', () => {
    expect(formatTabTitle('')).toBe('New Tab');
    expect(formatTabTitle(null as unknown as string)).toBe('New Tab');
    expect(formatTabTitle(undefined as unknown as string)).toBe('New Tab');
  });

  it('should not truncate short titles', () => {
    expect(formatTabTitle('Hello')).toBe('Hello');
    expect(formatTabTitle('Short Title')).toBe('Short Title');
  });

  it('should truncate long titles', () => {
    const longTitle = 'This is a very long tab title that should be truncated';
    const result = formatTabTitle(longTitle, 20);
    expect(result.length).toBeLessThanOrEqual(20);
    expect(result.endsWith('...')).toBe(true);
  });
});

describe('generateId', () => {
  it('should generate unique IDs', () => {
    const id1 = generateId();
    const id2 = generateId();
    expect(id1).not.toBe(id2);
  });

  it('should generate non-empty strings', () => {
    const id = generateId();
    expect(typeof id).toBe('string');
    expect(id.length).toBeGreaterThan(0);
  });

  it('should contain timestamp-like prefix', () => {
    const id = generateId();
    expect(id).toMatch(/^\d+-[a-z0-9]+$/);
  });
});
