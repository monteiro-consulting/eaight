// Tab State Management

import { Tab } from '../../shared/types/browser';
import { generateId } from '../../shared/utils/formatters';
import { NEW_TAB_URL } from '../../shared/constants/defaults';

export function createTabState(url?: string): Tab {
  const now = Date.now();
  return {
    id: generateId(),
    url: url || NEW_TAB_URL,
    title: 'New Tab',
    favicon: null,
    isLoading: false,
    isAudible: false,
    isMuted: false,
    isPinned: false,
    groupId: null,
    createdAt: now,
    lastAccessed: now,
  };
}

export function updateTabState(tab: Tab, updates: Partial<Tab>): Tab {
  return {
    ...tab,
    ...updates,
    lastAccessed: Date.now(),
  };
}
