import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const Input = React.forwardRef(({
  label,
  error,
  className,
  ...props
}, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-semibold text-accent-700 mb-1.5">
          {label}
        </label>
      )}
      <input
        ref={ref}
        className={cn(
          'block w-full rounded-xl border-secondary-200 bg-cream-50',
          'focus:border-primary-800 focus:ring-2 focus:ring-primary-800/20',
          'transition-all duration-200',
          'placeholder:text-accent-400',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
          className
        )}
        {...props}
      />
      {error && (
        <p className="mt-1.5 text-sm text-red-600 font-medium">{error}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
