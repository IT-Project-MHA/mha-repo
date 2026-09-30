import { Tabs } from 'expo-router';
import {Ionicons} from '@react-native-vector-icons/ionicons'
import { StyleSheet } from 'react-native';
import {BlurView} from 'expo-blur';
import { useTheme, ColourSet } from '../../../context/ThemeContext';
import { useUser } from '../../../context/AuthorisationContext';


/**
 * Defines the structure of the navigation bar using the react native 'tab view' component structure
 * 
 * @returns tabs which correspond to different files as screens.
 */
export default function TabLayout() {
    const {colours} = useTheme();
    const styles = createStyles(colours);
    const {isPatient} = useUser();

  return (
    <Tabs
      screenOptions={{
        tabBarStyle: styles.floatingTabBar,
        headerShown: false,   
        tabBarItemStyle: styles.tabItem,
        tabBarShowLabel: true,
        tabBarActiveTintColor: colours.secondary,
        tabBarBackground: () => (
        <BlurView tint="dark" intensity={70} style={StyleSheet.absoluteFill} />
        ),
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
        name="/settings/index"
        options={{
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
      flex: 1,
      height: '100%',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 0,
  },

  // the nav bar
  floatingTabBar: {
    bottom: 28,
    position: 'absolute',
    left: '7.4%',
    right: '7.4%',

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

