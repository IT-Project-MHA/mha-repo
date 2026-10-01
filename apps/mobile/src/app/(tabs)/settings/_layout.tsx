import { Stack } from 'expo-router'
import { useTheme, ColourSet } from '../../../../context/ThemeContext';
import { StyleSheet } from 'react-native';
import BlurView from 'expo-blur';

/**
 * Defines the structure of the screens within the settings page.
 * 
 * backgorund page colours being white should happen here :(
 * 
 * @returns screens which correspond to different files as screens.
 */
export default function ScreenLayout() {
  const {colours} = useTheme();
  const styles = createStyles(colours);

  return (
    // TO DO: fill this out properly
    
    <Stack 
      screenOptions={{
        title: 'My home',
        headerStyle: styles.headerStyle,
        contentStyle: { backgroundColor: colours.background},
      }}
    >
      <Stack.Screen 
      name="index"
        options={{
          title: 'Settings',
        }}
      />
      <Stack.Screen 
        name="themePref"
        options={{
          title: 'Select theme',
        }}
      />
    </Stack>
  );
}

//** 
// TO DO: ADD TO GLOBAL STYLE SHEET (header should be consistent through app)
// */
function createStyles(colours: ColourSet){
    return StyleSheet.create({

      headerStyle: {
        // make header less ugly
        // blur???? (semi transparent)
        backgroundColor: colours.background,
        borderBottomWidth: 0, 
    },
});
 }


