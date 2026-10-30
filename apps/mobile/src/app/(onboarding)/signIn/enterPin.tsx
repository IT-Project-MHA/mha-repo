/**
 * main log-in screen
 * this is where user enters their pin. If their device ID is in storage, we send that, pin and phone number
 * else, we use an SMS verification
 * - if phone number and pin can't be verified, user receives error message
 * 
 */
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { NumberEntry } from '../../../../components/answerFields/NumberEntry';
import { useOnboardingStore } from '../../../store/onboardingStorage';
import { ApiError, login } from '../../../api/django-API';
import { HelperText } from "react-native-paper";


import { useUser } from '@/context/AuthorisationContext';

import { Text, View, ScrollView } from 'react-native';
import { useTheme } from '../../../../context/ThemeContext';
import React from 'react';
import {useAppStore} from '../../../store/appStore'

import GetDeviceId from '../../../../components/onboarding/GetDeviceID';


const NUM_DIGITS = 6;

export default function Page() {
  const { colours, theme } = useTheme();
  const router = useRouter();

  const { refreshUserType } = useUser();
  const resetOnboarding = useOnboardingStore((s)=> s.reset);
  const completeOnboarding = useAppStore((s)=> s.completeOnboarding);
  const setUserOnboaring = useOnboardingStore((s)=> s.set);
  const [error, setError] = useState<string | null>(null);

  async function attemptLogIn(pin: number){
    setError(null);
    setUserOnboaring({pin});

    // read at call time to always get the current phone number
    const { phone_number } = useOnboardingStore.getState();
    const device_id = await GetDeviceId();

    try{
      const result = await login({ phone_number, pin, device_id });
      const token = result.token;

      //set the onboarded flag
      completeOnboarding(token); // token first so next call authenticated
      resetOnboarding();
      await refreshUserType(); // RootNavigator moves to (tabs) once userType is defined

    } catch (error){
      
      if(error instanceof ApiError){
    
        if(error.status==403){
          //if 403 continue to verification (new device)
          router.navigate('/(onboarding)/signIn/phoneVerification')
          return;
        }
        if(error.status == 401){
          //401 tell user invalid credentials
          setError('Invalid phone number or PIN')
          return;
        }
      }
      console.error('login failed', error);
      setError('Something went wrong, please try again.')
    }
  }

  return (
    <ScrollView stickyHeaderIndices={[0]}>
      <View style={[theme.header, theme.leftText]}>
        <Text style={[theme.h5, { color: colours.onSurface }]}>
          Enter your six digit pin
        </Text>
      </View>

      <View>

        <HelperText type="error" visible={!!error} style={theme.centerText}>
          {error}
        </HelperText>
       
        <NumberEntry 
        onSubmit={attemptLogIn}
        UPPER_BOUND={999999}
        LOWER_BOUND={0}
        MAX_lENGTH_NUM={NUM_DIGITS}
        />
      </View>
    </ScrollView>
  );
}

