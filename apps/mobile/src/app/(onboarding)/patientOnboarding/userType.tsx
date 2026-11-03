/**
 * Determines user type.
 */
import { Text, View, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { MultipleChoice } from '../../../../components/onboarding/onboardingFields/MultipleChoiceOnboarding';
import { useOnboardingStore } from '../../../store/onboardingStorage';
import React from 'react';
import { useTheme } from '../../../../context/ThemeContext';

export default function Page() {
  const router = useRouter();
  const { colours, theme } = useTheme();
  const setUserOnboaring = useOnboardingStore((s)=> s.set);
  const USER_TYPES = ["For myself","To support someone else"]; //patient equivalent text, support person equivalent text

  function setUserType(selection: string){
    //this function sets the user type based on selection, and navigates to the appropriate page
    console.log('setUserType', selection, selection === USER_TYPES[0]);
    //check selections and set flags
    const track_health = (selection==USER_TYPES[0]);

    setUserOnboaring({track_health});
    //navigation
    //if patient tagged, do that first.
    //support person onboarding is tacked on after phone number verification, with a check to the pseudo-account flag
    if(track_health){
      //navigate to sex-select
      router.navigate('/(onboarding)/patientOnboarding/sexSelect');
    }
    if(!track_health)
      //navigate to landing page
      router.navigate('/(onboarding)/accountCreatedSplashScreen')

  }
  return (
    <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >

    <ScrollView
      contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
    >
      <View style={[theme.header, theme.leftText]}>
        <Text style={[theme.h5, { color: colours.onSurface }]}>
          How do you plan to use the app?
        </Text>
        <Text style={[theme.body, { color: colours.onSurface }]}>
          You can change this later.
        </Text>
      </View>
      
      <MultipleChoice questionOptions={USER_TYPES} onSubmit={setUserType} />

    </ScrollView>
    </KeyboardAvoidingView>
  );
}

