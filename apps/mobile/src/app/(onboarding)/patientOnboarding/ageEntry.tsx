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

export default function Page() {
  const router = useRouter();
  const { theme } = useTheme();
  
  return (
    <SafeAreaView style={theme.screen}>
      <Text style={theme.text}> Your year of birth</Text>
      <View style={theme.container}>
        <NumberEntry 
        onSubmit={()=>{router.navigate('/(onboarding)/patientOnboarding/diagnosis')}}
        UPPER_BOUND={2025}
        LOWER_BOUND={1900}
        MAX_lENGTH_NUM={4}
        />
      </View>
    </SafeAreaView>
  );
}

