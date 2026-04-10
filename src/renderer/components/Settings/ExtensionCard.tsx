// Extension Card Component

import React from 'react';
import { ExtensionInfo } from '../../../shared/types/extension';

interface ExtensionCardProps {
  extension: ExtensionInfo;
  onToggle: (id: string, enabled: boolean) => void;
  onUninstall: (id: string) => void;
}

export function ExtensionCard({ extension, onToggle, onUninstall }: ExtensionCardProps) {
  // Get the best available icon
  const iconUrl = extension.icons?.sort((a, b) => b.size - a.size)[0]?.url;

  return (
    <div className="bg-[var(--color-bg-tertiary)] rounded-lg p-4 flex items-start gap-4">
      {/* Extension Icon */}
      <div className="w-12 h-12 rounded-lg bg-[var(--color-bg-secondary)] flex items-center justify-center flex-shrink-0 overflow-hidden">
        {iconUrl ? (
          <img src={iconUrl} alt={extension.name} className="w-10 h-10 object-contain" />
        ) : (
          <svg className="w-6 h-6 text-[var(--color-fg-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
          </svg>
        )}
      </div>

      {/* Extension Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="text-[var(--color-fg-primary)] font-medium truncate">{extension.name}</h3>
          <span className="text-xs text-[var(--color-fg-muted)]">v{extension.version}</span>
        </div>
        <p className="text-sm text-[var(--color-fg-muted)] mt-1 line-clamp-2">
          {extension.description || 'No description available'}
        </p>
        {extension.permissions && extension.permissions.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {extension.permissions.slice(0, 3).map((perm) => (
              <span
                key={perm}
                className="text-xs px-2 py-0.5 rounded bg-[var(--color-bg-secondary)] text-[var(--color-fg-muted)]"
              >
                {perm}
              </span>
            ))}
            {extension.permissions.length > 3 && (
              <span className="text-xs px-2 py-0.5 rounded bg-[var(--color-bg-secondary)] text-[var(--color-fg-muted)]">
                +{extension.permissions.length - 3} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 flex-shrink-0">
        {/* Toggle Switch */}
        <button
          onClick={() => onToggle(extension.id, !extension.enabled)}
          className={`relative w-11 h-6 rounded-full transition-colors ${
            extension.enabled
              ? 'bg-[var(--color-accent-primary)]'
              : 'bg-[var(--color-bg-secondary)]'
          }`}
        >
          <span
            className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
              extension.enabled ? 'left-6' : 'left-1'
            }`}
          />
        </button>

        {/* Uninstall Button */}
        <button
          onClick={() => onUninstall(extension.id)}
          className="p-2 rounded-lg hover:bg-[var(--color-bg-secondary)] text-[var(--color-fg-muted)] hover:text-[var(--color-accent-error)]"
          title="Uninstall extension"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default ExtensionCard;
