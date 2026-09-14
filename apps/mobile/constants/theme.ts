import { StyleSheet } from "react-native";
import { lightColours, darkColours, lightHcColours, darkHcColours, ColourSet } from "./colourScheme";
import { buttonLayout, textLayout } from "./layout";

/**
 * create theme
 * @param colours 
 * @returns 
 */
const createTheme = (colours: ColourSet) =>
  StyleSheet.create({
    primaryButton: {
      backgroundColor: colours.p1,
      ...buttonLayout,
    },
    text: {
      color: '#FFFFFF',
      ...textLayout,
    },
    screen: {
      flex: 1,
      backgroundColor: colours.p2,
    },
  });


export const themes = {
  light: createTheme(lightColours),
  dark: createTheme(darkColours),
  lightHC: createTheme(lightHcColours),
  darkHC: createTheme(darkHcColours),
};

export type ThemeMode = keyof typeof themes;