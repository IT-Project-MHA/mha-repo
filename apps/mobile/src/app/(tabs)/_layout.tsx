import { Tabs } from 'expo-router';
import {Ionicons} from '@react-native-vector-icons/ionicons'


export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#007AFF', 
        headerShown: true,         
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => (
            <Ionicons name ="home" size={30} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
