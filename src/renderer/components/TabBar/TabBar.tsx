import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useBrowserStore } from '../../store';
import { useTabs, useWindowControls } from '../../hooks';
import { Tab } from './Tab';
import { TabGroupHeader } from './TabGroupHeader';
import { TabContextMenu } from './TabContextMenu';
import { NewTabButton } from './NewTabButton';
import { Button } from '../common';
import { Tab as TabType, TabGroup } from '../../../shared/types/browser';

interface ContextMenuState {
  x: number;
  y: number;
  tabId: string;
  tabGroupId: string | null;
}

export function TabBar() {
  const tabs = useBrowserStore((state) => state.tabs);
  const tabGroups = useBrowserStore((state) => state.tabGroups);
  const activeTabId = useBrowserStore((state) => state.activeTabId);
  const { createTab, closeTab, switchTab } = useTabs();
  const { minimize, maximize, close } = useWindowControls();

  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  const [, setDraggedTabId] = useState<string | null>(null);
  const [tabWidth, setTabWidth] = useState<number>(240);
  const tabBarRef = useRef<HTMLDivElement>(null);

  // Calculate tab width dynamically like Chrome
  useEffect(() => {
    const calculateTabWidth = () => {
      if (!tabBarRef.current) return;

      const containerWidth = tabBarRef.current.offsetWidth;
      const newTabButtonWidth = 36; // Approximate width of new tab button
      const availableWidth = containerWidth - newTabButtonWidth - 16; // 16px for padding

      const tabCount = tabs.length;
      if (tabCount === 0) return;

      // Chrome-like behavior: max 240px, min 48px
      const idealWidth = availableWidth / tabCount;
      const calculatedWidth = Math.max(48, Math.min(240, idealWidth));

      setTabWidth(calculatedWidth);
    };

    calculateTabWidth();

    // Recalculate on window resize
    window.addEventListener('resize', calculateTabWidth);
    return () => window.removeEventListener('resize', calculateTabWidth);
  }, [tabs.length]);

  // Group tabs by their groupId
  const groupedTabs = React.useMemo(() => {
    const groups: Map<string | null, TabType[]> = new Map();
    groups.set(null, []); // ungrouped tabs

    tabGroups.forEach((group) => {
      groups.set(group.id, []);
    });

    tabs.forEach((tab) => {
      const groupId = tab.groupId;
      if (groups.has(groupId)) {
        groups.get(groupId)!.push(tab);
      } else {
        groups.get(null)!.push(tab);
      }
    });

    return groups;
  }, [tabs, tabGroups]);

  // Context menu handlers
  const handleContextMenu = useCallback((e: React.MouseEvent, tab: TabType) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      tabId: tab.id,
      tabGroupId: tab.groupId,
    });
  }, []);

  const handleCloseContextMenu = useCallback(() => {
    setContextMenu(null);
  }, []);

  const handleAddToNewGroup = useCallback(async () => {
    if (!contextMenu) return;
    await window.electronAPI.createTabGroup('New Group', '#3b82f6', [contextMenu.tabId]);
    setContextMenu(null);
  }, [contextMenu]);

  const handleAddToGroup = useCallback(async (groupId: string) => {
    if (!contextMenu) return;
    await window.electronAPI.addTabToGroup(contextMenu.tabId, groupId);
    setContextMenu(null);
  }, [contextMenu]);

  const handleRemoveFromGroup = useCallback(async () => {
    if (!contextMenu) return;
    await window.electronAPI.removeTabFromGroup(contextMenu.tabId);
    setContextMenu(null);
  }, [contextMenu]);

  const handleCloseOtherTabs = useCallback(() => {
    if (!contextMenu) return;
    tabs.forEach((tab) => {
      if (tab.id !== contextMenu.tabId) {
        closeTab(tab.id);
      }
    });
    setContextMenu(null);
  }, [contextMenu, tabs, closeTab]);

  // Group management
  const handleToggleCollapse = useCallback(async (groupId: string) => {
    await window.electronAPI.toggleGroupCollapse(groupId);
  }, []);

  const handleUpdateGroupColor = useCallback(async (groupId: string, color: string) => {
    await window.electronAPI.updateTabGroup(groupId, { color });
  }, []);

  const handleUpdateGroupName = useCallback(async (groupId: string, name: string) => {
    await window.electronAPI.updateTabGroup(groupId, { name });
  }, []);

  const handleDeleteGroup = useCallback(async (groupId: string) => {
    await window.electronAPI.deleteTabGroup(groupId);
  }, []);

  // Drag and drop handlers
  const handleDragStart = useCallback((e: React.DragEvent, tabId: string) => {
    setDraggedTabId(tabId);
    e.dataTransfer.setData('text/plain', tabId);
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent, targetTabId: string) => {
    e.preventDefault();
    const sourceTabId = e.dataTransfer.getData('text/plain');
    if (!sourceTabId || sourceTabId === targetTabId) {
      setDraggedTabId(null);
      return;
    }

    const sourceTab = tabs.find((t) => t.id === sourceTabId);
    const targetTab = tabs.find((t) => t.id === targetTabId);

    if (!sourceTab || !targetTab) {
      setDraggedTabId(null);
      return;
    }

    // If target is in a group, add source to that group
    if (targetTab.groupId) {
      await window.electronAPI.addTabToGroup(sourceTabId, targetTab.groupId);
    } else if (!sourceTab.groupId) {
      // Both ungrouped - create new group with both tabs
      await window.electronAPI.createTabGroup('New Group', '#3b82f6', [targetTabId, sourceTabId]);
    }

    setDraggedTabId(null);
  }, [tabs]);

  // Render a group of tabs
  const renderGroup = (group: TabGroup) => {
    const groupTabs = groupedTabs.get(group.id) || [];
    if (groupTabs.length === 0) return null;

    return (
      <div key={group.id} className="flex items-end group/tabgroup">
        <TabGroupHeader
          group={group}
          tabCount={groupTabs.length}
          onToggleCollapse={() => handleToggleCollapse(group.id)}
          onUpdateColor={(color) => handleUpdateGroupColor(group.id, color)}
          onUpdateName={(name) => handleUpdateGroupName(group.id, name)}
          onDelete={() => handleDeleteGroup(group.id)}
        />
        {!group.isCollapsed &&
          groupTabs.map((tab, index) => {
            const nextTab = groupTabs[index + 1];
            const isNextToActive = nextTab && nextTab.id === activeTabId;
            return (
              <div key={tab.id} className="title-bar-no-drag">
                <Tab
                  tab={tab}
                  isActive={tab.id === activeTabId}
                  isNextToActive={isNextToActive}
                  groupColor={group.color}
                  width={tabWidth}
                  onSelect={() => switchTab(tab.id)}
                  onClose={() => closeTab(tab.id)}
                  onContextMenu={(e) => handleContextMenu(e, tab)}
                  onDragStart={(e) => handleDragStart(e, tab.id)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, tab.id)}
                />
              </div>
            );
          })}
      </div>
    );
  };

  // Render ungrouped tabs
  const renderUngroupedTabs = () => {
    const ungroupedTabs = groupedTabs.get(null) || [];
    return ungroupedTabs.map((tab, index) => {
      const nextTab = ungroupedTabs[index + 1];
      const isNextToActive = nextTab && nextTab.id === activeTabId;
      return (
        <div key={tab.id} className="title-bar-no-drag">
          <Tab
            tab={tab}
            isActive={tab.id === activeTabId}
            isNextToActive={isNextToActive}
            width={tabWidth}
            onSelect={() => switchTab(tab.id)}
            onClose={() => closeTab(tab.id)}
            onContextMenu={(e) => handleContextMenu(e, tab)}
            onDragStart={(e) => handleDragStart(e, tab.id)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, tab.id)}
          />
        </div>
      );
    });
  };

  return (
    <div className="flex flex-col eaight-titlebar">
      {/* Draggable title bar region at top */}
      <div className="h-2 title-bar-drag" />

      {/* Tab bar content */}
      <div className="flex items-center h-7">
        {/* Tabs - each tab is no-drag, space between is draggable */}
        <div ref={tabBarRef} className="eaight-tabbar flex-1 flex items-end gap-0 px-2 overflow-x-auto title-bar-drag">
          {/* Render groups first */}
          {tabGroups.map(renderGroup)}

          {/* Render ungrouped tabs */}
          {renderUngroupedTabs()}

          <div className="title-bar-no-drag self-center">
            <NewTabButton onClick={() => createTab()} />
          </div>
        </div>

        {/* Window controls */}
        <div className="flex items-center gap-1 px-2 title-bar-no-drag">
          <Button variant="icon" size="sm" onClick={minimize}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </Button>
          <Button variant="icon" size="sm" onClick={maximize}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4h16v16h-4" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 20V8h12v12H4z" />
            </svg>
          </Button>
          <Button variant="icon" size="sm" onClick={close} className="hover:bg-red-500 hover:text-white">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Button>
        </div>
      </div>

      {/* Context menu */}
      {contextMenu && (
        <TabContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          tabId={contextMenu.tabId}
          tabGroupId={contextMenu.tabGroupId}
          existingGroups={tabGroups}
          onClose={handleCloseContextMenu}
          onAddToNewGroup={handleAddToNewGroup}
          onAddToGroup={handleAddToGroup}
          onRemoveFromGroup={handleRemoveFromGroup}
          onCloseTab={() => {
            closeTab(contextMenu.tabId);
            setContextMenu(null);
          }}
          onCloseOtherTabs={handleCloseOtherTabs}
        />
      )}
    </div>
  );
}

export default TabBar;
