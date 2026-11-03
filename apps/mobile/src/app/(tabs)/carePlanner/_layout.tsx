import { Stack } from 'expo-router';
import React from 'react';
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
  const { colours, theme } = useTheme();

  return (
    <AppointmentProvider>
      <Stack
        screenOptions={{
          animation: 'none',
          headerStyle: { backgroundColor: colours.background },
          headerTintColor: colours.onBackground,
          headerShadowVisible: false,
          // each page shows its own title, as in settings
          title: '',

          headerTitleStyle: {
          fontSize: theme.h4.fontSize,
          fontWeight: theme.h4.fontWeight,
          },
          contentStyle: { 
          backgroundColor: colours.background
          },
          // back button
        headerBackTitleStyle: {
          fontSize: theme.h6.fontSize,
        },

        headerBackButtonDisplayMode: 'default',
        headerBackTitle: 'Back',
        }
        
      }

        
      />
    </AppointmentProvider>
  );
}


