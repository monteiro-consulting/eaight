import React, { useEffect, useRef } from 'react';
import { TabGroup } from '../../../shared/types/browser';

interface TabContextMenuProps {
  x: number;
  y: number;
  tabId: string;
  tabGroupId: string | null;
  existingGroups: TabGroup[];
  onClose: () => void;
  onAddToNewGroup: () => void;
  onAddToGroup: (groupId: string) => void;
  onRemoveFromGroup: () => void;
  onCloseTab: () => void;
  onCloseOtherTabs: () => void;
}

export function TabContextMenu({
  x,
  y,
  tabId: _tabId,
  tabGroupId,
  existingGroups,
  onClose,
  onAddToNewGroup,
  onAddToGroup,
  onRemoveFromGroup,
  onCloseTab,
  onCloseOtherTabs,
}: TabContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  // Adjust position to stay within viewport
  const adjustedX = Math.min(x, window.innerWidth - 200);
  const adjustedY = Math.min(y, window.innerHeight - 250);

  return (
    <div
      ref={menuRef}
      className="fixed z-50 py-1 rounded-lg shadow-xl min-w-[180px]"
      style={{
        left: adjustedX,
        top: adjustedY,
        backgroundColor: 'var(--color-bg-elevated)',
        border: '1px solid var(--color-border-default)',
      }}
    >
      {/* Add to group section */}
      <div className="px-2 py-1">
        <span className="text-xs uppercase tracking-wide" style={{ color: 'var(--color-fg-muted)' }}>
          Tab Group
        </span>
      </div>

      <MenuItem onClick={onAddToNewGroup}>
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Add to new group
      </MenuItem>

      {existingGroups.length > 0 && (
        <div className="relative group/submenu">
          <MenuItem hasSubmenu>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            Add to existing group
            <svg className="w-3 h-3 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </MenuItem>

          {/* Submenu */}
          <div
            className="absolute left-full top-0 ml-1 py-1 rounded-lg shadow-xl min-w-[150px] hidden group-hover/submenu:block"
            style={{
              backgroundColor: 'var(--color-bg-elevated)',
              border: '1px solid var(--color-border-default)',
            }}
          >
            {existingGroups.map((group) => (
              <MenuItem
                key={group.id}
                onClick={() => onAddToGroup(group.id)}
                disabled={group.id === tabGroupId}
              >
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: group.color }}
                />
                <span className="truncate">{group.name}</span>
              </MenuItem>
            ))}
          </div>
        </div>
      )}

      {tabGroupId && (
        <MenuItem onClick={onRemoveFromGroup}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 12H6" />
          </svg>
          Remove from group
        </MenuItem>
      )}

      <div className="my-1 border-t" style={{ borderColor: 'var(--color-border-subtle)' }} />

      {/* Tab actions */}
      <MenuItem onClick={onCloseTab}>
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
        Close tab
      </MenuItem>

      <MenuItem onClick={onCloseOtherTabs}>
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
        Close other tabs
      </MenuItem>
    </div>
  );
}

interface MenuItemProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  hasSubmenu?: boolean;
}

function MenuItem({ children, onClick, disabled, hasSubmenu: _hasSubmenu }: MenuItemProps) {
  return (
    <button
      className={`w-full flex items-center gap-2 px-3 py-1.5 text-sm text-left transition-colors ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/5'
      }`}
      style={{ color: 'var(--color-fg-primary)' }}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

export default TabContextMenu;
