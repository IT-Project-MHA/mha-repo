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
        // First layer of header: back button 
        headerStyle: styles.headerStyle,
        headerTintColor: colours.onBackground,
        headerTitleStyle: {
          fontSize: theme.h4.fontSize,
          fontWeight: theme.h4.fontWeight,
        },
        headerBackTitleStyle: {
          fontSize: theme.h6.fontSize,
        },
        contentStyle: { backgroundColor: colours.background},
        headerBackButtonDisplayMode: 'default',
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
        borderBottomWidth: 0, 
        minHeight: 80,
    },
});
 }


