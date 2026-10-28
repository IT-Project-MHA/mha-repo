/**
 * asks for "Your sex"
 * options ["Female", "Male", "Prefer not to say"]
 * uses the multiple choice framework
 * continue takes us to yearOfBirth page
 */


import { useRouter } from 'expo-router';
import { Text, View } from 'react-native';
import { MultipleChoice } from '../../../../components/answerFields/MultipleChoice';
import { useTheme } from "../../../../context/ThemeContext";
import { useOnboardingStore } from '../../store/onboardingStorage';
import { SafeAreaView } from 'react-native-safe-area-context';
import React from 'react';

import {apiQuestionOption} from '../../../api/django-API'


export default function Page() {
  const router = useRouter();
  const { theme } = useTheme();
  const setPatientOnboaring = useOnboardingStore((s)=> s.set);

  let questionOptions=["Error: undefined"]
  async function getConditions(){
      questionOptions = await apiQuestionOption('select', {
      app_section: 'ONBOARDING',
      question_key: 'pain_type',
    });
  }
  getConditions();

  function setSex(){
    //add option to health list
    //on success, next page
    router.navigate('/(onboarding)/patientOnboarding/ageEntry')
  }


  return (
    <SafeAreaView style={theme.screen}>
      <Text style={theme.fontOnBackground}>Hello {'FIX: add displayName'}</Text>
      <Text style={theme.fontOnBackground}>A few quick questions so we can make things more relevant for you</Text>
      <View>
        <MultipleChoice 
        questionOptions={questionOptions}
        onSubmit={setSex}
        />
      </View>
    </SafeAreaView>
  );
}

