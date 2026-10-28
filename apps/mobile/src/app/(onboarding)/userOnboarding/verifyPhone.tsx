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
import { useOnboardingUserStore } from '../../store/onboardingStorage';
import { verify_code, register_token } from '../../../api/django-API';

import { Text, StyleSheet, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { lineThickness } from '../../../../constants/layout';
import { useTheme, ColourSet } from '../../../../context/ThemeContext';
import { Typography } from '../../../../constants/textSize';
import React from 'react';


import * as SecureStore from 'expo-secure-store'
import * as Crypto from 'expo-crypto'

const NUM_DIGITS = 6;

export default function Page() {
  const { colours, theme } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = createStyles(colours, theme, insets.bottom);
  const router = useRouter();

  const {set, reset, ...answers} = useOnboardingUserStore.getState();
  const phone_number = answers.phone_number;
  const display_name = answers.display_name;
  const pin = '000000'; //FIX LATER, add page

  async function getDeviceId(){
    let id = await SecureStore.getItemAsync('device_id');
    if(!id){
      id = Crypto.randomUUID();
      await SecureStore.setItemAsync('device_id', id);
    }
    return id;
  }
  async function smsVerifier(code: string){
    //on success,we go to the userType selection page

    //and send the API request
    //fields: phone_number, display_name, email
    try{
      //verify code
      const result = await verify_code(phone_number, code);
      const verification_id = result.verification_id;

      router.navigate('/(onboarding)/patientOnboarding/userType');
      
    }catch (error){
      //wrong code or some such
      console.error('SMS verification failed', error)
    }

  }
  return (
    <SafeAreaView style={theme.screen}>
      <View style={[theme.header, styles.title]}>
        <Text style={styles.subheading}>Cool!</Text>
        <Text style={styles.heading}>Verify your mobile</Text>
      </View>

      <View style={styles.bottomBar}>
        <NumberEntry 
        onSubmit={smsVerifier}
        UPPER_BOUND={999999}
        LOWER_BOUND={0}
        MAX_lENGTH_NUM={NUM_DIGITS}
        />
        <Button
        label="I didn't recieve a code"
        onPress={()=>{/**FIX: implement */}}
        buttonType='roundSecondaryButton'
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
      borderTopColor: colours.secondary2,
    },

    selectedRow: {
      backgroundColor: colours.secondary,
    },

    selectedText: {
      color: colours.onSecondary,
    },
  });
}

