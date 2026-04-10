import React from 'react';
import { Button, Tooltip } from '../common';

interface NewTabButtonProps {
  onClick: () => void;
}

export function NewTabButton({ onClick }: NewTabButtonProps) {
  return (
    <Tooltip content="New Tab (Ctrl+T)">
      <Button variant="icon" size="sm" onClick={onClick} className="ml-1">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </Button>
    </Tooltip>
  );
}

export default NewTabButton;
