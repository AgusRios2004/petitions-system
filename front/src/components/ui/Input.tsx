'use client';

import React from 'react';

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  invalid?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
};

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className = '', invalid = false, leftIcon, rightIcon, ...props }, ref) => {
  const base = 'w-full rounded-lg transition duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-900';
  const surface = 'bg-white/70 dark:bg-gray-900/60 backdrop-blur border';
  const border = invalid
    ? 'border-red-400 focus:ring-red-500'
    : 'border-gray-300 dark:border-gray-700 focus:ring-blue-500';

  if (leftIcon || rightIcon) {
    return (
      <div className={`relative ${className}`}>
        {leftIcon && (
          <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
            {leftIcon}
          </span>
        )}
        <input
          className={`${base} ${surface} ${border} ${leftIcon ? 'pl-10' : 'pl-4'} ${rightIcon ? 'pr-10' : 'pr-4'} py-2`}
          ref={ref}
          {...props}
        />
        {rightIcon && (
          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400">
            {rightIcon}
          </span>
        )}
      </div>
    );
  }

  return (
    <input
      className={`${base} ${surface} ${border} px-4 py-2 ${className}`}
      ref={ref}
      {...props}
    />
  );
});

Input.displayName = 'Input';
