import React from 'react';
import { Tab as TabType } from '../../../shared/types/browser';
import { Button } from '../common';

interface TabProps {
  tab: TabType;
  isActive: boolean;
  isNextToActive?: boolean;
  groupColor?: string;
  width: number;
  onSelect: () => void;
  onClose: () => void;
  onContextMenu: (e: React.MouseEvent) => void;
  onDragStart: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
}

export function Tab({
  tab,
  isActive,
  isNextToActive,
  groupColor,
  width,
  onSelect,
  onClose,
  onContextMenu,
  onDragStart,
  onDragOver,
  onDrop,
}: TabProps) {
  const showSeparator = !isActive && !isNextToActive && !groupColor;
  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClose();
  };

  return (
    <div
      className={`eaight-tab group flex items-center gap-2 px-3 py-1.5 flex-shrink-0 cursor-pointer ${
        isActive ? 'active' : ''
      } ${groupColor ? 'in-group' : ''}`}
      style={{
        width: `${width}px`,
        ...(groupColor ? { '--group-color': groupColor } : {})
      } as React.CSSProperties}
      onClick={onSelect}
      onContextMenu={onContextMenu}
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      {/* Favicon */}
      <div className="w-4 h-4 flex-shrink-0">
        {tab.isLoading ? (
          <div className="w-4 h-4 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--color-accent-primary)', borderTopColor: 'transparent' }} />
        ) : tab.favicon ? (
          <img src={tab.favicon} alt="" className="w-4 h-4" />
        ) : (
          <svg
            className="w-4 h-4"
            style={{ color: 'var(--color-fg-muted)' }}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
            />
          </svg>
        )}
      </div>

      {/* Title */}
      <span className="flex-1 truncate text-sm">
        {tab.title || 'New Tab'}
      </span>

      {/* Audio indicator */}
      {tab.isAudible && (
        <svg
          className="w-3 h-3 flex-shrink-0"
          style={{ color: 'var(--color-accent-primary)' }}
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
        </svg>
      )}

      {/* Close button */}
      <Button
        variant="icon"
        size="sm"
        className="opacity-0 group-hover:opacity-100 w-5 h-5"
        onClick={handleClose}
      >
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </Button>

      {/* Separator */}
      {showSeparator && (
        <div
          className="absolute right-0 top-1/4 h-1/2 w-px"
          style={{ backgroundColor: 'var(--color-fg-muted)' }}
        />
      )}
    </div>
  );
}

export default Tab;
