import React from 'react';

interface ActionLogEntry {
  id: string;
  timestamp: number;
  type: 'tool' | 'resource' | 'event';
  name: string;
  status: 'pending' | 'success' | 'error';
  details?: string;
}

interface ActionLogProps {
  entries: ActionLogEntry[];
}

export function ActionLog({ entries }: ActionLogProps) {
  if (entries.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="text-center text-dark-fg-muted">
          <svg
            className="w-12 h-12 mx-auto mb-2 opacity-50"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
          <p className="text-sm">No AI actions yet</p>
          <p className="text-xs mt-1">
            Connect with Claude Code, Codex CLI, or Gemini CLI to get started
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {entries.map((entry) => (
        <div
          key={entry.id}
          className="flex items-start gap-2 px-3 py-2 border-b border-dark-bg-tertiary/50 hover:bg-dark-bg-tertiary/30"
        >
          {/* Status indicator */}
          <div className="mt-1">
            {entry.status === 'pending' && (
              <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            )}
            {entry.status === 'success' && (
              <svg className="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
            {entry.status === 'error' && (
              <svg className="w-3 h-3 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span
                className={`text-xs px-1.5 py-0.5 rounded ${
                  entry.type === 'tool'
                    ? 'bg-primary/20 text-primary'
                    : entry.type === 'resource'
                    ? 'bg-secondary/20 text-secondary'
                    : 'bg-accent/20 text-accent'
                }`}
              >
                {entry.type}
              </span>
              <span className="text-sm font-medium truncate">{entry.name}</span>
            </div>
            {entry.details && (
              <p className="text-xs text-dark-fg-muted mt-0.5 truncate">
                {entry.details}
              </p>
            )}
          </div>

          {/* Timestamp */}
          <div className="text-xs text-dark-fg-muted">
            {new Date(entry.timestamp).toLocaleTimeString()}
          </div>
        </div>
      ))}
    </div>
  );
}

export default ActionLog;
