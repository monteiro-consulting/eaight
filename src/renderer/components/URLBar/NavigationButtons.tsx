import React from 'react';
import { useBrowserStore } from '../../store';
import { useNavigation } from '../../hooks';
import { Button, Tooltip } from '../common';

export function NavigationButtons() {
  const canGoBack = useBrowserStore((state) => state.canGoBack);
  const canGoForward = useBrowserStore((state) => state.canGoForward);
  const isLoading = useBrowserStore((state) => state.isLoading);
  const { goBack, goForward, reload, stop } = useNavigation();

  return (
    <div className="flex items-center gap-1">
      <Tooltip content="Back (Alt+Left)">
        <Button variant="icon" size="sm" onClick={goBack} disabled={!canGoBack}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Button>
      </Tooltip>

      <Tooltip content="Forward (Alt+Right)">
        <Button variant="icon" size="sm" onClick={goForward} disabled={!canGoForward}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Button>
      </Tooltip>

      {isLoading ? (
        <Tooltip content="Stop (Esc)">
          <Button variant="icon" size="sm" onClick={stop}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Button>
        </Tooltip>
      ) : (
        <Tooltip content="Reload (Ctrl+R)">
          <Button variant="icon" size="sm" onClick={reload}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </Button>
        </Tooltip>
      )}
    </div>
  );
}

export default NavigationButtons;
