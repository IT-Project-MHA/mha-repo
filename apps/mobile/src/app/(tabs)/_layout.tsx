import { Tabs } from 'expo-router';
import {Ionicons} from '@react-native-vector-icons/ionicons'
import { StyleSheet } from 'react-native';
import { useTheme, ColourSet } from '../../../context/ThemeContext';
import { useUser } from '../../../context/AuthorisationContext';


/**
 * Defines the structure of the navigation bar using the react native 'tab view' component structure
 * 
 * @returns tabs which correspond to different files as screens.
 */
export default function TabLayout() {
    const {colours,theme} = useTheme();
    const styles = createStyles(colours);
    const {isPatient} = useUser();

  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          ...styles.floatingTabBar,
        },
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          ...theme.xSmall,
        },
        tabBarActiveTintColor: colours.onPrimary,
        tabBarInactiveTintColor: colours.onSurface,
        headerShown: false,   
        
        
      }}
    >
      <Tabs.Screen
        // this could be an admin screen
        name="index"
        options={{
          title: 'Index Home',
          href: null, 
          tabBarIcon: ({ color }) => (
            <Ionicons name ="home-outline" size={24} color={color} />
          ),
        }}
      />
        <Tabs.Screen
        name="painTracker"
        options={{
          title: 'Pain Tracker',
          href: isPatient ? undefined : null, // if isPatient is false, href = null (doesn't show tab)
          tabBarIcon: ({ color }) => (
            <Ionicons name ="body-outline" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="myHealth"
        options={{
          title: 'My Health',
          href: isPatient ? undefined : null,
          tabBarIcon: ({ color }) => (
            <Ionicons name ="pulse-outline" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="carePlanner"
        options={{
          title: 'Care Planner',
          href: isPatient ? undefined : null,
          tabBarIcon: ({ color }) => (
            <Ionicons name ="book-outline" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="sharedWithMe"
        options={{
          title: 'Shared With Me',
          tabBarIcon: ({ color }) => (
            <Ionicons name ="search-outline" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          headerShown: false,
          title: 'Settings',
          tabBarIcon: ({ color }) => (
            <Ionicons name ="cog-outline" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

/**
 * Creates stylesheets for different components of the navigation bar
 * 
 * @param colours the colour set from useTheme()
 * @returns a style sheet containing 'tabItem' and 'floatingTabBar'.
 */
function createStyles(colours: ColourSet){
    return StyleSheet.create({

    // the tab buttons
    tabItem: {
      justifyContent: 'center',
  },

  // the nav bar
  floatingTabBar: {
    bottom: '2.5%',
    //width: '100%',
    position: 'absolute',
    paddingTop: 29,
    paddingBottom: 29,
    left: 15,
    right: 15,
  
    flexDirection: 'row',
    alignItems: 'center',

    borderRadius: 30,
    borderTopWidth: 0,     
    borderBottomWidth: 0, 

    backgroundColor: colours.primary,
    overflow: 'hidden',

    shadowColor: colours.primary,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 10,

  },
});
 }

