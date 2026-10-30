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
import { NumberEntry } from '../../../../components/answerFields/NumberEntry';
import Button from '../../../../components/atomicUI/Button';
import { useOnboardingStore } from '../../../store/onboardingStorage';
import { useAppStore } from '../../../store/appStore';
import { verify_code, request_code, login, ApiError } from '../../../api/django-API';

import { Text, StyleSheet, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { lineThickness } from '../../../../constants/layout';
import { useTheme, ColourSet } from '../../../../context/ThemeContext';
import { Typography } from '../../../../constants/textSize';
import React from 'react';
import GetDeviceId from '../../../../components/onboarding/GetDeviceID';





const NUM_DIGITS = 6;

export default function Page() {
  const { colours, theme } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = createStyles(colours, theme, insets.bottom);
  const router = useRouter();

  const {set, reset, ...answers} = useOnboardingStore.getState();
  const phone_number = answers.phone_number;

  const resetOnboarding = useOnboardingStore((s)=> s.reset);
  const completeOnboarding = useAppStore((s)=> s.completeOnboarding);
  const setUserOnboaring = useOnboardingStore((s)=> s.set);
  const {...info} = useOnboardingStore.getState();

  const [error, setError] = useState<string | null>(null);

  async function attemptLogIn(verification_number: string){

    smsVerifier(verification_number);

    const values = {
      phone_number: info.phone_number,
      pin: info.pin,
      device_id: await GetDeviceId(),
      verification_id: info.verification_id,
    }
    try{
      const result = await login(values);
      const token = result.token;
      
      resetOnboarding();
      //set the onboarded flag
      completeOnboarding(token);

      //continue to landing page
      router.navigate('/(tabs)')

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
      <View style={[theme.header, styles.title]}>
        <Text style={styles.subheading}>SMS incoming...</Text>
        <Text style={styles.heading}>If there's a problem check your number and resend</Text>
      </View>

      <View style={styles.bottomBar}>
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
        <Text style={styles.subheading}>We've sent a code to {answers.phone_number}</Text>
      </View>


      {/**resend or change phone number code is sent to */}


    </SafeAreaView>
  );
}

function createStyles(colours: ColourSet, text: Typography, bottomInset: number) {
  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colours.background,
    },

    content: {
      paddingBottom: 200 + bottomInset,
      gap: 38,
    },

    title: {
      marginBottom: -19,
    },

    card: {
      gap: 12,
    },

    cardContent: {
      paddingHorizontal: '5%',
      paddingBottom: 5,
    },

    bottomBar: {
      position: 'absolute',
      left: '7.5%',
      width: '85%',
      bottom: 120 + bottomInset,
      gap: 8,
    },

    heading: {
      ...text.h6,
      color: colours.onSurface,
      paddingHorizontal: '5%',
    },

    subheading: {
      ...text.small,
      color: colours.onBackground,
      paddingHorizontal: '5%',
      marginTop: 4,
    },

    label: {
      marginTop: 29,
      marginBottom: 19,
    },

    firstLabel: {
      marginTop: 5,
    },

    field: {
      height: 40,
      paddingVertical: 5,
      paddingHorizontal: 10,
      marginHorizontal: 8,
      borderWidth: 1,
      borderColor: colours.onSurface,
      justifyContent: 'center',
    },

    input: {
      ...text.body,
      color: colours.onSurface,
    },

    error: {
      ...text.small,
      borderWidth: 1,
      borderRadius: 8,
      paddingVertical: 6,
      paddingHorizontal: 12,
      backgroundColor: colours.background,
      overflow: 'hidden',
    },

    dropdown: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },

    optionList: {
      marginTop: 8,
      marginHorizontal: 8,
      borderWidth: 1,
      borderColor: colours.onSurface,
      overflow: 'hidden',
    },

    optionRow: {
      paddingVertical: 10,
      paddingHorizontal: 12,
    },

    divider: {
      borderTopWidth: lineThickness,
      borderTopColor: colours.ex2,
    },

    selectedRow: {
      backgroundColor: colours.secondary,
    },

    selectedText: {
      color: colours.onSecondary,
    },
  });
}

