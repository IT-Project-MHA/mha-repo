import { StyleSheet } from "react-native";
import { lightColours, darkColours, lightHcColours, darkHcColours, ColourSet } from "./colourScheme";
import { primaryButtonLayout, buttonLayout, textLayout, transparentButtonLayout, textButtonLayout, roundButtonLayout, lineThickness } from "./layout";

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

/**
 * Requests:
 * questionOption for multiple choice question boxes
 * input / entryBox for textbox theming - just use style={[theme.text, theme.option]}
 * 
 */

const createTheme = (colours: ColourSet) =>
  StyleSheet.create({
    /**
     * Button Styles
     */
    primaryButton: {
      backgroundColor: colours.primary,
      ...primaryButtonLayout,
    },
    secondaryButton: {
      backgroundColor: colours.secondary,
      ...buttonLayout,
    },
    roundButton: {
      backgroundColor: colours.tertiary,
      ...roundButtonLayout,
    },
    roundSecondaryButton: {
      backgroundColor: colours.background,
      ...roundButtonLayout,
      borderWidth: 1,
      borderTopWidth: 1,
      borderBottomWidth: 1,
      borderColor: colours.onSurface,
    },
    transparentButton:{
      backgroundColor: 'transparent',
      ...transparentButtonLayout,
    },
    textButton:{
      backgroundColor: 'transparent',
      ...textButtonLayout,
    },

    /**
     * Screen Design
     */
    screen: {
      flex: 1,
      backgroundColor: colours.background,
    },
    // clear container with padding
    clearContainer: {
      justifyContent: 'center',
      backgroundColor:'transparent',
      paddingBlock: 30,
      alignSelf: 'center',
      width: '85%',
      borderRadius: 28,
      borderTopWidth: 0,     
      borderBottomWidth: 0, 
      overflow: 'hidden',
    },
    sectionContainer: {
      justifyContent: 'center',
      backgroundColor: colours.surface,
      paddingBlock: '6%',
      alignSelf: 'center',
      width: '85%',
      paddingHorizontal: '3%',
      borderRadius: 28,

      shadowColor: colours.primary,
      shadowOffset: { width: 2, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 6,
    },
        
    /**
     * use only for manipulating layouts within a container as it
     * has no padding.
     * 
     * use with other themes, for example:
     * 
     * <View style={[theme.layoutContainer, theme.centerItems]}>
     */
    layoutContainer: {
      justifyContent: 'center',
      backgroundColor:'transparent',
      width: '100%',
    },
    boxContainer: {
      justifyContent: 'center',
      backgroundColor:'transparent',
      width: '100%',
      borderWidth: 1,
      borderColor: colours.onSurface,
      padding: 10,
      borderRadius: 10,
    },

    /**
     * Within Containers, layout stuff, etc.
     */

    // for use within a container
    centerText: {
      textAlign: 'center',
    },
    // for use within a container
    leftText: {
      textAlign: 'left',
      paddingHorizontal: '5%',
    },
    // for use within a container
    rightText: {
      textAlign: 'right',
      paddingHorizontal: '5%',
    },
    // for use within a container
    centerItems: {
      alignItems: 'center',
    },
    // for use within a container
    leftItems: {
      alignItems: 'flex-start',
      paddingHorizontal: '5%',
    },
    // for use within a container
    rightItems: {
      alignItems: 'flex-end',
      paddingHorizontal: '5%',
    },
    // places items within view in a row,
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      alignSelf: 'stretch',
    },

    /**
     * Modals
     */
    modalView: {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          padding: 15,
        },
        card: {
          width: '100%',
          maxWidth: 500,
          borderRadius: 28,
          padding: 24,
          maxHeight: '80%'
        },
        modalButtons: {
          flexDirection: 'row',
          justifyContent: 'center',
          flexWrap: 'wrap',
          gap: 10,
          marginTop: 24,
          paddingHorizontal: 15,
        },
        modalButton: {
          paddingVertical: 12,
          paddingHorizontal: 20,
          borderRadius: 50,
          minHeight: 44,
          justifyContent: 'center',
          alignItems: 'center',
        },
        modalBackgroundColour: {
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.6)'
        },
        field : {
          width: '100%',
          borderRadius: 28,
          padding: 5,
        },
        textInput : {
          height: 40,
            padding: 5,
            marginHorizontal: 8,
            borderWidth: 1,
        },
    /**
     * Extra things
     */

    // divider
    line: {
      height: 1,
      backgroundColor: colours.onSurface,
      width: '90%',
      borderRadius: 300,
      alignSelf: 'center',
    },
    // gap at the bottom of the screen, so nav bar doesnt cover it
    bottomGap: {
      height: 120,
      color: 'transparent'
    },
    header: {
      backgroundColor: colours.background,
      justifyContent: 'center',
      width: '100%',
      alignContent: 'flex-start',
      paddingBottom: 20,
      paddingTop: 15,
      borderColor: colours.background,
      borderWidth: 3,
    },
    
    /**
     * Styles for font details (colour, underline, etc)
     */
    fontOnSurface: {
      color: colours.onSurface,
    },
    fontOnBackground: {
      color: colours.onBackground,
    },
    fontUnderlined: {
      textDecorationLine: 'underline',
    },

    /**
     * Emoji Select
     */
    container: {
      flex: 1,
      paddingVertical: 12, 
      paddingHorizontal: 80, 
      borderRadius: 8,
      backgroundColor: colours.background,
    },
    option: {
      backgroundColor: colours.surface,
      padding: 15,
      borderRadius: 8,
      marginBottom: 15,
    },
    selectedOption: {
      backgroundColor: colours.secondary,
      borderWidth: 1,
      borderColor: colours.primary,
    },
    optionText: {
      color: colours.onPrimary,
      ...textLayout,
    },
    selectedOptionText: {
      color: colours.onSecondary,
      ...textLayout,
    },
    //emoji
    emojiContainer: {
      paddingVertical: 12, 
      paddingHorizontal: 12, 
      backgroundColor: colours.background,
    },
    //slider
    //{ width: 200, height: 40 } originally
    slider:{
      maxWidth: 480,
      paddingVertical: 12,
      borderRadius: 8,
    }
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

