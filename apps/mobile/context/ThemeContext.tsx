import React, { createContext, useContext, useState, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { themes, ThemeMode, themeColours } from '../constants/theme';
import type { ColourSet } from '../constants/colourScheme';
import { createTypography, TextSizeSet, FontScale, Typography } from '../constants/textSize';
export type { ColourSet } from '../constants/colourScheme';


type ThemeContextType = {
  theme: typeof themes.light & Typography;
  colours: ColourSet;
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  fontScale: FontScale;
  setFontScale: (scale : FontScale) => void;
  isDark: boolean;
  isHC: boolean;
};

/**
 * createContext creates a context object, passing in default values
 * 
 * Information, variables etc. can be globally accessed.
 * 
 * Components can access this using useContext.
 * 
 */
const ThemeContext = createContext<ThemeContextType>({
  theme: {...themes.light,...createTypography(1)},
  colours: themeColours.light,
  mode: 'light' as ThemeMode,
  setMode: (mode: ThemeMode) => {},
  fontScale: 1,
  setFontScale: (scale : FontScale) => {},
  isDark: false,
  isHC: false,
});


export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const systemScheme = useColorScheme(); // phones current settings

  /**
   * Checks the phones settings using react hook useColourScheme
   * If the phone is already on dark mode, the app will start in dark mode,
   * If not, the app starts in light mode.
   * 
   * This is checked once, after this, components check useTheme()
   */
  const [mode, setMode] = useState<ThemeMode>(systemScheme === 'dark' ? 'dark' : 'light');
  const [fontScale, setFontScale] = useState<FontScale>(1) // creates fontScale starting at 1x

  /**
   * Building the context value. UseMemo only re renders when an object in the dependancy array
   * changes.
   */
  const value = useMemo<ThemeContextType>(
          () => ({
              theme: {...themes[mode],...createTypography(fontScale)},
              colours: themeColours[mode],
              mode,
              setMode,
              fontScale,
              setFontScale,
              isDark: mode === 'dark' || mode === 'darkHC',
              isHC: mode === 'darkHC' || mode === 'lightHC',
          }),
          [mode, fontScale] // object is rebuilt when one of these changes
      );

  return (
    // <ThemeContext.Provider> provides values to anything nested inside
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
