import { Stack } from "expo-router";
import React from "react";
import { useTheme, ColourSet } from "@/context/ThemeContext";
import { StyleSheet,  } from 'react-native';

export default function OnboardingLayout() {
    const {colours, theme} = useTheme();
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
    <Stack.Screen 
      name="index"
        options={{
          title: 'index',
          headerTitle: '',
        }}
      />
    <Stack.Screen 
      name="patientOnboarding"
        options={{
          title: 'patientOnboarding',
          headerTitle: '',
        }}
      />
      <Stack.Screen 
      name="userOnboarding/createAccount"
        options={{
          title: 'patientOnboarding',
          headerTitle: '',
        }}
      />

      {/**
       * Need to do this for every page to have a back button specific to onboarding
       */}
</Stack>
)}

function createStyles(colours: ColourSet){
    return StyleSheet.create({
      headerStyle: {
        backgroundColor: colours.background,
        padding: 30,
    },
});
 }