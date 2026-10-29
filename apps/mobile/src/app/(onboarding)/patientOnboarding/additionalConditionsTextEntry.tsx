/**
 * last page of patient flow. If support person flag then go to there, else go to home
 * asks for name
 * directs to terms and conditions page
 * FIX: allow skip
 */


import { View, Text } from 'react-native';

import { useTheme } from "../../../../context/ThemeContext";
import { TextEntry } from '../../../../components/answerFields/TextEntry';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import React from 'react';

import { useOnboardingStore } from '../../store/onboardingStorage';

export default function Page() {
  const router = useRouter();
  const { theme } = useTheme();

  const setUserOnboaring = useOnboardingStore((s)=> s.set);
  const {set, reset, ...answers} = useOnboardingStore.getState();

  function setAdditionalConditions(additionalConditions: string){


    //append option to health list
    let health = answers.health;
    if(health!=undefined)
      health.other_conditions = additionalConditions;
    
    setUserOnboaring({health})
    //on success, next page
    router.navigate('/(onboarding)/accountCreatedSplashScreen')
  }

  return (
    <SafeAreaView style={theme.screen}>
      <Text style={theme.fontOnBackground}>Do you have any other conditions?</Text>
      <View style={theme.container}>
        <TextEntry 
        onSubmit={setAdditionalConditions}
        placeholder='Type conditions or symptoms that you know'
        keyboardType='default'
        />
      </View>
    </SafeAreaView>
  );
}

