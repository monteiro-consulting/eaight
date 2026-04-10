import { useEffect, useCallback } from 'react';
import { useTabs, useNavigation, useWindowControls } from './useIPC';
import { useBrowserStore } from '../store';

export function useKeyboardShortcuts() {
  const { createTab, closeTab, switchTab } = useTabs();
  const { goBack, goForward, reload } = useNavigation();
  const { close } = useWindowControls();

  const tabs = useBrowserStore((state) => state.tabs);
  const activeTabId = useBrowserStore((state) => state.activeTabId);
  const setSettingsOpen = useBrowserStore((state) => state.setSettingsOpen);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      const { ctrlKey, shiftKey, altKey, key } = event;

      // Ctrl+T - New Tab
      if (ctrlKey && !shiftKey && key.toLowerCase() === 't') {
        event.preventDefault();
        createTab();
        return;
      }

      // Ctrl+W - Close Tab
      if (ctrlKey && !shiftKey && key.toLowerCase() === 'w') {
        event.preventDefault();
        if (activeTabId) {
          closeTab(activeTabId);
        }
        return;
      }

      // Ctrl+Tab - Next Tab
      if (ctrlKey && !shiftKey && key === 'Tab') {
        event.preventDefault();
        if (tabs.length > 1 && activeTabId) {
          const currentIndex = tabs.findIndex((t) => t.id === activeTabId);
          const nextIndex = (currentIndex + 1) % tabs.length;
          switchTab(tabs[nextIndex].id);
        }
        return;
      }

      // Ctrl+Shift+Tab - Previous Tab
      if (ctrlKey && shiftKey && key === 'Tab') {
        event.preventDefault();
        if (tabs.length > 1 && activeTabId) {
          const currentIndex = tabs.findIndex((t) => t.id === activeTabId);
          const prevIndex = (currentIndex - 1 + tabs.length) % tabs.length;
          switchTab(tabs[prevIndex].id);
        }
        return;
      }

      // Ctrl+L or F6 - Focus URL Bar
      if ((ctrlKey && key.toLowerCase() === 'l') || key === 'F6') {
        event.preventDefault();
        const urlInput = document.querySelector('input[type="text"]') as HTMLInputElement;
        if (urlInput) {
          urlInput.focus();
          urlInput.select();
        }
        return;
      }

      // F5 or Ctrl+R - Reload
      if (key === 'F5' || (ctrlKey && key.toLowerCase() === 'r')) {
        event.preventDefault();
        reload();
        return;
      }

      // Alt+Left - Back
      if (altKey && key === 'ArrowLeft') {
        event.preventDefault();
        goBack();
        return;
      }

      // Alt+Right - Forward
      if (altKey && key === 'ArrowRight') {
        event.preventDefault();
        goForward();
        return;
      }

      // F12 - DevTools
      if (key === 'F12') {
        event.preventDefault();
        window.electronAPI.toggleDevTools();
        return;
      }

      // Alt+F4 - Close Window
      if (altKey && key === 'F4') {
        event.preventDefault();
        close();
        return;
      }

      // Ctrl+Shift+A - Toggle AI Panel
      if (ctrlKey && shiftKey && key.toLowerCase() === 'a') {
        event.preventDefault();
        window.electronAPI?.toggleAIPanel();
        return;
      }

      // F10 or Alt+M - Open Menu
      if (key === 'F10' || (altKey && key.toLowerCase() === 'm')) {
        event.preventDefault();
        // Get position of menu button area (top right)
        window.electronAPI?.showAppMenu({ x: window.innerWidth - 220, y: 36 });
        return;
      }

      // Ctrl+, - Open Settings
      if (ctrlKey && key === ',') {
        event.preventDefault();
        setSettingsOpen(true);
        return;
      }

      // Ctrl+1-8 - Switch to Tab by Index
      if (ctrlKey && !shiftKey && key >= '1' && key <= '8') {
        event.preventDefault();
        const index = parseInt(key) - 1;
        if (index < tabs.length) {
          switchTab(tabs[index].id);
        }
        return;
      }

      // Ctrl+9 - Switch to Last Tab
      if (ctrlKey && !shiftKey && key === '9') {
        event.preventDefault();
        if (tabs.length > 0) {
          switchTab(tabs[tabs.length - 1].id);
        }
        return;
      }

      // Ctrl+Shift+T - Reopen Closed Tab (TODO: implement tab history)
      if (ctrlKey && shiftKey && key.toLowerCase() === 't') {
        event.preventDefault();
        // TODO: Implement tab history to reopen closed tabs
        console.log('Reopen closed tab - not yet implemented');
        return;
      }

      // Ctrl+Shift+R - Hard Reload (ignore cache)
      if (ctrlKey && shiftKey && key.toLowerCase() === 'r') {
        event.preventDefault();
        reload(); // TODO: Add hard reload support
        return;
      }

      // Ctrl+Shift+W - Close Window
      if (ctrlKey && shiftKey && key.toLowerCase() === 'w') {
        event.preventDefault();
        close();
        return;
      }

      // Ctrl+D - Bookmark Current Page (TODO: implement bookmarks)
      if (ctrlKey && !shiftKey && key.toLowerCase() === 'd') {
        event.preventDefault();
        console.log('Add bookmark - not yet implemented');
        return;
      }

      // Ctrl+Shift+B - Toggle Bookmarks Bar (TODO: implement)
      if (ctrlKey && shiftKey && key.toLowerCase() === 'b') {
        event.preventDefault();
        console.log('Toggle bookmarks bar - not yet implemented');
        return;
      }

      // Ctrl+H - History (TODO: implement)
      if (ctrlKey && key.toLowerCase() === 'h') {
        event.preventDefault();
        console.log('Open history - not yet implemented');
        return;
      }

      // Ctrl+J - Downloads (TODO: implement)
      if (ctrlKey && key.toLowerCase() === 'j') {
        event.preventDefault();
        console.log('Open downloads - not yet implemented');
        return;
      }

      // F11 - Toggle Fullscreen
      if (key === 'F11') {
        event.preventDefault();
        window.electronAPI?.toggleFullscreen();
        return;
      }

      // Ctrl+F - Find in Page (TODO: implement)
      if (ctrlKey && key.toLowerCase() === 'f') {
        event.preventDefault();
        console.log('Find in page - not yet implemented');
        return;
      }

      // Ctrl+P - Print (TODO: implement)
      if (ctrlKey && key.toLowerCase() === 'p') {
        event.preventDefault();
        console.log('Print - not yet implemented');
        return;
      }

      // Ctrl+S - Save Page (TODO: implement)
      if (ctrlKey && key.toLowerCase() === 's') {
        event.preventDefault();
        console.log('Save page - not yet implemented');
        return;
      }

      // Ctrl+U - View Source (TODO: implement)
      if (ctrlKey && key.toLowerCase() === 'u') {
        event.preventDefault();
        console.log('View source - not yet implemented');
        return;
      }

      // Ctrl++ / Ctrl+= - Zoom In (TODO: implement)
      if (ctrlKey && (key === '+' || key === '=')) {
        event.preventDefault();
        console.log('Zoom in - not yet implemented');
        return;
      }

      // Ctrl+- - Zoom Out (TODO: implement)
      if (ctrlKey && key === '-') {
        event.preventDefault();
        console.log('Zoom out - not yet implemented');
        return;
      }

      // Ctrl+0 - Reset Zoom (TODO: implement)
      if (ctrlKey && key === '0') {
        event.preventDefault();
        console.log('Reset zoom - not yet implemented');
        return;
      }

      // Escape - Stop Loading
      if (key === 'Escape') {
        event.preventDefault();
        window.electronAPI?.stop?.();
        return;
      }

      // Backspace - Go Back (when not in input)
      if (key === 'Backspace' && !(event.target as HTMLElement).matches('input, textarea')) {
        event.preventDefault();
        goBack();
        return;
      }
    },
    [tabs, activeTabId, createTab, closeTab, switchTab, goBack, goForward, reload, close, setSettingsOpen]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}

export default useKeyboardShortcuts;
