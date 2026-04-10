import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export function Input({ className = '', error = false, ...props }: InputProps) {
  const baseStyles = 'w-full px-3 py-2 rounded-md bg-dark-bg-tertiary text-dark-fg-primary border transition-colors focus:outline-none';
  const borderStyles = error
    ? 'border-red-500 focus:border-red-500'
    : 'border-transparent focus:border-primary';

  return (
    <input
      className={`${baseStyles} ${borderStyles} ${className}`}
      {...props}
    />
  );
}

export default Input;
