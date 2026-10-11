import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';

export type ThemeMode = 'warmLight' | 'darkSlate' | 'system';

export interface ThemeColors {
  mode: ThemeMode;
  isDark: boolean;
  background: string;
  surface: string;
  card: string;
  border: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  accent: string;
  accentBg: string;
  accentBorder: string;
  success: string;
  successBg: string;
  warning: string;
  warningBg: string;
  danger: string;
  dangerBg: string;
}

export const WarmLightColors: ThemeColors = {
  mode: 'warmLight',
  isDark: false,
  background: '#FBFBF9', // Warm Paper canvas
  surface: '#FFFFFF',
  card: '#FFFFFF',
  border: '#E7E5E4',
  text: '#1C1917',
  textSecondary: '#44403C',
  textMuted: '#78716C',
  accent: '#4F46E5',
  accentBg: '#EEF2FF',
  accentBorder: '#C7D2FE',
  success: '#059669',
  successBg: '#ECFDF5',
  warning: '#D97706',
  warningBg: '#FFFBEB',
  danger: '#DC2626',
  dangerBg: '#FEF2F2',
};

export const DarkSlateColors: ThemeColors = {
  mode: 'darkSlate',
  isDark: true,
  background: '#0F172A',
  surface: '#1E293B',
  card: '#1E293B',
  border: '#334155',
  text: '#F8FAFC',
  textSecondary: '#CBD5E1',
  textMuted: '#94A3B8',
  accent: '#6366F1',
  accentBg: '#312E81',
  accentBorder: '#4338CA',
  success: '#10B981',
  successBg: '#064E3B',
  warning: '#F59E0B',
  warningBg: '#78350F',
  danger: '#EF4444',
  dangerBg: '#7F1D1D',
};

interface ThemeContextType {
  mode: ThemeMode;
  colors: ThemeColors;
  setMode: (mode: ThemeMode) => void;
}

const THEME_STORAGE_KEY = '@ders_pompa_mobile_theme';

const ThemeContext = createContext<ThemeContextType>({
  mode: 'warmLight',
  colors: WarmLightColors,
  setMode: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemScheme = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>('warmLight');

  useEffect(() => {
    AsyncStorage.getItem(THEME_STORAGE_KEY).then((stored) => {
      if (stored === 'warmLight' || stored === 'darkSlate' || stored === 'system') {
        setModeState(stored as ThemeMode);
      }
    });
  }, []);

  const setMode = (newMode: ThemeMode) => {
    setModeState(newMode);
    AsyncStorage.setItem(THEME_STORAGE_KEY, newMode).catch(() => {});
  };

  const activeColors =
    mode === 'system'
      ? systemScheme === 'dark'
        ? DarkSlateColors
        : WarmLightColors
      : mode === 'darkSlate'
      ? DarkSlateColors
      : WarmLightColors;

  return (
    <ThemeContext.Provider value={{ mode, colors: activeColors, setMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
