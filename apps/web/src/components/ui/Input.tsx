import { cn } from '@/lib/utils';
import type { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className, id, ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <input
        id={id}
        {...props}
        className={cn(
          'w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition-all placeholder:text-gray-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20',
          error && 'border-red-400 focus:border-red-400 focus:ring-red-400/20',
          className,
        )}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
