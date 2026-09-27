import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const Button = React.forwardRef(({
  children,
  variant = 'primary',
  size = 'md',
  className,
  disabled,
  loading,
  ...props
}, ref) => {
  const variants = {
    // Merah utama dari logo
    primary: 'bg-primary-800 text-white hover:bg-primary-900 focus:ring-primary-700 shadow-md hover:shadow-lg',
    // Emas/Gold dari crown logo
    secondary: 'bg-secondary-600 text-white hover:bg-secondary-700 focus:ring-secondary-500 shadow-md',
    // Outline dengan warna merah
    outline: 'border-2 border-primary-800 text-primary-800 hover:bg-primary-50 focus:ring-primary-700',
    // Outline gold
    'outline-gold': 'border-2 border-secondary-600 text-secondary-700 hover:bg-secondary-50 focus:ring-secondary-500',
    // Ghost
    ghost: 'text-accent-600 hover:bg-accent-50 focus:ring-accent-500',
    // Danger
    danger: 'bg-red-700 text-white hover:bg-red-800 focus:ring-red-600',
    // Success dengan nuansa hijau elegan
    success: 'bg-emerald-700 text-white hover:bg-emerald-800 focus:ring-emerald-600',
    // Gold khusus
    gold: 'bg-secondary-600 text-white hover:bg-secondary-700 focus:ring-secondary-500 shadow-md',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
    icon: 'p-2',
    'icon-sm': 'p-1.5',
  };

  return (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none',
        'active:scale-[0.98]',
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {children}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;
