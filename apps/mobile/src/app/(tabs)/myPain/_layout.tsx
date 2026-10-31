import { Stack} from 'expo-router'
import { useTheme, ColourSet } from '../../../../context/ThemeContext';
import { StyleSheet,  } from 'react-native';

/**
 * Defines the structure of the screens within the myPain page.
 * 
 * @returns screens which correspond to different files as screens.
 */
export default function MyPainLayout() {
  const {colours, theme} = useTheme();
  const styles = createStyles(colours);

   return (
    <Stack 
      screenOptions={{
        // content of the page
        contentStyle: { 
          backgroundColor: colours.background
        },
      }}
    >
      <Stack.Screen 
      name="index"
        options={{
          headerStyle: { backgroundColor: colours.background },
          headerShadowVisible: false,
          title: '',
        }}
      />
      <Stack.Screen 
      name="painSection"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen 
      name="AssessmentTemp"
        options={{
          headerShown: false,
        }}
      />
      </Stack>)

}

function createStyles(colours: ColourSet){
    return StyleSheet.create({
      headerStyle: {
        backgroundColor: colours.background,
        padding: 30,
    },

});
 }