import { Stack } from "expo-router";
import React from "react";
import { useTheme, ColourSet } from "@/context/ThemeContext";
import { StyleSheet } from 'react-native';

export default function OnboardingLayout() {
  const { colours, theme } = useTheme();
  const styles = createStyles(colours);

  return (
    <Stack
      screenOptions={{
        headerStyle: styles.headerStyle,
        headerShadowVisible: false, // no line
        headerTitleAlign: 'left', // text to left

        // header text
        headerTitleStyle: {
          fontSize: theme.h4.fontSize,
          fontWeight: theme.h4.fontWeight,
        },
        headerTintColor: colours.onBackground,

        // content of the page
        contentStyle: {
          backgroundColor: colours.background
        },

        // back button
        headerBackTitleStyle: {
          fontSize: theme.h6.fontSize,
        },
        headerBackButtonDisplayMode: 'default',
        headerBackTitle: 'Back',
      }}
    >
      {/* ---------- Landing ---------- */}
      <Stack.Screen
        name="index"
        options={{
          title: 'index',
          headerTitle: '',
        }}
      />
      <Stack.Screen
        name="splashScreen"
        options={{
          title: 'splashScreen',
          headerShown: false,
        }}
      />

      {/* ---------- Sign up (userOnboarding) ---------- */}
      <Stack.Screen
        name="userOnboarding/createAccount"
        options={{
          title: 'createAccount',
          headerTitle: '',
        }}
      />
      <Stack.Screen
        name="userOnboarding/passcode"
        options={{
          title: 'passcode',
          headerTitle: '',
        }}
      />
      <Stack.Screen
        name="userOnboarding/email"
        options={{
          title: 'email',
          headerTitle: '',
        }}
      />
      <Stack.Screen
        name="userOnboarding/initialPhoneEntry"
        options={{
          title: 'initialPhoneEntry',
          headerTitle: '',
        }}
      />
      <Stack.Screen
        name="userOnboarding/verifyPhone"
        options={{
          title: 'verifyPhone',
          headerTitle: '',
        }}
      />

      {/* ---------- Patient flow (patientOnboarding) ---------- */}
      <Stack.Screen
        name="patientOnboarding/userType"
        options={{
          title: 'userType',
          headerTitle: '',
        }}
      />
      <Stack.Screen
        name="patientOnboarding/sexSelect"
        options={{
          title: 'sexSelect',
          headerTitle: '',
        }}
      />
      <Stack.Screen
        name="patientOnboarding/ageEntry"
        options={{
          title: 'ageEntry',
          headerTitle: '',
        }}
      />
      <Stack.Screen
        name="patientOnboarding/diagnosis"
        options={{
          title: 'diagnosis',
          headerTitle: '',
        }}
      />
      <Stack.Screen
        name="patientOnboarding/dropDownConditions"
        options={{
          title: 'dropDownConditions',
          headerTitle: '',
        }}
      />
      <Stack.Screen
        name="patientOnboarding/additionalConditionsTextEntry"
        options={{
          title: 'additionalConditionsTextEntry',
          headerTitle: '',
        }}
      />

      {/* ---------- Sign in ---------- */}
      <Stack.Screen
        name="signIn/signIn"
        options={{
          title: 'signIn',
          headerTitle: '',
        }}
      />
      <Stack.Screen
        name="signIn/enterPin"
        options={{
          title: 'enterPin',
          headerTitle: '',
        }}
      />
      <Stack.Screen
        name="signIn/phoneVerification"
        options={{
          title: 'phoneVerification',
          headerTitle: '',
        }}
      />

      {/* ---------- Final screen: no going back mid-registration ---------- */}
      <Stack.Screen
        name="accountCreatedSplashScreen"
        options={{
          title: 'accountCreatedSplashScreen',
          headerTitle: '',
          headerBackVisible: false,
          gestureEnabled: false,
        }}
      />
    </Stack>
  );
}

function createStyles(colours: ColourSet) {
  return StyleSheet.create({
    headerStyle: {
      backgroundColor: colours.background,
      padding: 30,
    },
  });
}