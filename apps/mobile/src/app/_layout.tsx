import { Stack } from "expo-router";
import { Platform } from "react-native";
import React, { useEffect,useState } from "react";

import { configureFonts, MD3DarkTheme, MD3LightTheme, PaperProvider } from "react-native-paper";
import { enGB, registerTranslation } from "react-native-paper-dates";

import { ThemeProvider, useTheme } from "../../context/ThemeContext";
import { UserProvider, useUser } from "../../context/AuthorisationContext";

import * as Notifications from 'expo-notifications';
import * as SplashScreen from 'expo-splash-screen';
import { useAppStore } from "../store/appStore";

SplashScreen.preventAutoHideAsync();

// date pickers use Australian day/month/year format
registerTranslation("en-GB", enGB);

/**
 * Android 13+ will not show the notification permission prompt until at least one
 * notification channel exists, so this creates one when the app starts.
 */
async function setUpNotificationChannel() {
  if (Platform.OS !== "android") return;
  try {
    await Notifications.setNotificationChannelAsync("default", {
      name: "Default",
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  } catch(e) {
    // not fatal, but the permission prompt may not appear on Android 13+
    console.warn("Could not create notification channel", e);
}
}

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

/**
 * decides which screens the user can reach: onboarding/login, or the main tabs.
 */
function RootNavigator() {
  const { isUndefined, isLoading } = useUser();

  useEffect(() => {
    if (!isLoading) SplashScreen.hideAsync();
  }, [isLoading]);

  if (isLoading) return null;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={isUndefined}>
        <Stack.Screen name="(onboarding)" />
      </Stack.Protected>

      <Stack.Protected guard={!isUndefined}>
        <Stack.Screen name="(tabs)" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  const [hydrated, setHydrated] = useState(useAppStore.persist.hasHydrated());

  // set up notification channel on boot
  useEffect(() => {
    setUpNotificationChannel();
  }, []);

  // waits for the persisted store to load, to prevent wrong onboarding trigger
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
          <RootNavigator />
        </UserProvider>
      </PaperThemeProvider>
    </ThemeProvider>
  )
}
