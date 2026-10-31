/**
 * entry page for year of birth
 * 
 */


import { View, Text } from 'react-native';
import { PhoneField } from '../../../../components/onboarding/PhoneField';
import { useTheme } from "../../../../context/ThemeContext";
import { NumberEntry } from '../../../../components/answerFields/NumberEntry';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import React from 'react';

import { useOnboardingStore } from '../../../store/onboardingStorage';

export default function Page() {
  const router = useRouter();
  const { theme } = useTheme();
  const setUserOnboaring = useOnboardingStore((s)=> s.set);
  const {set, reset, ...answers} = useOnboardingStore.getState();

  function setAge(birthYear: number){
    //append option to health list
    let health = answers.health;
    if(health!=undefined)
      health.birth_year = birthYear;
    
    setUserOnboaring({health})
    //on success, next page
    router.navigate('/(onboarding)/patientOnboarding/diagnosis')
  }
  return (
    <SafeAreaView style={theme.screen}>
      <Text style={theme.fontOnBackground}> Your year of birth</Text>
      <View style={theme.container}>
        <NumberEntry 
        onSubmit={setAge}
        UPPER_BOUND={2025}
        LOWER_BOUND={1900}
        MAX_lENGTH_NUM={4}
        />
      </View>
    </SafeAreaView>
  );
}

