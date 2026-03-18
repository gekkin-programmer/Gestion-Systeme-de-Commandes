'use client';
import { useEffect } from 'react';
import { useTheme } from '@/hooks/useTheme';

interface ThemeProviderProps {
  children: React.ReactNode;
  locale?: string;
}

export function ThemeProvider({ children, locale }: ThemeProviderProps) {
  const vars = useTheme();

  useEffect(() => {
    const root = document.documentElement;
    // Apply theme CSS vars
    Object.entries(vars).forEach(([key, value]) => {
      root.style.setProperty(key, value as string);
    });
    // Restore lang attribute (moved out of [locale]/layout.tsx)
    if (locale) root.setAttribute('lang', locale);
  }, [vars, locale]);

  return <>{children}</>;
}
