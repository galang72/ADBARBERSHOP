import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const Badge = React.forwardRef(({ className, variant = 'default', ...props }, ref) => {
  const variants = {
    // Merah dari logo
    default: 'bg-primary-100 text-primary-800 border-primary-200',
    primary: 'bg-primary-800 text-white border-primary-900',
    // Gold dari logo
    secondary: 'bg-secondary-100 text-secondary-800 border-secondary-200',
    gold: 'bg-secondary-600 text-white border-secondary-700',
    // Status colors
    success: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    warning: 'bg-amber-100 text-amber-800 border-amber-200',
    danger: 'bg-red-100 text-red-800 border-red-200',
    info: 'bg-accent-100 text-accent-800 border-accent-200',
    // Outline variants
    outline: 'text-accent-800 border-accent-300 bg-white',
    'outline-primary': 'text-primary-800 border-primary-300 bg-white',
    'outline-gold': 'text-secondary-700 border-secondary-300 bg-white',
  };

  return (
    <div
      ref={ref}
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold',
        variants[variant],
        className
      )}
      {...props}
    />
  );
});
Badge.displayName = 'Badge';

export default Badge;
