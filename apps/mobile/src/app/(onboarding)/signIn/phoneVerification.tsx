/**
 * entry page for a texted phone code
 * -button for submit
 * -submits on field completion
 * -submits on enter
 * 
 * clickable text for resending code
 */
import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { NumberEntry } from '../../../../components/answerFields/NumberEntry';
import Button from '../../../../components/atomicUI/Button';
import { useOnboardingStore } from '../../../store/onboardingStorage';
import { useAppStore } from '../../../store/appStore';
import { verify_code, request_code, login, ApiError } from '../../../api/django-API';
import { useUser } from '@/context/AuthorisationContext';

import { Text, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme, ColourSet } from '../../../../context/ThemeContext';
import { Typography } from '../../../../constants/textSize';
import GetDeviceId from '../../../../components/onboarding/GetDeviceID';

const NUM_DIGITS = 6;

export default function Page() {
  const { colours, theme } = useTheme();
  const router = useRouter();
  const { refreshUserType } = useUser();

  const {set, reset, ...answers} = useOnboardingStore.getState();
  const phone_number = answers.phone_number;

  const resetOnboarding = useOnboardingStore((s)=> s.reset);
  const completeOnboarding = useAppStore((s)=> s.completeOnboarding);
  const setUserOnboaring = useOnboardingStore((s)=> s.set);

  const [error, setError] = useState<string | null>(null);

  async function attemptLogIn(verification_number: string){
    setError(null);

    try{
      const { verification_id } = await verify_code(phone_number, verification_number);
      const { pin } = useOnboardingStore.getState(); // read at call time
      const device_id = await GetDeviceId();
      
      const result = await login({ phone_number, pin, device_id, verification_id });
      resetOnboarding();  
      //set the onboarded flag
      completeOnboarding(result.token);

      await refreshUserType(); 

    }catch (error){
      console.error('login failed', error);
      setError('Something went wrong, please try again.');
    }
    
  }

  async function smsVerifier(code: string){
    //on success,we go to the userType selection page

    //and send the API request
    //fields: phone_number, display_name, email
    try{
      //verify code
      const result = await verify_code(phone_number, code);
      const verification_id = result.verification_id;
      setUserOnboaring({verification_id});

    }catch (error){
      //wrong code or some such
      console.error('SMS verification failed', error)
    }
  }

  async function resendCode(){
    try
    {
      await request_code(phone_number);
      router.navigate('/(onboarding)/signIn/phoneVerification');
    }
    catch(error)
    {
      console.error('Failed to send SMS', error);
      //FIX: show user an error message of some sort
    }

  }

  return (
    <SafeAreaView style={theme.screen}>
      <View style={[theme.header]}>
        <Text style={[theme.h6]}>SMS incoming...</Text>
        <Text style={[theme.h6]}>If there's a problem check your number and resend</Text>
      </View>

      <View style={[theme.h6]}>
        <NumberEntry 
        onSubmit={attemptLogIn}
        UPPER_BOUND={999999}
        LOWER_BOUND={0}
        MAX_lENGTH_NUM={NUM_DIGITS}
        />
        <Button
        label="Resend Code"
        onPress={resendCode}
        buttonType='roundButton'
        />
        <Text style={[theme.body, {color: colours.onBackground}]}>We've sent a code to {answers.phone_number}</Text>
      </View>


      {/**resend or change phone number code is sent to */}


    </SafeAreaView>
  );
}

