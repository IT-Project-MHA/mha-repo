import React from 'react';
import { Tabs } from 'expo-router';
import {Ionicons} from '@react-native-vector-icons/ionicons'
import { StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, ColourSet } from '../../../context/ThemeContext';
import { useUser } from '../../../context/AuthorisationContext';

// consts that can be imported & used in other tabs/components
export const TAB_BAR_HEIGHT = 40;
export const TAB_BAR_BOTTOM = 0;
export const TAB_BAR_ANDROID_ICON_LIFT = 26;


/**
 * Defines the structure of the navigation bar using the react native 'tab view' component structure
 * 
 * @returns tabs which correspond to different files as screens.
 */
export default function TabLayout() {
    const {colours,theme} = useTheme();
    const {isPatient} = useUser();
    // height of the Android nav bar / iPhone home indicator, 0 when there is none
    const insets = useSafeAreaInsets();
    const androidNavBarHeight = Platform.OS === 'android' ? insets.bottom : 0;
    const iosBottomInset = Platform.OS === 'ios' ? insets.bottom : 0;
    const bottomReserve = androidNavBarHeight
      ? androidNavBarHeight + TAB_BAR_ANDROID_ICON_LIFT
      : iosBottomInset;
    const styles = createStyles(colours, bottomReserve, androidNavBarHeight);

  return (
    <Tabs
      screenOptions={{
        tabBarStyle: styles.floatingTabBar,
        // centres each icon & label in the bar above the bottom margin reserved for OS nav bar
        tabBarItemStyle: styles.tabItem,
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          ...theme.xSmall,
        },
        tabBarActiveTintColor: colours.secondary,
        tabBarInactiveTintColor: colours.ex2,
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
        name="myPain"
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
function createStyles(colours: ColourSet, bottomReserve: number, androidNavBarHeight: number){
    return StyleSheet.create({
    tabItem: {
      justifyContent: 'center',
  },

  floatingTabBar: {
    bottom: TAB_BAR_BOTTOM,
    position: 'absolute',
    // total height = icon band + reserved bottom space + trim on android
    height: TAB_BAR_HEIGHT + bottomReserve + (androidNavBarHeight ? -15 : 0),
    paddingBottom: bottomReserve,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',


    //borderRadius: 100,
    borderTopWidth: 0,     
    borderBottomWidth: 0, 

    backgroundColor: colours.primary,
    
    shadowColor: colours.primary,
    shadowOffset: { width: 0, height:0 },
    shadowOpacity: 0.15,
    shadowRadius: 6,

  },
});
 }