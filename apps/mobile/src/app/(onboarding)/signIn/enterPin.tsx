/**
 * main log-in screen
 * this is where user enters their pin. If their device ID is in storage, we send that, pin and phone number
 * else, we use an SMS verification
 * 
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { NumberEntry } from '../../../../components/answerFields/NumberEntry';
import Button from '../../../../components/atomicUI/Button';
import { useOnboardingStore } from '../../../store/onboardingStorage';
import { ApiError, login } from '../../../api/django-API';

import { Text, StyleSheet, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { lineThickness } from '../../../../constants/layout';
import { useTheme, ColourSet } from '../../../../context/ThemeContext';
import { Typography } from '../../../../constants/textSize';
import React from 'react';
import {useAppStore} from '../../../store/appStore'

import { HelperText } from 'react-native-paper';
import GetDeviceId from '../../../../components/onboarding/GetDeviceID';


const NUM_DIGITS = 6;

export default function Page() {
  const { colours, theme } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = createStyles(colours, theme, insets.bottom);
  const router = useRouter();

  const resetOnboarding = useOnboardingStore((s)=> s.reset);
  const completeOnboarding = useAppStore((s)=> s.completeOnboarding);
  const setUserOnboaring = useOnboardingStore((s)=> s.set);
  const {...info} = useOnboardingStore.getState();

  const [error, setError] = useState<string | null>(null);

  async function attemptLogIn(pin: number){
    setUserOnboaring({pin});

    const device_id = await GetDeviceId();
    console.log('device_id', device_id, typeof device_id)
    const values = {
      phone_number: info.phone_number,
      pin: pin,
      device_id: device_id,
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
      
      if(error instanceof ApiError){
        
        if(error.status==403){
          //if 403 continue to verification
          router.navigate('/(onboarding)/signIn/phoneVerification')
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
    <SafeAreaView style={theme.screen}>
      <View style={[theme.header, styles.title]}>
        <Text style={styles.subheading}></Text>
        <Text style={styles.heading}>Enter your six digit pin</Text>
      </View>

      <View style={styles.bottomBar}>
        <HelperText type='error' visible={!!error}>
          {error}
        </HelperText>
        <NumberEntry 
        onSubmit={attemptLogIn}
        UPPER_BOUND={999999}
        LOWER_BOUND={0}
        MAX_lENGTH_NUM={NUM_DIGITS}
        />
      </View>
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

