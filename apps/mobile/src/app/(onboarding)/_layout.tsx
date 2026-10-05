import { Stack } from "expo-router";
import { Tabs } from 'expo-router';
import {Ionicons} from '@react-native-vector-icons/ionicons'
import { StyleSheet } from 'react-native';
import {BlurView} from 'expo-blur';
import { useTheme, ColourSet } from '../../../context/ThemeContext';
import { useUser } from '../../../context/AuthorisationContext';

export default function Layout(){
    const {colours} = useTheme();
    const styles = createStyles(colours);
    const {isPatient} = useUser();
  return (
  <Stack>
    <Stack.Screen name="splashScreen"         options={{ headerLargeTitleEnabled: true }} />
    <Stack.Screen name="signIn"         options={{ headerLargeTitleEnabled: true }} />
  </Stack>
  );
} 


function createStyles(colours: ColourSet){
    return StyleSheet.create({

    // the tab buttons
    tabItem: {
      flex: 1,
      height: '100%',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 0,
  },

  // the nav bar
  floatingTabBar: {
    bottom: 28,
    alignSelf: 'center',
    width: '85%',

    flexDirection: 'row',
    alignItems: 'center',

    height: 64,
    borderRadius: 28,
    borderTopWidth: 0,     
    borderBottomWidth: 0, 
 
    borderWidth: 1,
    borderColor: 'rgba(154, 149, 149, 0.12)',

    backgroundColor: colours.surface,
    overflow: 'hidden',

    shadowColor: '#2a2727',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 4,
  },
});
 }

