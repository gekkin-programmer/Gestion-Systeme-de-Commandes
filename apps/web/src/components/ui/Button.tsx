import { cn } from '@/lib/utils';
import { LordIcon } from './LordIcon';
import type { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary:   'bg-brand-500 text-white hover:bg-brand-600 active:bg-brand-700',
    secondary: 'bg-white text-brand-600 border border-brand-500 hover:bg-brand-50',
    ghost:     'bg-transparent text-gray-700 hover:bg-gray-100',
    danger:    'bg-red-500 text-white hover:bg-red-600',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2.5 text-base',
    lg: 'px-6 py-3.5 text-lg',
  };

  const spinnerColors =
    variant === 'primary' || variant === 'danger'
      ? 'primary:#ffffff,secondary:#ffffff'
      : 'primary:#f97316,secondary:#1a1a1a';

  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={cn(base, variants[variant], sizes[size], className)}
    >
      {loading && (
        <LordIcon name="loading" trigger="loop" size={18} colors={spinnerColors} />
      )}
      {children}
    </button>
  );
}
