/**
 * entry page for a texted phone code
 * 
 * button for submit
 * submits on field completion
 * submits on enter
 * 
 * clickable text for resending code
 * 
 * Assuming four digit code
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { Text, View } from 'react-native';
import { NumberEntry } from '../../../../components/answerFields/NumberEntry';
import Button from '../../../../components/atomicUI/Button';
import { useTheme } from "../../../../context/ThemeContext";
import { completeUserOnboarding } from '../../../api/onboarding_api_helpers';
import { useOnboardingUserStore } from '../../store/onboardingStorage';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Page() {
  const router = useRouter();
  const { theme } = useTheme();


  async function smsVerifier(code: string){
    //on success,we go to the userType selection page

    //and send the API request
    //fields: phone_number, display_name, email
    const {set, reset, ...answers} = useOnboardingUserStore.getState();
    try{
      //await completeUserOnboarding(answers); FIX: UNCOMMENT
      reset();
      router.navigate("/(onboarding)/userType");
    }catch(error){
      console.error('Failed to create user account', error);
    }
    
    

    
    
  }
  return (
    <SafeAreaView style={theme.screen}>
      <Text style={theme.text}>Verify your mobile</Text>
      <View style={theme.container}>
        <NumberEntry 
        onSubmit={smsVerifier}
        UPPER_BOUND={9999}
        LOWER_BOUND={0}
        MAX_lENGTH_NUM={4}
        />
      </View>
      <Text style={theme.text}>We've sent a code to FIX: ADD THEIR PHONE NUMBER HERE</Text>

      {/**resend or change phone number code is sent to */}
      <Button
      label="I didn't recieve a code"
      onPress={()=>{/**FIX: implement */}}
      buttonType='secondaryButton'
      />

    </SafeAreaView>
  );
}

