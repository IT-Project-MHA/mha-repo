import { Tabs } from 'expo-router';
import {Ionicons} from '@react-native-vector-icons/ionicons'
import { StyleSheet } from 'react-native';
import {BlurView} from 'expo-blur';
import { useTheme } from '../../../context/ThemeContext';


export default function TabLayout() {
    const {theme, colours} = useTheme();
    const styles = createStyles(colours);

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
        name="index"
        options={{
          title: 'Index Home',
          href: null, // hides this tab
          tabBarIcon: ({ color }) => (
            <Ionicons name ="home-outline" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
      // include conditional logic to remove/add
        name="painTracker"
        options={{
          title: 'Pain Tracker',
          tabBarIcon: ({ color }) => (
            <Ionicons name ="body-outline" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="myHealth"
        options={{
          title: 'My Health',
          tabBarIcon: ({ color }) => (
            <Ionicons name ="pulse-outline" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="carePlanner"
        options={{
          title: 'Care Planner',
          tabBarIcon: ({ color }) => (
            <Ionicons name ="book-outline" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
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

function createStyles(theme: any){
    return StyleSheet.create({
        tabItem: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 0,
  },

  floatingTabBar: {
    bottom: 28,
    alignSelf: 'center',
    width: '85%',

    flexDirection: 'row',
    alignItems: 'center',

    height: 64,
    borderRadius: 28,
    borderTopWidth: 0,          // Removes default separator line
    borderBottomWidth: 0, 
 
    //glass edge
    borderWidth: 1,
    borderColor: 'rgba(154, 149, 149, 0.12)',

    backgroundColor: 'rgba(30, 24, 24, 0.3)',
    overflow: 'hidden',

    shadowColor: '#2a2727',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 4,
  },
});
 }

