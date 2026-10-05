import { Stack } from "expo-router";
import { Platform } from "react-native";
import { configureFonts, MD3DarkTheme, MD3LightTheme, PaperProvider } from "react-native-paper";
import { enGB, registerTranslation } from "react-native-paper-dates";
import { ThemeProvider, useTheme } from "../../context/ThemeContext";
import { UserProvider } from "../../context/AuthorisationContext";

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

  return(
    <ThemeProvider>
      <PaperThemeProvider>
      <UserProvider>
      <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
      </UserProvider>
      </PaperThemeProvider>
    </ThemeProvider>
  )
}
