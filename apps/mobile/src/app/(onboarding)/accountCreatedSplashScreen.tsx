/**
 * This is the final screen of the onboarding. It has the call to create a token.
 * If sign in has failed, user is directed back to login / start again.
 */
import { useEffect, useRef, useState } from 'react';
import { useUser } from '../../../context/AuthorisationContext';

import { useRouter } from 'expo-router';
import { useOnboardingStore } from '../../store/onboardingStorage';
import { useAppStore } from '../../store/appStore';
import { register_token } from '../../api/django-API';

import { Text, View, StyleSheet, Pressable } from 'react-native';
import { useTheme, ColourSet } from '../../../context/ThemeContext';
import { Typography } from '../../../constants/textSize';
import React from 'react';

export default function Page() {
  const { colours, theme } = useTheme();
  const styles = createStyles(colours);
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
    <View style={[theme.screen, { flex: 1, justifyContent: "center" }]}>

      {failed ? (
    <>
          <View style={[theme.header, theme.leftText] }>
            <Text style={[theme.h5, {color: colours.onSurface}]}>Sorry, we couldn't create your account</Text>
            <Text style={[theme.body, {color: colours.onSurface}]}>If you already have an account with this number, sign in instead.</Text>
          </View>

    <View style={[theme.clearContainer, {gap: 30}]}>
      <Pressable 
            onPress={() => {
          resetOnboarding();
          router.replace('/(onboarding)/signIn/signIn');
        }}
            style={styles.button}>
        <Text style={[theme.h6, styles.buttonText, { color: colours.onSurface }]}>Sign In</Text>
        </Pressable>

        <Pressable 
            onPress={() => {
          resetOnboarding();
          router.replace('/(onboarding)');
        }}
            style={styles.button}>
        <Text style={[theme.h6, styles.buttonText, { color: colours.onSurface }]}>Start Again</Text>
      </Pressable>
    </View>
  </>
) : (
        <View style={[theme.header, theme.leftItems]}>
          <Text style={[theme.h5, { color: colours.onSurface }]}>
            Done! 
          </Text>
          <Text style={[theme.body, { color: colours.onSurface }]}>
            Registering...
          </Text>
          <Text style={[theme.body, { color: colours.onSurface }]}>
            Hold tight while we process this...
          </Text>
        </View>
  )}
  </View>

  );
  }

function createStyles(
  colours: ColourSet,
) {
  return StyleSheet.create({
    button: {
      height: 60,
      width: "100%",
      borderRadius: 100,
      justifyContent: "center",
      backgroundColor: colours.primary,
    },
    buttonText: { textAlign: "center" },
  });
}
