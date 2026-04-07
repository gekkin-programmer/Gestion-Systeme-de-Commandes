'use client';
import type React from 'react';
import { useHotelStore } from '@/store/hotelStore';
import type { ThemePreset, ThemeConfig } from '@repo/shared';

export const THEMES: Record<ThemePreset, ThemeConfig> = {
  DARK_GOLD: {
    bg:      '#100C07',
    surface: '#1C1510',
    gold:    '#C8A96E',
    cream:   '#F0E6D3',
    dim:     '#A89880',
    line:    'rgba(240,230,211,0.1)',
  },
  WHITE_PURPLE: {
    bg:      '#FFFFFF',
    surface: '#F3F0F8',
    gold:    '#7C3AED',
    cream:   '#1F1035',
    dim:     '#6B5F7A',
    line:    'rgba(31,16,53,0.1)',
  },
  WHITE_RED: {
    bg:      '#FFFFFF',
    surface: '#FEF2F2',
    gold:    '#DC2626',
    cream:   '#1C0A0A',
    dim:     '#7A4545',
    line:    'rgba(28,10,10,0.1)',
  },
};

export function useTheme(): React.CSSProperties {
  const preset = useHotelStore((s) => s.themePreset);
  const t = THEMES[preset ?? 'DARK_GOLD'];
  return {
    '--gold':      t.gold,
    '--bg':        t.bg,
    '--surface':   t.surface,
    '--cream':     t.cream,
    '--cream-dim': t.dim,
    '--line':      t.line,
  } as React.CSSProperties;
}
