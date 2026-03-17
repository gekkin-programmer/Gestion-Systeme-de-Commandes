'use client';
import { useEffect } from 'react';
import { useTheme } from '@/hooks/useTheme';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const vars = useTheme();

  useEffect(() => {
    const root = document.documentElement;
    Object.entries(vars).forEach(([key, value]) => {
      root.style.setProperty(key, value as string);
    });
  }, [vars]);

  return <>{children}</>;
}
