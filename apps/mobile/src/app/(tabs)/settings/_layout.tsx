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
        title: 'Back',
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
        name="myAccount"
        options={{
          title: 'My Account',
        }}
      />
      <Stack.Screen 
        name="accesibility"
        options={{
          title: 'Accesibility',
        }}
      />
      <Stack.Screen 
        name="legal"
        options={{
          title: 'Legal',
        }}
      />
      <Stack.Screen 
        name="myConnections"
        options={{
          title: 'My Connections',
        }}
      />
      <Stack.Screen 
        name="myData"
        options={{
          title: 'My Data',
        }}
      />
      <Stack.Screen 
        name="permissions"
        options={{
          title: 'Permissions',
        }}
      />
      <Stack.Screen 
        name="support"
        options={{
          title: 'Support',
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


