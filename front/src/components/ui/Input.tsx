'use client';

import React from 'react';
import { cn } from "@/lib/utils";

type InputVariant = 'default' | 'white' | 'transparent';

// 1. Añadir label y error a las props
type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
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
  // ... (otras variantes sin cambios)
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

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({
  className = '',
  label,
  error,
  leftIcon,
  rightIcon,
  variant = 'default',
  id, // Asegurarse de obtener el id
  ...props
}, ref) => {
  // 3. La prop `invalid` se deriva de la existencia de `error`
  const isInvalid = !!error;
  const { base, surface, border } = variantClasses[variant];

  const inputId = id || props.name; // Usar id o name para la asociación

  return (
    // 2. Envolver todo en un div
    <div className={cn("w-full", className)}>
      {/* 4. Añadir Label */}
      <label htmlFor={inputId} className="block text-sm font-medium text-gray-300 mb-1">
        {label}
      </label>
      
      <div className="relative">
        {leftIcon && (
          <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
            {leftIcon}
          </span>
        )}
        <input
          id={inputId}
          className={cn(
            base,
            surface,
            border(isInvalid),
            leftIcon ? 'pl-10' : 'pl-4',
            rightIcon ? 'pr-10' : 'pr-4',
            "py-2"
          )}
          ref={ref}
          {...props}
        />
        {rightIcon && (
          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400">
            {rightIcon}
          </span>
        )}
      </div>

      {/* 2. Añadir el párrafo para el error */}
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
});

Input.displayName = 'Input';
