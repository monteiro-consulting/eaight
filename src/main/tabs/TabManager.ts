// Tab Manager - Manages all browser tabs

import { BrowserWindow } from 'electron';
import { EventEmitter } from 'events';
import { Tab } from './Tab';
import { Tab as TabState, TabGroup } from '../../shared/types/browser';
import { logger } from '../utils/logger';
import { MAX_TABS } from '../../shared/constants/defaults';
import settingsManager from '../settings/SettingsManager';
import { generateId } from '../../shared/utils/formatters';

export class TabManager extends EventEmitter {
  private tabs: Map<string, Tab> = new Map();
  private tabGroups: Map<string, TabGroup> = new Map();
  private activeTabId: string | null = null;
  private window: BrowserWindow | null = null;
  private contentBounds = { x: 0, y: 112, width: 1280, height: 688 };
  private boundsUpdateTimeout: NodeJS.Timeout | null = null;
  private lastBounds: string = '';
  private overlayVisible: boolean = false;

  constructor() {
    super();
    logger.info('TabManager initialized');
  }

  setWindow(window: BrowserWindow): void {
    this.window = window;
    this.updateContentBounds();
  }

  setContentBounds(bounds: { x: number; y: number; width: number; height: number }): void {
    // Skip if bounds haven't changed
    const boundsKey = JSON.stringify(bounds);
    if (boundsKey === this.lastBounds) {
      return;
    }
    this.lastBounds = boundsKey;
    this.contentBounds = bounds;

    // Debounce the actual setBounds call
    if (this.boundsUpdateTimeout) {
      clearTimeout(this.boundsUpdateTimeout);
    }

    this.boundsUpdateTimeout = setTimeout(() => {
      const activeTab = this.getActiveTab();
      if (activeTab) {
        activeTab.setBounds(this.contentBounds);
      }
      this.boundsUpdateTimeout = null;
    }, 16); // ~60fps max update rate
  }

  private updateContentBounds(): void {
    if (!this.window) return;
    const [width, height] = this.window.getContentSize();
    // Account for UI chrome (tab bar 36px + URL bar 44px + bookmarks bar 32px)
    const uiHeight = 112;

    // Account for AI panel if visible
    const aiPanelVisible = settingsManager.isAIPanelVisible();
    const aiPanelWidth = aiPanelVisible ? settingsManager.getAIPanelWidth() : 0;

    const newBounds = {
      x: 0,
      y: uiHeight,
      width: width - aiPanelWidth,
      height: height - uiHeight,
    };

    logger.debug('updateContentBounds', {
      windowWidth: width,
      aiPanelVisible,
      aiPanelWidth,
      finalWidth: newBounds.width
    });

    // Update bounds and apply to active tab
    this.setContentBounds(newBounds);
  }

  createTab(url?: string): Tab {
    if (this.tabs.size >= MAX_TABS) {
      throw new Error(`Maximum number of tabs (${MAX_TABS}) reached`);
    }

    const tab = new Tab(url || settingsManager.getStartPage());
    this.tabs.set(tab.id, tab);

    // Listen for state changes and propagate them
    tab.on('state-changed', (state) => {
      this.emit('tab-updated', state);
    });

    // Listen for "open in new tab" requests from context menu
    tab.on('open-link-new-tab', (url: string) => {
      this.createTab(url);
    });

    // Always switch to the new tab
    this.switchToTab(tab.id);

    this.emit('tab-created', tab.state);
    logger.debug('Tab created', { id: tab.id, url: tab.state.url });

    return tab;
  }

  closeTab(tabId: string): boolean {
    const tab = this.tabs.get(tabId);
    if (!tab) return false;

    // If closing the active tab, switch to another
    if (this.activeTabId === tabId) {
      const tabIds = Array.from(this.tabs.keys());
      const index = tabIds.indexOf(tabId);
      const newActiveId = tabIds[index + 1] || tabIds[index - 1];

      if (newActiveId) {
        this.switchToTab(newActiveId);
      } else {
        this.activeTabId = null;
      }
    }

    // Remove from window (check if window still exists and is not destroyed)
    try {
      if (this.window && !this.window.isDestroyed()) {
        this.window.removeBrowserView(tab.view);
      }
    } catch {
      // Window already destroyed, ignore
    }

    try {
      tab.destroy();
    } catch {
      // Tab already destroyed, ignore
    }
    this.tabs.delete(tabId);

    this.emit('tab-closed', tabId);
    logger.debug('Tab closed', { id: tabId });

    return true;
  }

  switchToTab(tabId: string): boolean {
    const tab = this.tabs.get(tabId);
    if (!tab || !this.window) return false;

    // Hide current active tab
    if (this.activeTabId && this.activeTabId !== tabId) {
      const currentTab = this.tabs.get(this.activeTabId);
      if (currentTab) {
        this.window.removeBrowserView(currentTab.view);
      }
    }

    // Show new tab
    this.window.addBrowserView(tab.view);
    tab.setBounds(this.contentBounds);
    this.activeTabId = tabId;

    this.emit('tab-switched', tabId);
    logger.debug('Tab switched', { id: tabId });

    return true;
  }

  getTab(tabId: string): Tab | undefined {
    return this.tabs.get(tabId);
  }

  getActiveTab(): Tab | null {
    if (!this.activeTabId) return null;
    return this.tabs.get(this.activeTabId) || null;
  }

  getActiveTabId(): string | null {
    return this.activeTabId;
  }

  // Hide the active BrowserView (used when settings/overlays are shown)
  hideActiveView(): void {
    if (!this.window || !this.activeTabId) return;
    const activeTab = this.tabs.get(this.activeTabId);
    if (activeTab) {
      this.window.removeBrowserView(activeTab.view);
      this.overlayVisible = true;
      logger.debug('Active view hidden');
    }
  }

  // Show the active BrowserView (used when returning from settings/overlays)
  showActiveView(): void {
    if (!this.window || !this.activeTabId) return;
    const activeTab = this.tabs.get(this.activeTabId);
    if (activeTab) {
      this.window.addBrowserView(activeTab.view);
      activeTab.setBounds(this.contentBounds);
      this.overlayVisible = false;
      logger.debug('Active view shown');
    }
  }

  // Check if overlay (NTP, settings, etc.) is currently visible
  isOverlayVisible(): boolean {
    return this.overlayVisible;
  }

  // Shrink BrowserView from top to make room for dropdown menus
  private savedBounds: { x: number; y: number; width: number; height: number } | null = null;

  shrinkForDropdown(shrinkAmount: number): void {
    if (!this.window || !this.activeTabId) return;
    const activeTab = this.tabs.get(this.activeTabId);
    if (activeTab) {
      // Save current bounds
      this.savedBounds = { ...this.contentBounds };
      // Apply shrunk bounds
      const newBounds = {
        x: this.contentBounds.x,
        y: this.contentBounds.y + shrinkAmount,
        width: this.contentBounds.width,
        height: Math.max(0, this.contentBounds.height - shrinkAmount),
      };
      activeTab.setBounds(newBounds);
      logger.debug('BrowserView shrunk for dropdown', { shrinkAmount });
    }
  }

  restoreFromDropdown(): void {
    if (!this.window || !this.activeTabId) return;
    const activeTab = this.tabs.get(this.activeTabId);
    if (activeTab && this.savedBounds) {
      activeTab.setBounds(this.savedBounds);
      this.savedBounds = null;
      logger.debug('BrowserView restored from dropdown');
    }
  }

  getAllTabs(): TabState[] {
    return Array.from(this.tabs.values()).map(tab => tab.state);
  }

  getTabCount(): number {
    return this.tabs.size;
  }

  // Navigation helpers for active tab
  async navigate(url: string): Promise<void> {
    const tab = this.getActiveTab();
    if (tab) {
      await tab.loadURL(url);
    }
  }

  goBack(): void {
    this.getActiveTab()?.goBack();
  }

  goForward(): void {
    this.getActiveTab()?.goForward();
  }

  reload(): void {
    this.getActiveTab()?.reload();
  }

  stop(): void {
    this.getActiveTab()?.stop();
  }

  canGoBack(): boolean {
    return this.getActiveTab()?.canGoBack() || false;
  }

  canGoForward(): boolean {
    return this.getActiveTab()?.canGoForward() || false;
  }

  closeAllTabs(): void {
    for (const tabId of this.tabs.keys()) {
      this.closeTab(tabId);
    }
  }

  // Tab Group Management
  createGroup(name: string, color: string, tabIds?: string[]): TabGroup {
    const group: TabGroup = {
      id: generateId(),
      name,
      color,
      isCollapsed: false,
    };

    this.tabGroups.set(group.id, group);

    // Add tabs to group if provided
    if (tabIds) {
      for (const tabId of tabIds) {
        this.addTabToGroup(tabId, group.id);
      }
    }

    this.emit('group-created', group);
    logger.debug('Tab group created', { id: group.id, name });

    return group;
  }

  deleteGroup(groupId: string): boolean {
    const group = this.tabGroups.get(groupId);
    if (!group) return false;

    // Remove group reference from all tabs
    for (const tab of this.tabs.values()) {
      if (tab.state.groupId === groupId) {
        tab.updateState({ groupId: null });
      }
    }

    this.tabGroups.delete(groupId);
    this.emit('group-deleted', groupId);
    logger.debug('Tab group deleted', { id: groupId });

    return true;
  }

  updateGroup(groupId: string, updates: Partial<Omit<TabGroup, 'id'>>): TabGroup | null {
    const group = this.tabGroups.get(groupId);
    if (!group) return null;

    const updatedGroup = { ...group, ...updates };
    this.tabGroups.set(groupId, updatedGroup);

    this.emit('group-updated', updatedGroup);
    logger.debug('Tab group updated', { id: groupId, updates });

    return updatedGroup;
  }

  toggleGroupCollapse(groupId: string): boolean {
    const group = this.tabGroups.get(groupId);
    if (!group) return false;

    group.isCollapsed = !group.isCollapsed;
    this.tabGroups.set(groupId, group);

    this.emit('group-updated', group);
    logger.debug('Tab group collapse toggled', { id: groupId, isCollapsed: group.isCollapsed });

    return true;
  }

  addTabToGroup(tabId: string, groupId: string): boolean {
    const tab = this.tabs.get(tabId);
    const group = this.tabGroups.get(groupId);

    if (!tab || !group) return false;

    tab.updateState({ groupId });

    this.emit('tab-updated', tab.state);
    logger.debug('Tab added to group', { tabId, groupId });

    return true;
  }

  removeTabFromGroup(tabId: string): boolean {
    const tab = this.tabs.get(tabId);
    if (!tab || !tab.state.groupId) return false;

    const oldGroupId = tab.state.groupId;
    tab.updateState({ groupId: null });

    // Check if group is now empty and delete it
    const groupTabs = this.getTabsInGroup(oldGroupId);
    if (groupTabs.length === 0) {
      this.tabGroups.delete(oldGroupId);
      this.emit('group-deleted', oldGroupId);
      logger.debug('Empty group deleted', { groupId: oldGroupId });
    }

    this.emit('tab-updated', tab.state);
    logger.debug('Tab removed from group', { tabId, oldGroupId });

    return true;
  }

  getTabsInGroup(groupId: string): TabState[] {
    return Array.from(this.tabs.values())
      .filter(tab => tab.state.groupId === groupId)
      .map(tab => tab.state);
  }

  getTabGroups(): TabGroup[] {
    return Array.from(this.tabGroups.values());
  }

  getGroup(groupId: string): TabGroup | undefined {
    return this.tabGroups.get(groupId);
  }

  destroy(): void {
    this.closeAllTabs();
    this.tabGroups.clear();
    this.removeAllListeners();
    logger.info('TabManager destroyed');
  }
}

export const tabManager = new TabManager();
export default tabManager;
