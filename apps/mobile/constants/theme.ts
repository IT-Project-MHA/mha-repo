import { StyleSheet } from "react-native";
import { lightColours, darkColours, lightHcColours, darkHcColours, ColourSet } from "./colourScheme";
import { primaryButtonLayout, buttonLayout, settingsButtonLayout, squareButtonWithLineLayout, transparentButtonLayout } from "./layout";


/**
 * Builds a style sheet for each theme, using colour schemes defined in colourScheme.ts
 * Structure of components stays consistent across themes
 * 
 * when you add a button you must add it to Button.tsx:
 * 
 * type ButtonType = "primaryButton" | "secondaryButton" | "new button";
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
    screen: {
      flex: 1,
      backgroundColor: colours.background,
    },
    settingsButton: {
      backgroundColor: colours.primary,
      borderColor: colours.ex1,
      ...settingsButtonLayout,
    },
    squareButtonWithLine:{
      backgroundColor: colours.secondary,
      borderColor: colours.primary,
      ...squareButtonWithLineLayout,
    },
    transparentButton:{
      backgroundColor: 'transparent',
      ...transparentButtonLayout,
    },
    container: {
      justifyContent: 'center',
      backgroundColor: colours.surface,
      paddingBlock: '6%', //lit
      alignSelf: 'center',
      width: '85%', // of page
    
      borderRadius: 28,
 
      overflow: 'hidden',

      shadowColor: colours.primary,
      shadowOffset: { width: 2, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 16,

    },
    line: {
      height: 1,
      backgroundColor: colours.onBackground,
      width: '90%',
      borderRadius: 300,
      alignSelf: 'center',

    },
    centerItemsHorizontal: {
      alignItems: 'center',
    },
    clearContainer: {
      justifyContent: 'center',
      backgroundColor:'transparent',
      paddingBlock: 30, //lit
      alignSelf: 'center',
      width: '85%', // of page

      borderRadius: 28,
      borderTopWidth: 0,     
      borderBottomWidth: 0, 
 
      overflow: 'hidden',
    },
    /**
     * use only for manipulating layouts within a container
     * use with other themes, for example:
     * 
     * <View style={[theme.layoutContainer, theme.centerItems]}>
     */
    layoutContainer: {
      justifyContent: 'center',
      backgroundColor:'transparent',
      width: '100%',
    },
    // for use within a container
    centerText: {
      textAlign: 'center',
    },
    leftText: {
      textAlign: 'left',
      paddingHorizontal: '5%',
    },
    rightText: {
      textAlign: 'right',
      paddingHorizontal: '5%',
    },
    centerItems: {
      alignItems: 'center',
    },
    leftItems: {
      alignItems: 'flex-start',
    },
    rightItems: {
      alignItems: 'flex-end',
    },
    // places items within view in a row,
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      alignSelf: 'stretch',
    },
    bottomGap: {
      height: 120,
      color: 'transparent'
    },
    header: {
      height: 20,
      backgroundColor: colours.background,
      width: '100%',
      alignContent: 'flex-start',
      paddingBottom: 50,
      paddingTop: 5,
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

/**
 * Exports the theme colours outside of the context components, so that
 * you can colour something to theme that's not a defined component.
 */
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