/**
 * Asks whether the user has a MSK diagnosis
 */
import { Text, View, ScrollView, KeyboardAvoidingView, Platform }from 'react-native';
import { useTheme } from "../../../../context/ThemeContext";
import { useRouter } from 'expo-router';
import { MultipleChoice } from '../../../../components/onboarding/onboardingFields/MultipleChoiceOnboarding';
import React from 'react';

import { useOnboardingStore } from '../../../store/onboardingStorage';

export default function Page() {
  const router = useRouter();
  const { theme, colours } = useTheme();

  const setUserOnboaring = useOnboardingStore((s)=> s.set);
  const {set, reset, ...answers} = useOnboardingStore.getState();

  const QUESTION_OPTIONS = ["Yes, I have", "No, I haven't"];

  function setHasDiagnosis(selection: string){

    const hasDiagnosis = (selection==QUESTION_OPTIONS[0])

    //append option to health list
    let health = answers.health;
    if(health!=undefined)
      health.has_diagnosis = hasDiagnosis;
    
    setUserOnboaring({health})
    //on success, next page
    router.navigate('/(onboarding)/patientOnboarding/dropDownConditions')
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
      <View style={[theme.header, theme.leftText] }>
          <Text style={[theme.h5, {color: colours.onSurface}]}>Do you have a musculoskeletal or chronic pain diagnosis?</Text>
          <Text style={[theme.small, { color: colours.onBackground }]}>
          No diagnosis? No problem. You know your body. Being Health MPowered is for you.
        </Text>
      </View>
        
        <MultipleChoice 
        questionOptions={QUESTION_OPTIONS}
        onSubmit={setHasDiagnosis}
        />

        </ScrollView>
        </KeyboardAvoidingView>
  );
}

