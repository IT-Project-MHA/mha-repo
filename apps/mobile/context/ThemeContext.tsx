import React, { createContext, useContext, useState } from 'react';
import { useColorScheme } from 'react-native';
import { themes, ThemeMode } from '../constants/theme';

const ThemeContext = createContext({
  theme: themes.light,
  mode: 'light' as ThemeMode,
  setMode: (mode: ThemeMode) => {},
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const systemScheme = useColorScheme(); // 'light' | 'dark' | null — phone's setting
  // checks phone settings - if 'dark' -> stay dark, if light start as light
  const [mode, setMode] = useState<ThemeMode>(systemScheme === 'dark' ? 'dark' : 'light');

  return (
    <ThemeContext.Provider value={{ theme: themes[mode], mode, setMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);