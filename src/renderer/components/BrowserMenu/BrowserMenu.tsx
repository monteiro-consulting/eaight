import React, { useRef, useEffect } from 'react';
import { Tooltip } from '../common';
import { useBrowserStore } from '../../store';

export function BrowserMenu() {
  const buttonRef = useRef<HTMLDivElement>(null);
  const setSettingsOpen = useBrowserStore((s) => s.setSettingsOpen);

  // Listen for settings open from native menu
  useEffect(() => {
    const unsubscribe = window.electronAPI?.onOpenSettings(() => {
      setSettingsOpen(true);
    });
    return () => unsubscribe?.();
  }, [setSettingsOpen]);

  const handleClick = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      // Show native menu at button position
      window.electronAPI?.showAppMenu({
        x: Math.round(rect.right - 200), // Align to right edge of button
        y: Math.round(rect.bottom),
      });
    }
  };

  return (
    <Tooltip content="Menu">
      <div
        ref={buttonRef}
        onClick={handleClick}
        className="inline-flex items-center justify-center w-6 h-6 rounded-md cursor-pointer hover:bg-dark-bg-tertiary text-dark-fg-secondary hover:text-dark-fg-primary transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
          />
        </svg>
      </div>
    </Tooltip>
  );
}

export default BrowserMenu;
