/**
 * First page of patient onboarding.
 * asks for phone field
 * sends API request for sms code. Does not proceed until success
 * FIX LATER: add modal for terms of use and privacy policy.
 */

import { useRouter } from 'expo-router';
import { PhoneField } from '../../../../components/onboarding/PhoneField';
import { useOnboardingUserStore } from '../../store/onboardingStorage';
import {request_code} from '../../../api/django-API'

import { Text, StyleSheet, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { lineThickness } from '../../../../constants/layout';
import { useTheme, ColourSet } from '../../../../context/ThemeContext';
import { Typography } from '../../../../constants/textSize';
import React from 'react';




export default function Page() {
  const { colours, theme } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = createStyles(colours, theme, insets.bottom);
  const router = useRouter();
  const setUserOnboaring = useOnboardingUserStore((s)=> s.set);

  async function setPhone(phone_number: string){
    setUserOnboaring({phone_number});
    try
    {
      await request_code(phone_number);
      router.navigate('/(onboarding)/userOnboarding/verifyPhone');
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
        <Text style={styles.subheading}>Cool!</Text>
        <Text style={styles.heading}>Add your mobile</Text>
      </View>
      <View style = {styles.bottomBar}>
        <PhoneField
        onSubmit={setPhone}
        />
        <View style={styles.label}> 
          <Text style={styles.subheading}>Must be an Australian mobile phone number, starting in 04</Text>
        </View>
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

