import { Stack } from 'expo-router';
import { useTheme } from '../../../../context/ThemeContext';

// keeps the care planner screen under every page in this stack
export const unstable_settings = {
  anchor: 'index',
};

/**
 * Defines the screens within the care planner tab as a stack, so pages opened from the care
 * planner get a header with a back button and the nav bar stays visible.
 *
 * @returns screens which correspond to the files in this folder.
 */
export default function CarePlannerLayout() {
  const { colours } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colours.background },
        headerTintColor: colours.onBackground,
      }}
    >
      <Stack.Screen
        // the care planner screen has its own heading
        name="index"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="createAppointment"
        options={{ title: 'Create Appointment' }}
      />
      <Stack.Screen
        name="addSupportPerson"
        options={{ title: 'Add a Support Person' }}
      />
    </Stack>
  );
}
