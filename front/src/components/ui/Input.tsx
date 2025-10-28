'use client';

import React from 'react';
import { cn } from "@/lib/utils";

type InputVariant = 'default' | 'white' | 'transparent';

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  invalid?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  variant?: InputVariant;
};

const variantClasses: Record<InputVariant, {
  base: string;
  surface: string;
  border: (invalid: boolean) => string;
}> = {
  default: {
    base: 'w-full rounded-lg transition duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-900 text-gray-900 dark:text-gray-100',
    surface: 'bg-white/70 dark:bg-gray-900/60 backdrop-blur border',
    border: (invalid) => (invalid ? 'border-red-400 focus:ring-red-500' : 'border-gray-300 dark:border-gray-700 focus:ring-blue-500'),
  },
  white: {
    base: 'w-full rounded-lg transition duration-200 focus:outline-none text-gray-900',
    surface: 'bg-white border',
    border: (invalid) => (invalid ? 'border-red-400' : 'border-gray-300 dark:border-gray-700'),
  },
  transparent: {
    base: 'w-full rounded-lg transition duration-200 focus:outline-none text-gray-900',
    surface: 'bg-transparent',
    border: (invalid) => (invalid ? 'border-red-400' : 'border-transparent'),
  },
};

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className = '', invalid = false, leftIcon, rightIcon, variant = 'default', ...props }, ref) => {
  const { base, surface, border } = variantClasses[variant];

  if (leftIcon || rightIcon) {
    return (
      <div className={cn("relative", className)}>
        {leftIcon && (
          <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
            {leftIcon}
          </span>
        )}
        <input
          className={cn(base, surface, border(invalid), leftIcon ? 'pl-10' : 'pl-4', rightIcon ? 'pr-10' : 'pr-4', "py-2")}
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
      className={cn(base, surface, border(invalid), "px-4 py-2", className)}
      ref={ref}
      {...props}
    />
  );
});

Input.displayName = 'Input';
