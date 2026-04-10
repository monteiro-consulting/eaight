import React from 'react';
import { Tooltip } from '../common';

interface SecurityIndicatorProps {
  url: string;
}

export function SecurityIndicator({ url }: SecurityIndicatorProps) {
  const isSecure = url.startsWith('https://');
  const isLocal = url.startsWith('file://') || url === 'about:blank';

  if (isLocal) {
    return null;
  }

  return (
    <Tooltip content={isSecure ? 'Connection is secure' : 'Connection is not secure'}>
      <div className="flex items-center px-1">
        {isSecure ? (
          <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        ) : (
          <svg className="w-4 h-4 text-dark-fg-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        )}
      </div>
    </Tooltip>
  );
}

export default SecurityIndicator;
