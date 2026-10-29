import { Stack } from "expo-router";
import { Platform } from "react-native";
import { configureFonts, MD3DarkTheme, MD3LightTheme, PaperProvider } from "react-native-paper";
import { enGB, registerTranslation } from "react-native-paper-dates";
import { ThemeProvider, useTheme } from "../../context/ThemeContext";
import { UserProvider } from "../../context/AuthorisationContext";

import {useEffect, useState } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { useAppStore } from "../store/appStore";

import React from "react";

SplashScreen.preventAutoHideAsync();

// date pickers use Australian day/month/year format
registerTranslation("en-GB", enGB);

/**
 * Gives Paper/md3 components the app's current theme colours
 *
 * @param children, the parts of the app that can use Paper components
 * @returns the Paper provider wrapping the children
 */
function PaperThemeProvider({ children }: { children: React.ReactNode }) {
  const { mode, colours } = useTheme();
  const baseTheme = mode.startsWith("dark") ? MD3DarkTheme : MD3LightTheme;

  const paperTheme = {
    ...baseTheme,
    fonts: Platform.OS === "web" ? configureFonts({ config: { fontFamily: "System" } }) : baseTheme.fonts,
    colors: {
      ...baseTheme.colors,
      primary: colours.primary,
      onPrimary: colours.onPrimary,
      primaryContainer: colours.ex1,
      secondary: colours.secondary,
      onSecondary: colours.onSecondary,
      secondaryContainer: colours.secondary,
      onSecondaryContainer: colours.onSecondary,
      background: colours.background,
      onBackground: colours.onBackground,
      surface: colours.surface,
      onSurface: colours.onSurface,
      surfaceVariant: colours.surface,
      onSurfaceVariant: colours.onSurface,
    },
  };

  return <PaperProvider theme={paperTheme}>{children}</PaperProvider>;
}

export default function RootLayout() {
  const isOnboarded = useAppStore((s) => s.isOnboarded);
  const [hydrated, setHydrated] = useState(useAppStore.persist.hasHydrated());


  //temporary code to reset flag so that I can test onboarding
  useEffect(()=>{
    useAppStore.setState({isOnboarded: false});
  }, []);

  useEffect(()=>{
    const unsub = useAppStore.persist.onFinishHydration(()=>setHydrated(true));
    return unsub;
  }, []);
  useEffect(()=> {
    if (hydrated) SplashScreen.hideAsync();

  }, [hydrated]);

  if(!hydrated) return null;

  return(
    <ThemeProvider>
      <PaperThemeProvider>
        <UserProvider>
          <Stack>
            <Stack.Protected guard={!isOnboarded}>
              <Stack.Screen name="(onboarding)"/>
            </Stack.Protected>
            
            <Stack.Protected guard={isOnboarded}>
              <Stack.Screen name="(tabs)"/>
            </Stack.Protected>

          </Stack>
        </UserProvider>
      </PaperThemeProvider>
    </ThemeProvider>
  )
}
