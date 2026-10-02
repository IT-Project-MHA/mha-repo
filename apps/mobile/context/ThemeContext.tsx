import React, { createContext, useContext, useState, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { themes, ThemeMode, themeColours } from '../constants/theme';
import type { ColourSet } from '../constants/colourScheme';
export type { ColourSet } from '../constants/colourScheme';

type ThemeContextType = {
  theme: typeof themes.light;
  colours: ColourSet;
  mode: ThemeMode,
  setMode: (mode: ThemeMode) => void;
  isDark: boolean;
  isHC: boolean;
};

/**
 * createContext creates a native context object, so information, variables
 * etc. can be global throughout the app.
 * 
 * Components can access this using useContext.
 * 
 */
const ThemeContext = createContext<ThemeContextType>({
  theme: themes.light,
  colours: themeColours.light,
  mode: 'light' as ThemeMode,
  setMode: (mode: ThemeMode) => {},
  isDark: false,
  isHC: false,
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const systemScheme = useColorScheme(); 

  /**
   * Checks the phones settings using react hook useColourScheme
   * If the phone is already on dark mode, the app will start in dark mode,
   * If not, the app starts in light mode.
   * 
   * High contrast mode is app specific, and needs to be turned on manually.
   * 
   * This is checked once, after this, components check useTheme()
   */
  const [mode, setMode] = useState<ThemeMode>(systemScheme === 'dark' ? 'dark' : 'light');

  const value = useMemo<ThemeContextType>(
          () => ({
              theme: themes[mode],
              colours: themeColours[mode],
              mode,
              setMode,
              isDark: mode === 'dark' || mode === 'darkHC',
              isHC: mode === 'darkHC' || mode === 'lightHC',
          }),
          [mode]
      );

  return (
    // <ThemeContext.Provider> provides values to anything nested inside
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
