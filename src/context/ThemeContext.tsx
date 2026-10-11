'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { ThemeProvider as NextThemesProvider, useTheme as useNextTheme } from 'next-themes';
import type { ThemeMode, AccentColor } from '@/types/database.types';

export interface ThemeContextType {
  mode: ThemeMode;
  accent: AccentColor;
  resolvedMode: 'light' | 'dark';
  setMode: (mode: ThemeMode) => void;
  setAccent: (accent: AccentColor) => void;
  accentClasses: {
    name: string;
    label: string;
    colorHex: string;
    bg: string;
    bgHover: string;
    text: string;
    textLight: string;
    border: string;
    shadow: string;
    ring: string;
    badgeBg: string;
    badgeText: string;
    gradient: string;
  };
}

export const ACCENT_PALETTES: Record<string, ThemeContextType['accentClasses']> = {
  system: {
    name: 'system',
    label: 'Sistem / Otomatik (Auto)',
    colorHex: '#2563eb',
    bg: 'bg-blue-600',
    bgHover: 'hover:bg-blue-500',
    text: 'text-blue-500 dark:text-blue-400',
    textLight: 'text-blue-400 dark:text-blue-300',
    border: 'border-blue-500/30',
    shadow: 'shadow-blue-500/20',
    ring: 'focus:ring-blue-500',
    badgeBg: 'bg-blue-500/10 dark:bg-blue-500/20',
    badgeText: 'text-blue-600 dark:text-blue-300',
    gradient: 'from-blue-600 to-indigo-600',
  },
  sapphire: {
    name: 'sapphire',
    label: 'Safir Mavi (Sapphire)',
    colorHex: '#2563eb',
    bg: 'bg-blue-600',
    bgHover: 'hover:bg-blue-500',
    text: 'text-blue-500 dark:text-blue-400',
    textLight: 'text-blue-400 dark:text-blue-300',
    border: 'border-blue-500/30',
    shadow: 'shadow-blue-500/20',
    ring: 'focus:ring-blue-500',
    badgeBg: 'bg-blue-500/10 dark:bg-blue-500/20',
    badgeText: 'text-blue-600 dark:text-blue-300',
    gradient: 'from-blue-600 to-indigo-600',
  },
  blue: {
    name: 'blue',
    label: 'Safir Mavi (Sapphire)',
    colorHex: '#2563eb',
    bg: 'bg-blue-600',
    bgHover: 'hover:bg-blue-500',
    text: 'text-blue-500 dark:text-blue-400',
    textLight: 'text-blue-400 dark:text-blue-300',
    border: 'border-blue-500/30',
    shadow: 'shadow-blue-500/20',
    ring: 'focus:ring-blue-500',
    badgeBg: 'bg-blue-500/10 dark:bg-blue-500/20',
    badgeText: 'text-blue-600 dark:text-blue-300',
    gradient: 'from-blue-600 to-indigo-600',
  },
  emerald: {
    name: 'emerald',
    label: 'Zümrüt Yeşili (Emerald)',
    colorHex: '#10b981',
    bg: 'bg-emerald-600',
    bgHover: 'hover:bg-emerald-500',
    text: 'text-emerald-600 dark:text-emerald-400',
    textLight: 'text-emerald-500 dark:text-emerald-300',
    border: 'border-emerald-500/30',
    shadow: 'shadow-emerald-500/20',
    ring: 'focus:ring-emerald-500',
    badgeBg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
    badgeText: 'text-emerald-600 dark:text-emerald-300',
    gradient: 'from-emerald-600 to-teal-600',
  },
  lavender: {
    name: 'lavender',
    label: 'Pastel Lavanta (Lavender)',
    colorHex: '#8b5cf6',
    bg: 'bg-violet-600',
    bgHover: 'hover:bg-violet-500',
    text: 'text-violet-600 dark:text-violet-400',
    textLight: 'text-violet-500 dark:text-violet-300',
    border: 'border-violet-500/30',
    shadow: 'shadow-violet-500/20',
    ring: 'focus:ring-violet-500',
    badgeBg: 'bg-violet-500/10 dark:bg-violet-500/20',
    badgeText: 'text-violet-600 dark:text-violet-300',
    gradient: 'from-violet-600 to-purple-600',
  },
  violet: {
    name: 'violet',
    label: 'Pastel Lavanta (Lavender)',
    colorHex: '#8b5cf6',
    bg: 'bg-violet-600',
    bgHover: 'hover:bg-violet-500',
    text: 'text-violet-600 dark:text-violet-400',
    textLight: 'text-violet-500 dark:text-violet-300',
    border: 'border-violet-500/30',
    shadow: 'shadow-violet-500/20',
    ring: 'focus:ring-violet-500',
    badgeBg: 'bg-violet-500/10 dark:bg-violet-500/20',
    badgeText: 'text-violet-600 dark:text-violet-300',
    gradient: 'from-violet-600 to-purple-600',
  },
  amber: {
    name: 'amber',
    label: 'Sıcak Amber (Amber)',
    colorHex: '#f59e0b',
    bg: 'bg-amber-600',
    bgHover: 'hover:bg-amber-500',
    text: 'text-amber-600 dark:text-amber-400',
    textLight: 'text-amber-500 dark:text-amber-300',
    border: 'border-amber-500/30',
    shadow: 'shadow-amber-500/20',
    ring: 'focus:ring-amber-500',
    badgeBg: 'bg-amber-500/10 dark:bg-amber-500/20',
    badgeText: 'text-amber-600 dark:text-amber-300',
    gradient: 'from-amber-600 to-orange-600',
  },
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function ThemeInnerProvider({ children }: { children: React.ReactNode }) {
  const { theme, setTheme, resolvedTheme } = useNextTheme();
  const [accent, setAccentState] = useState<AccentColor>('system');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedAccent =
      (localStorage.getItem('dersly_theme_accent') as AccentColor) ||
      (localStorage.getItem('derspompa_theme_accent') as AccentColor) ||
      'system';
    setAccentState(savedAccent);
    document.documentElement.setAttribute('data-accent', savedAccent);
  }, []);

  const handleSetMode = (newMode: ThemeMode) => {
    setTheme(newMode);
    localStorage.setItem('dersly_theme_mode', newMode);
    localStorage.setItem('derspompa_theme_mode', newMode);
  };

  const handleSetAccent = (newAccent: AccentColor) => {
    setAccentState(newAccent);
    localStorage.setItem('dersly_theme_accent', newAccent);
    localStorage.setItem('derspompa_theme_accent', newAccent);
    document.documentElement.setAttribute('data-accent', newAccent);
  };

  const activeMode = (theme as ThemeMode) || 'system';
  const currentResolved = (resolvedTheme as 'light' | 'dark') || 'dark';

  return (
    <ThemeContext.Provider
      value={{
        mode: activeMode,
        accent,
        resolvedMode: currentResolved,
        setMode: handleSetMode,
        setAccent: handleSetAccent,
        accentClasses: ACCENT_PALETTES[accent] || ACCENT_PALETTES.system,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem={true}
      disableTransitionOnChange={false}
    >
      <ThemeInnerProvider>{children}</ThemeInnerProvider>
    </NextThemesProvider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
