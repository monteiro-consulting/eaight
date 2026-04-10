import React, { useEffect } from 'react';
import { TabGroup } from '../../../shared/types/browser';

interface TabGroupHeaderProps {
  group: TabGroup;
  tabCount: number;
  onToggleCollapse: () => void;
  onUpdateColor: (color: string) => void;
  onUpdateName: (name: string) => void;
  onDelete: () => void;
}

export function TabGroupHeader({
  group,
  tabCount,
  onToggleCollapse,
  onUpdateColor,
  onUpdateName,
}: TabGroupHeaderProps) {
  // Listen for color picker results (color or name)
  useEffect(() => {
    const unsubscribe = window.electronAPI?.onColorPickerResult((result) => {
      if (result.groupId === group.id) {
        if (result.color) {
          onUpdateColor(result.color);
        }
        if (result.name) {
          onUpdateName(result.name);
        }
      }
    });
    return () => unsubscribe?.();
  }, [group.id, onUpdateColor, onUpdateName]);

  const handleRightClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    window.electronAPI?.showColorPicker({
      groupId: group.id,
      currentColor: group.color,
      currentName: group.name || '',
      x: e.clientX,
      y: e.clientY,
    });
  };

  // Check if group has a custom name (not default "New Group")
  const hasCustomName = group.name && group.name !== 'New Group';

  return (
    <div className="eaight-tab-group-header title-bar-no-drag relative flex items-center gap-1">
      {/* Colored dot with glow */}
      <div
        className="w-4 h-4 rounded-full cursor-pointer flex items-center justify-center hover:scale-110 transition-transform flex-shrink-0"
        style={{
          backgroundColor: group.color,
          boxShadow: `0 0 6px ${group.color}, 0 0 10px ${group.color}`,
        }}
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          onToggleCollapse();
        }}
        onContextMenu={handleRightClick}
      >
        {/* Show count when collapsed */}
        {group.isCollapsed && (
          <span className="text-[9px] font-bold text-white drop-shadow">{tabCount}</span>
        )}
      </div>

      {/* Group name - show when not collapsed and has custom name */}
      {!group.isCollapsed && hasCustomName && (
        <span
          className="text-xs cursor-pointer hover:opacity-80 truncate max-w-[80px]"
          style={{ color: group.color }}
          onContextMenu={handleRightClick}
          title="Right-click to edit"
        >
          {group.name}
        </span>
      )}
    </div>
  );
}

export default TabGroupHeader;
