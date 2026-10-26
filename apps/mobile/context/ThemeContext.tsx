import React, { createContext, useContext, useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { useColorScheme, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { themes, ThemeMode, themeColours } from '../constants/theme';
import type { ColourSet } from '../constants/colourScheme';
import { createTypography, FontScale, Typography } from '../constants/textSize';
import { apiMySettings, apiSaveSettings, apiErrorMessage } from '@/api/settings_api_helpers';
export type { ColourSet } from '../constants/colourScheme';

type ThemeContextType = {
  theme: typeof themes.light & Typography;
  colours: ColourSet;
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void; // device only (e.g. dark mode)
  fontScale: FontScale;
  setFontScale: (scale: FontScale) => void; // applied now, saved to the server
  setHighContrast: (on: boolean) => void; // applied now, saved to the server
  reloadSettings: () => Promise<void>; // call after login
  isDark: boolean;
  isHC: boolean;
};

const ThemeContext = createContext<ThemeContextType>({
  theme: { ...themes.light, ...createTypography(1) },
  colours: themeColours.light,
  mode: 'light' as ThemeMode,
  setMode: () => {},
  fontScale: 1,
  setFontScale: () => {},
  setHighContrast: () => {},
  reloadSettings: async () => {},
  isDark: false,
  isHC: false,
});

const FONT_SCALES: FontScale[] = [1, 1.5, 2];
// nearest allowed scale to a saved text_size_percent
const snapScale = (percent: number): FontScale =>
  FONT_SCALES.reduce((best, s) =>
    Math.abs(s * 100 - percent) < Math.abs(best * 100 - percent) ? s : best);
const isDarkMode = (m: ThemeMode) => m === 'dark' || m === 'darkHC';
const modeFor = (dark: boolean, hc: boolean): ThemeMode =>
  dark ? (hc ? 'darkHC' : 'dark') : (hc ? 'lightHC' : 'light');

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const systemScheme = useColorScheme();
  const [mode, setMode] = useState<ThemeMode>(systemScheme === 'dark' ? 'dark' : 'light');
  const [fontScale, setFontScaleState] = useState<FontScale>(1);
  const bottomInset = useSafeAreaInsets().bottom;

  const fontScaleRef = useRef<FontScale>(1);
  fontScaleRef.current = fontScale;
  const settingsId = useRef<string | null>(null);
  // saves run one after another so two quick changes can't create two records
  const saveQueue = useRef<Promise<unknown>>(Promise.resolve());

  const save = useCallback((changes: { high_contrast?: boolean; text_size_percent?: number }) => {
    const run = saveQueue.current.then(async () => {
      const saved = await apiSaveSettings(settingsId.current, changes);
      settingsId.current = saved.id;
    });
    saveQueue.current = run.catch(() => {});
    return run;
  }, []);

  /** loads the saved settings from the server and applies them */
  const reloadSettings = useCallback(async () => {
    try {
      const settings = await apiMySettings();
      if (!settings) return;
      settingsId.current = settings.id;
      setMode((m) => modeFor(isDarkMode(m), Boolean(settings.high_contrast)));
      setFontScaleState(snapScale(settings.text_size_percent));
    } catch {
      // not logged in yet, or offline: keep the defaults
    }
  }, []);

  useEffect(() => { reloadSettings(); }, [reloadSettings]);

  const setHighContrast = useCallback(async (on: boolean) => {
    setMode((m) => modeFor(isDarkMode(m), on));
    try {
      await save({ high_contrast: on });
    } catch (error) {
      setMode((m) => modeFor(isDarkMode(m), !on)); // revert
      Alert.alert('Could not save high contrast', apiErrorMessage(error));
    }
  }, [save]);

  const setFontScale = useCallback(async (scale: FontScale) => {
    const previous = fontScaleRef.current;
    setFontScaleState(scale);
    try {
      await save({ text_size_percent: scale * 100 });
    } catch (error) {
      setFontScaleState(previous); // revert
      Alert.alert('Could not save text size', apiErrorMessage(error));
    }
  }, [save]);

  const value = useMemo<ThemeContextType>(
    () => ({
      theme: {
        ...themes[mode],
        ...createTypography(fontScale),
        bottomGap: { ...themes[mode].bottomGap, height: themes[mode].bottomGap.height + bottomInset },
      },
      colours: themeColours[mode],
      mode,
      setMode,
      fontScale,
      setFontScale,
      setHighContrast,
      reloadSettings,
      isDark: isDarkMode(mode),
      isHC: mode === 'darkHC' || mode === 'lightHC',
    }),
    [mode, fontScale, bottomInset, setFontScale, setHighContrast, reloadSettings]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => useContext(ThemeContext);
