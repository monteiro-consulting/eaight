// Preload Script - Bridges main and renderer processes

import { contextBridge } from 'electron';
import { electronAPI } from './api';

// Expose the API to the renderer process
contextBridge.exposeInMainWorld('electronAPI', electronAPI);

// Type declaration for renderer
declare global {
  interface Window {
    electronAPI: typeof electronAPI;
  }
}
