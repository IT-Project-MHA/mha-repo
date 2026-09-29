import { Stack } from 'expo-router'

/**
 * Defines the structure of the tabs within the settings page.
 * 
 * @returns tabs which correspond to different files as screens.
 */
export default function TabLayout() {
  return (
    <Stack 
      screenOptions={{
        // prevent a second nav-bar from appearing
     
      }}
    >
      <Stack.Screen 
      name="index"
        options={{
          title: 'index',
        }}
      />
      <Stack.Screen
        name="themePref"
        options={{
          title: 'Themes',
        }}
      />
    </Stack>
  );
}
