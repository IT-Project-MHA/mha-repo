import { Tabs } from 'expo-router';
import {Ionicons} from '@react-native-vector-icons/ionicons'
import { StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
    // height of the Android nav bar / iPhone home indicator, 0 when there is none
    const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          ...styles.navBar,
        },
        // centres each icon & label between the top of the nav bar and the system nav bar
        tabBarItemStyle: styles.tabItem,
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          ...theme.xSmall,
        },
        tabBarActiveTintColor: colours.onSecondary2,
        tabBarInactiveTintColor: colours.secondary,
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
            <Ionicons name ="home-outline" size={26} color={color} />
          ),
        }}
      />
        <Tabs.Screen
        name="painTracker"
        options={{
          title: 'Pain Tracker',
          href: isPatient ? undefined : null, // if isPatient is false, href = null (doesn't show tab)
          tabBarIcon: ({ color }) => (
            <Ionicons name ="body-outline" size={26} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="myHealth"
        options={{
          title: 'My Health',
          href: isPatient ? undefined : null,
          tabBarIcon: ({ color }) => (
            <Ionicons name ="pulse-outline" size={26} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="carePlanner"
        options={{
          title: 'Care Planner',
          tabBarIcon: ({ color }) => (
            <Ionicons name ="book-outline" size={26} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="sharedWithMe"
        options={{
          title: 'Shared With Me',
          href: null, 
          tabBarIcon: ({ color }) => (
            <Ionicons name ="search-outline" size={26} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          headerShown: false,
          title: 'Settings',
          tabBarIcon: ({ color }) => (
            <Ionicons name ="cog-outline" size={26} color={color} />
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
    tabItem: {
      justifyContent: 'center',
  },

  // the nav bar styling
  navBar: {
    position: 'absolute',
    height: 70,
  
    flexDirection: 'row',
    alignItems: 'center',

    borderTopWidth: 0,     
    borderBottomWidth: 0, 

    backgroundColor: colours.primary,

    shadowColor: colours.primary,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,

  },
});
 }