import React, { useState } from 'react';
import { useNavigation } from '../../hooks';

interface Bookmark {
  id: string;
  title: string;
  url: string;
  favicon?: string;
}

// Temporary hardcoded bookmarks for demo
const defaultBookmarks: Bookmark[] = [
  { id: '1', title: 'Google', url: 'https://www.google.com', favicon: 'https://www.google.com/favicon.ico' },
  { id: '2', title: 'GitHub', url: 'https://github.com', favicon: 'https://github.com/favicon.ico' },
  { id: '3', title: 'Stack Overflow', url: 'https://stackoverflow.com', favicon: 'https://stackoverflow.com/favicon.ico' },
  { id: '4', title: 'MDN', url: 'https://developer.mozilla.org', favicon: 'https://developer.mozilla.org/favicon.ico' },
];

interface ContextMenuState {
  visible: boolean;
  x: number;
  y: number;
  bookmark: Bookmark | null;
}

export function BookmarksBar() {
  const { navigate } = useNavigation();
  const [bookmarks] = useState<Bookmark[]>(defaultBookmarks);
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({
    visible: false,
    x: 0,
    y: 0,
    bookmark: null,
  });

  const handleBookmarkClick = (url: string) => {
    navigate(url);
  };

  const handleContextMenu = (e: React.MouseEvent, bookmark: Bookmark) => {
    e.preventDefault();
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      bookmark,
    });
  };

  const closeContextMenu = () => {
    setContextMenu({ visible: false, x: 0, y: 0, bookmark: null });
  };

  const handleEdit = () => {
    // TODO: Implement edit bookmark dialog
    console.log('Edit bookmark:', contextMenu.bookmark);
    closeContextMenu();
  };

  const handleDelete = () => {
    // TODO: Implement delete bookmark
    console.log('Delete bookmark:', contextMenu.bookmark);
    closeContextMenu();
  };

  // Close context menu when clicking elsewhere
  React.useEffect(() => {
    const handleClick = () => closeContextMenu();
    if (contextMenu.visible) {
      document.addEventListener('click', handleClick);
      return () => document.removeEventListener('click', handleClick);
    }
  }, [contextMenu.visible]);

  return (
    <div className="flex items-center gap-1 h-8 px-3 bg-dark-bg-secondary border-b border-dark-bg-tertiary overflow-x-auto">
      {bookmarks.map((bookmark) => (
        <button
          key={bookmark.id}
          className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-dark-bg-tertiary transition-colors text-sm whitespace-nowrap"
          onClick={() => handleBookmarkClick(bookmark.url)}
          onContextMenu={(e) => handleContextMenu(e, bookmark)}
          title={bookmark.url}
        >
          {bookmark.favicon ? (
            <img
              src={bookmark.favicon}
              alt=""
              className="w-4 h-4"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          ) : (
            <svg className="w-4 h-4 text-dark-fg-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          )}
          <span className="text-dark-fg-secondary">{bookmark.title}</span>
        </button>
      ))}

      {/* Context Menu */}
      {contextMenu.visible && (
        <div
          className="fixed bg-dark-bg-secondary rounded-lg shadow-lg border border-dark-bg-tertiary py-1 z-50"
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          <button
            className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-dark-fg-primary hover:bg-dark-bg-tertiary"
            onClick={handleEdit}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit
          </button>
          <button
            className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-red-500 hover:bg-dark-bg-tertiary"
            onClick={handleDelete}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

export default BookmarksBar;
