import React, { useState, useEffect } from 'react';

interface FolderItem {
  name: string;
  path: string;
  isDirectory: boolean;
}

interface FolderTreeProps {
  onSelectFolder: (path: string) => void;
  selectedFolder: string | null;
}

// Folder icon
const FolderIcon = ({ isOpen }: { isOpen?: boolean }) => (
  <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    {isOpen ? (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
    ) : (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
    )}
  </svg>
);

// Chevron icon
const ChevronIcon = ({ isExpanded }: { isExpanded: boolean }) => (
  <svg
    className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

// Home icon
const HomeIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

interface FolderNodeProps {
  item: FolderItem;
  level: number;
  selectedPath: string | null;
  onSelect: (path: string) => void;
}

function FolderNode({ item, level, selectedPath, onSelect }: FolderNodeProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [children, setChildren] = useState<FolderItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const isSelected = selectedPath === item.path;

  const handleToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!isExpanded && children.length === 0) {
      setIsLoading(true);
      try {
        const folders = await window.electronAPI.listFolders(item.path);
        setChildren(folders);
      } catch (error) {
        console.error('Failed to load folders:', error);
      }
      setIsLoading(false);
    }

    setIsExpanded(!isExpanded);
  };

  const handleSelect = () => {
    onSelect(item.path);
  };

  return (
    <div>
      <div
        className={`flex items-center gap-1 py-1 px-2 cursor-pointer rounded transition-colors ${
          isSelected ? 'bg-[var(--color-accent-primary)]/20' : 'hover:bg-[var(--color-bg-tertiary)]'
        }`}
        style={{ paddingLeft: `${level * 12 + 4}px` }}
        onClick={handleSelect}
        onDoubleClick={handleToggle}
      >
        <button
          onClick={handleToggle}
          className="p-0.5 hover:bg-black/10 rounded"
          style={{ color: 'var(--color-fg-muted)' }}
        >
          {isLoading ? (
            <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
          ) : (
            <ChevronIcon isExpanded={isExpanded} />
          )}
        </button>
        <FolderIcon isOpen={isExpanded} />
        <span
          className="text-sm truncate flex-1"
          style={{ color: isSelected ? 'var(--color-accent-primary)' : 'var(--color-fg-primary)' }}
        >
          {item.name}
        </span>
      </div>

      {isExpanded && children.length > 0 && (
        <div>
          {children.map((child) => (
            <FolderNode
              key={child.path}
              item={child}
              level={level + 1}
              selectedPath={selectedPath}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function FolderTree({ onSelectFolder, selectedFolder }: FolderTreeProps) {
  const [userHome, setUserHome] = useState<string>('');
  const [rootFolders, setRootFolders] = useState<FolderItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadInitialFolders = async () => {
      try {
        const home = await window.electronAPI.getUserHome();
        setUserHome(home);
        const folders = await window.electronAPI.listFolders(home);
        setRootFolders(folders);
      } catch (error) {
        console.error('Failed to load folders:', error);
      }
      setIsLoading(false);
    };

    loadInitialFolders();
  }, []);

  const handleGoHome = async () => {
    onSelectFolder(userHome);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-4">
        <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" style={{ color: 'var(--color-fg-muted)' }} />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header with home button */}
      <div
        className="flex items-center gap-2 px-2 py-1.5 text-xs"
        style={{ borderBottom: '1px solid var(--color-border-default)', color: 'var(--color-fg-muted)' }}
      >
        <button
          onClick={handleGoHome}
          className="p-1 rounded hover:bg-[var(--color-bg-tertiary)]"
          title="Go to home folder"
        >
          <HomeIcon />
        </button>
        <span className="truncate flex-1">{userHome}</span>
      </div>

      {/* Selected folder indicator */}
      {selectedFolder && (
        <div
          className="px-3 py-2 text-xs"
          style={{ backgroundColor: 'var(--color-accent-primary)/10', borderBottom: '1px solid var(--color-border-default)' }}
        >
          <div style={{ color: 'var(--color-fg-muted)' }}>Selected:</div>
          <div className="font-medium truncate" style={{ color: 'var(--color-accent-primary)' }}>
            {selectedFolder.split(/[/\\]/).pop()}
          </div>
        </div>
      )}

      {/* Folder tree */}
      <div className="flex-1 overflow-y-auto py-1">
        {rootFolders.length === 0 ? (
          <div className="text-center py-4 text-sm" style={{ color: 'var(--color-fg-muted)' }}>
            No folders found
          </div>
        ) : (
          rootFolders.map((folder) => (
            <FolderNode
              key={folder.path}
              item={folder}
              level={0}
              selectedPath={selectedFolder}
              onSelect={onSelectFolder}
            />
          ))
        )}
      </div>
    </div>
  );
}

export default FolderTree;
