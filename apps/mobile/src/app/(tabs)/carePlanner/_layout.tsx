import { Stack } from 'expo-router';
import { useTheme } from '../../../../context/ThemeContext';
import { AppointmentProvider } from '../../../../context/AppointmentContext';

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
    <AppointmentProvider>
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
        <Stack.Screen
          name="addSupportPerson1"
          options={{ title: 'Add Support Person 1' }}
        />
        <Stack.Screen
          name="addSupportPerson2"
          options={{ title: 'Add Support Person 2' }}
        />
        <Stack.Screen
          name="editAppointment"
          options={{ title: 'Edit Appointment' }}
        />
        <Stack.Screen
          name="editSupportPerson1"
          options={{ title: 'Edit Support Person 1' }}
        />
        <Stack.Screen
          name="editSupportPerson2"
          options={{ title: 'Edit Support Person 2' }}
        />
        <Stack.Screen
          name="mySupportLinks"
          options={{ title: 'My Support Links' }}
        />
        <Stack.Screen
          name="addQuestions"
          options={{ title: 'Add Questions to Your Appointment' }}
        />
        <Stack.Screen
          name="reviewAppointment"
          options={{ title: 'Review my Appointment Plan' }}
        />
        <Stack.Screen
          name="allAppointments"
          options={{ title: 'All Appointments' }}
        />
        <Stack.Screen
          name="appointmentDetails"
          options={{ title: 'Appointment Details' }}
        />
      </Stack>
    </AppointmentProvider>
  );
}
