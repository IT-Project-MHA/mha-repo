/**
 * asks for "Your sex"
 * options ["Female", "Male", "Prefer not to say"]
 * uses the multiple choice framework
 * continue takes us to yearOfBirth page
 */


import { View, Text } from 'react-native';
import { useTheme } from "../../../../context/ThemeContext";
import { useRouter } from 'expo-router';
import { MultipleChoice } from '../../../../components/answerFields/MultipleChoice';
import { SafeAreaView } from 'react-native-safe-area-context';
import React from 'react';

import { useOnboardingStore } from '../../../store/onboardingStorage';

export default function Page() {
  const router = useRouter();
  const { theme } = useTheme();

  const setUserOnboaring = useOnboardingStore((s)=> s.set);
  const {set, reset, ...answers} = useOnboardingStore.getState();

  const questionOptions = ["Yes, I have", "No, I haven't"];

  function setHasDiagnosis(selection: string){

    const hasDiagnosis = (selection==questionOptions[0])
    //append option to health list
    let health = answers.health;
    if(health!=undefined)
      health.has_diagnosis = hasDiagnosis;
    
    setUserOnboaring({health})
    //on success, next page
    router.navigate('/(onboarding)/patientOnboarding/dropDownConditions')
  }

  return (
    <SafeAreaView style={theme.screen}>
      
      <Text style={theme.fontOnBackground}>Do you have a musculoskeletal (for example arthritis, back pain, gout) or chronic pain diagnosis from your doctor?</Text>

        <MultipleChoice 
        questionOptions={questionOptions}
        onSubmit={setHasDiagnosis}
        />

      <Text style={theme.fontOnBackground}> No diagnosis? No problem! You know your body and how you feel so being Health MPowered is for you :)</Text>
    </SafeAreaView>
  );
}

