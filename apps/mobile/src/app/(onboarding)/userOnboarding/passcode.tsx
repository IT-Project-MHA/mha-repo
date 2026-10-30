/**
 * User select password screen
 *  - 6 digit code
 *  - button for submit
 *  - submits on field completion
 *  - submits on enter
 * 
 */
import { useRouter } from 'expo-router';
import { NumberEntry } from '../../../../components/answerFields/NumberEntry';
import { useOnboardingStore } from '../../../store/onboardingStorage';

import { Text, View, ScrollView } from 'react-native';
import { useTheme } from '../../../../context/ThemeContext';
import React from 'react';

const NUM_DIGITS = 6;

export default function Page() {
  const { colours, theme } = useTheme();
  const router = useRouter();
  const setUserOnboaring = useOnboardingStore((s)=> s.set);


  function saveCode(pin: number){
    setUserOnboaring({pin});
    router.navigate('/(onboarding)/userOnboarding/initialPhoneEntry')
  }

  return (
    <ScrollView stickyHeaderIndices={[0]}>
      <View>
   
      <View style={[theme.header, theme.leftText]}>
        <Text style={[theme.h5, {color: colours.onSurface}]}>Pick your six digit pin</Text>
      </View>

      <NumberEntry 
        onSubmit={saveCode}
        UPPER_BOUND={999999}
        LOWER_BOUND={0}
        MAX_lENGTH_NUM={NUM_DIGITS}
      />
 
    </View>
    </ScrollView>
  );
}