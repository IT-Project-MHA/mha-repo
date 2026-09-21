import { StyleSheet } from "react-native";
import { lightColours, darkColours, lightHcColours, darkHcColours, ColourSet } from "./colourScheme";
import { primaryButtonLayout, buttonLayout, textLayout } from "./layout";


/**
 * Builds a style sheet for each theme, using colour schemes defined in colourScheme.ts
 * Structure of components stays consistent across themes
 * 
 * @param colours colour scheme according to theme defined in colourScheme.ts
 * @returns a styleSheet containing styles for components, text and screen using the given palette.
 */
const createTheme = (colours: ColourSet) =>
  StyleSheet.create({
    primaryButton: {
      backgroundColor: colours.primary,
      ...primaryButtonLayout,
    },
    secondaryButton: {
      backgroundColor: colours.secondary,
      ...buttonLayout,
    },
    text: {
      color: colours.onPrimary,
      ...textLayout,
    },
    screen: {
      flex: 1,
      backgroundColor: colours.background,
    },
  });

/**
 * Building the available themes by passing the corresponding colour palette to createTheme()
 * 
 * Themes referred to as 'light'|'dark'|'lightHC'|'darkHC'
 */
export const themes = {
  light: createTheme(lightColours),
  dark: createTheme(darkColours),
  lightHC: createTheme(lightHcColours),
  darkHC: createTheme(darkHcColours),
};

export const themeColours ={
  light : lightColours,
  dark: darkColours,
  lightHC: lightHcColours,
  darkHC: darkHcColours,
}

/**
 * Exports themeMode as a set of valid theme names, so that setMode() and useState() can only 
 * be called on real, defined themes.
 * 
 * typeof exports the type that is defined in themes (the structure).
 * 
 * keyof extracts the key names defined in themes.
 */
export type ThemeMode = keyof typeof themes;