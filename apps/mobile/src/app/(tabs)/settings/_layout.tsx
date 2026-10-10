import { Stack} from 'expo-router'
import { useTheme, ColourSet } from '../../../../context/ThemeContext';
import { StyleSheet,  } from 'react-native';

/**
 * Defines the structure of the screens within the settings page.
 * 
 * @returns screens which correspond to different files as screens.
 */
export default function ScreenLayout() {
  const {colours, theme} = useTheme();
  const styles = createStyles(colours);

  return (
    <Stack 
      screenOptions={{
        headerStyle: styles.headerStyle,
        headerShadowVisible: false, // no line 
        headerTitleAlign: 'left', // text to left
    
        // header text
        headerTitleStyle: {
          fontSize: theme.h4.fontSize,
          fontWeight: theme.h4.fontWeight,
        },
        headerTintColor: colours.onBackground,

        // content of the page
        contentStyle: { 
          backgroundColor: colours.background
        },

        // back button
        headerBackTitleStyle: {
          fontSize: theme.h6.fontSize,
        },
        headerBackButtonDisplayMode: 'default',
        headerBackTitle: 'Settings',
      }}
    >
      <Stack.Screen 
      name="index"
        options={{
          title: 'Settings',
          headerTitle: '',
        }}
      />
      <Stack.Screen 
        name="myAccount"
        options={{
          title: '',
        }}
      />
      <Stack.Screen 
        name="accessibility"
        options={{
          title: '',
        }}
      />
      <Stack.Screen 
        name="legal"
        options={{
          headerTitle: '',
        }}
      />
      <Stack.Screen 
        name="myConnections"
        options={{
          title: '',
        }}
      />
      <Stack.Screen 
        name="myData"
        options={{
          title: '',
        }}
      />
      <Stack.Screen 
        name="permissions"
        options={{
          title: '',
        }}
      />
      <Stack.Screen 
        name="support"
        options={{
          title: '',
        }}
      />
    </Stack>
  );
}

function createStyles(colours: ColourSet){
    return StyleSheet.create({
      headerStyle: {
        backgroundColor: colours.background,
        padding: 30,
    },

});
 }


