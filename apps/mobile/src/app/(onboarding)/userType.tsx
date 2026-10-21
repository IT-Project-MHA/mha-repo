/**
 * This page contains a multi-select question.
 * It asks for user-type, i.e. patient or support person, or both.
 * Inserted between terms of service and sexSelect
 */


import { View, Text, ScrollView, StyleSheet } from 'react-native';

import { useRouter } from 'expo-router';
import { MultiSelect } from '../../../components/answerFields/MultiSelect';
import { useOnboardingUserStore } from '../store/onboardingStorage';

import React from 'react';

import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { lineThickness } from '../../../constants/layout';
import { useTheme, ColourSet } from '../../../context/ThemeContext';
import { Typography } from '../../../constants/textSize';

export default function Page() {
  const router = useRouter();
  const { theme } = useTheme();
  const setUserOnboaring = useOnboardingUserStore((s)=> s.set);

  const USER_TYPES = ["For myself","To support someone else who uses the app"]; //patient equivalent text, support person equivalent text

  function setUserType(selection: string[]){
    //this function sets the user type based on selection, and navigates to the appropriate page

    //check selections and set flags
    const isPatient = selection.includes(USER_TYPES[0]);
    const isSupportPerson = selection.includes(USER_TYPES[1]);

    setUserOnboaring({isPatient, isSupportPerson});
    //navigation
    //if patient tagged, do that first.
    //support person onboarding is tacked on after phone number verification, with a check to the pseudo-account flag
    if(isPatient){
      router.navigate('/(onboarding)/patientOnboarding/sexSelect');
    }
    else{
      router.navigate('/(onboarding)/supportPersonOnboarding/supportPersonOnboarding');
    }
  }
  return (
    <SafeAreaView style={theme.screen}>
      
      <Text style={theme.text}>How do you plan to use the app?</Text>
      <ScrollView
      showsVerticalScrollIndicator={false}
      >
        <MultiSelect
        questionOptions={USER_TYPES}
        headingText='You can select both'
        onSubmit={setUserType}
        MIN_SELECTIONS={1}
        MAX_SELECTIONS={USER_TYPES.length+1}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

