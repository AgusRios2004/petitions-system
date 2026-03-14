'use client';

import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive';
type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-blue-500 text-white shadow-lg hover:bg-blue-600 active:bg-blue-700 focus:ring-blue-500 transform transition-transform duration-200 hover:-translate-y-0.5',
  secondary:
    'bg-white text-gray-900 border border-gray-300 hover:bg-gray-50 active:bg-gray-100 dark:bg-gray-900 dark:text-gray-100 dark:border-gray-700 dark:hover:bg-gray-800 focus:ring-gray-400',
  ghost:
    'bg-transparent text-blue-600 hover:bg-blue-50 active:bg-blue-100 dark:text-blue-400 dark:hover:bg-blue-950/40 focus:ring-blue-400',
  destructive:
    'bg-red-500 text-white shadow-lg hover:bg-red-600 active:bg-red-700 focus:ring-red-500 transform transition-transform duration-200 hover:-translate-y-0.5',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm rounded-md',
  md: 'px-4 py-2 text-sm rounded-lg',
  lg: 'px-5 py-3 text-base rounded-xl',
  icon: 'h-10 w-10 flex items-center justify-center rounded-full',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className = '', children, variant = 'primary', size = 'md', fullWidth = true, ...props },
    ref
  ) => {
    return (
      <button
        className={`${fullWidth ? 'flex w-full' : 'inline-flex'} items-center justify-center cursor-pointer transition duration-200 font-semibold shadow-sm disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-900 ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
        ref={ref}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
