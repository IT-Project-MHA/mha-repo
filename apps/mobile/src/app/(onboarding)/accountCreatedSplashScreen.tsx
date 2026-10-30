/**
 * This is the final screen of the onboarding. It has the call to create a token
 * 
 * Sets isOnboarded to true
 */
//verification_id, phone_number, display_name, pin,
//  accepted_terms, accepted_privacy, device_id, track_health (optional), health (optional)

import { useEffect, useRef, useState } from 'react';
import { useUser } from '../../../context/AuthorisationContext';

import { useRouter } from 'expo-router';
import { useOnboardingStore } from '../../store/onboardingStorage';
import { useAppStore } from '../../store/appStore';
import { register_token } from '../../api/django-API';
import Button from '@/components/atomicUI/Button';

import { Text, StyleSheet, View, ScrollView } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { lineThickness } from '../../../constants/layout';
import { useTheme, ColourSet } from '../../../context/ThemeContext';
import { Typography } from '../../../constants/textSize';
import React from 'react';

export default function Page() {
  const { colours, theme } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = createStyles(colours, theme, insets.bottom);
  const router = useRouter();

  // in the case of account creation failing
  const [failed, setFailed] = useState(false);

  const { refreshUserType } = useUser();
  const hasStarted = useRef(false);

  const {set, reset, ...answers} = useOnboardingStore.getState();
  const resetOnboarding = useOnboardingStore((s)=> s.reset);
  const completeOnboarding = useAppStore((s)=> s.completeOnboarding);


  async function createAccount(){
    setFailed(false);
    //takes the data we gathered and sends the register_token request
    try{
      // read answers at call time, before reset
      const { set, reset, ...answers } = useOnboardingStore.getState();

      // takes verification_id, phone_number, display_name, pin, accepted_terms, accepted_privacy,
      // device_id, track_health (optional), health (optional)
      const result = await register_token(answers);
      completeOnboarding(result.token); // saves token first
      resetOnboarding();
      await refreshUserType(); // now apiMyRole() can authenticate
      //on success,we go to the landing page (tabs)
      // RootNavigator moves to (tabs) when userType becomes defined
    } catch (error){
      console.error('register token failed:', error)
      setFailed(true);
    }
  }

  // runs once when the screen is loaded
  useEffect(() => {
    if (hasStarted.current) return;
    hasStarted.current = true;
    createAccount();
  }, []);

  return (
    <ScrollView style={theme.screen}>

      {failed ? (
  <>
    <View style={[theme.header, styles.title]}>
      <Text style={styles.heading}>We couldn't create your account</Text>
    </View>
    <View style={theme.clearContainer}>
      <Text style={styles.subheading}>
        If you already have an account with this number, sign in instead.
      </Text>
      <Button
        label="Go to Sign In"
        onPress={() => {
          resetOnboarding();
          router.replace('/(onboarding)/signIn/signIn');
        }}
        buttonType="roundButton"
      />
      <Button
        label="Start again"
        onPress={() => {
          resetOnboarding();
          router.replace('/(onboarding)');
        }}
        buttonType="roundButton"
      />
    </View>
  </>
) : (
  /* existing "Registering..." block */
  <View style={styles.bottomBar}>
    <View style={[theme.header, styles.title]}>
        <Text style={styles.subheading}>Done!</Text>
        <Text style={styles.heading}>Registering...</Text>
      </View>

        <Text style={styles.subheading}>Hold tight while we process this...</Text>
      </View>
)}

    </ScrollView>
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

