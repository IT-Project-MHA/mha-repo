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
          headerShadowVisible: false,
          // each page shows its own title, as in settings
          title: '',
        }}
      />
    </AppointmentProvider>
  );
}
