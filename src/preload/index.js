"use strict";
// Preload Script - Bridges main and renderer processes
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const api_1 = require("./api");
// Expose the API to the renderer process
electron_1.contextBridge.exposeInMainWorld('electronAPI', api_1.electronAPI);
//# sourceMappingURL=index.js.map