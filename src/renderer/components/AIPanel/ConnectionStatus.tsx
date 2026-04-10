import React from 'react';
import { useBrowserStore } from '../../store';

export function ConnectionStatus() {
  const mcpStatus = useBrowserStore((state) => state.mcpStatus);

  return (
    <div className="flex items-center gap-2 px-3 py-2 border-b border-dark-bg-tertiary">
      <div
        className={`w-2 h-2 rounded-full ${
          mcpStatus.isRunning ? 'bg-green-500' : 'bg-red-500'
        }`}
      />
      <div className="flex-1">
        <div className="text-xs text-dark-fg-secondary">
          {mcpStatus.isRunning ? 'MCP Server Active' : 'MCP Server Offline'}
        </div>
        {mcpStatus.isRunning && (
          <div className="text-xs text-dark-fg-muted">
            Port {mcpStatus.port} • {mcpStatus.clientCount} client{mcpStatus.clientCount !== 1 ? 's' : ''}
          </div>
        )}
      </div>
    </div>
  );
}

export default ConnectionStatus;
