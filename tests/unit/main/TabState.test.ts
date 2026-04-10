import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock the generateId function to have predictable IDs
vi.mock('../../../src/shared/utils/formatters', () => ({
  generateId: vi.fn(() => 'test-id-123'),
}));

// Import after mocking
import { createTabState, updateTabState } from '../../../src/main/tabs/TabState';
import { NEW_TAB_URL } from '../../../src/shared/constants/defaults';

describe('TabState', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-15T10:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('createTabState', () => {
    it('should create a new tab state with default values', () => {
      const tab = createTabState();

      expect(tab.id).toBe('test-id-123');
      expect(tab.url).toBe(NEW_TAB_URL);
      expect(tab.title).toBe('New Tab');
      expect(tab.favicon).toBeNull();
      expect(tab.isLoading).toBe(false);
      expect(tab.isAudible).toBe(false);
      expect(tab.isMuted).toBe(false);
      expect(tab.isPinned).toBe(false);
    });

    it('should create a new tab state with custom URL', () => {
      const tab = createTabState('https://example.com');

      expect(tab.url).toBe('https://example.com');
    });

    it('should set createdAt and lastAccessed to current time', () => {
      const now = Date.now();
      const tab = createTabState();

      expect(tab.createdAt).toBe(now);
      expect(tab.lastAccessed).toBe(now);
    });
  });

  describe('updateTabState', () => {
    it('should update tab state with partial updates', () => {
      const original = createTabState('https://example.com');

      const updated = updateTabState(original, {
        title: 'Updated Title',
        isLoading: true,
      });

      expect(updated.title).toBe('Updated Title');
      expect(updated.isLoading).toBe(true);
      expect(updated.url).toBe('https://example.com');
      expect(updated.id).toBe(original.id);
    });

    it('should update lastAccessed timestamp', () => {
      const original = createTabState();

      // Advance time
      vi.advanceTimersByTime(5000);

      const updated = updateTabState(original, { title: 'New Title' });

      expect(updated.lastAccessed).toBeGreaterThan(original.lastAccessed);
    });

    it('should not mutate original tab state', () => {
      const original = createTabState();
      const originalTitle = original.title;

      updateTabState(original, { title: 'New Title' });

      expect(original.title).toBe(originalTitle);
    });

    it('should handle empty updates', () => {
      const original = createTabState('https://example.com');
      const updated = updateTabState(original, {});

      expect(updated.url).toBe(original.url);
      expect(updated.title).toBe(original.title);
    });

    it('should update favicon', () => {
      const original = createTabState();

      const updated = updateTabState(original, {
        favicon: 'https://example.com/favicon.ico',
      });

      expect(updated.favicon).toBe('https://example.com/favicon.ico');
    });

    it('should update audio states', () => {
      const original = createTabState();

      const updated = updateTabState(original, {
        isAudible: true,
        isMuted: true,
      });

      expect(updated.isAudible).toBe(true);
      expect(updated.isMuted).toBe(true);
    });

    it('should update pinned state', () => {
      const original = createTabState();

      const updated = updateTabState(original, { isPinned: true });

      expect(updated.isPinned).toBe(true);
    });
  });
});
