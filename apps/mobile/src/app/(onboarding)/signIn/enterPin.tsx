/**
 * main log-in screen
 * this is where user enters their pin. If their device ID is in storage, we send that, pin and phone number
 * else, we use an SMS verification
 * - if phone number and pin can't be verified, user receives error message
 */
import { useRouter } from 'expo-router';
import { NumberEntry } from '../../../../components/onboarding/onboardingFields/NumberEntryOnboarding';
import { useOnboardingStore } from '../../../store/onboardingStorage';
import { ApiError, login, request_code, apiChangePin } from '../../../api/django-API';
import { HelperText } from "react-native-paper";
import ChangePinModal from '@/components/atomicUI/ChangePinModal';
import { useUser } from '@/context/AuthorisationContext';
import { Text, View, ScrollView, KeyboardAvoidingView, Platform} from 'react-native';
import { useTheme } from '../../../../context/ThemeContext';
import React, { useRef, useState } from 'react';
import {useAppStore} from '../../../store/appStore'
import GetDeviceId from '../../../../components/onboarding/GetDeviceID';
import TextButton from '@/components/atomicUI/TextButton';

const NUM_DIGITS = 6;

export default function Page() {
  const { colours, theme } = useTheme();
  const router = useRouter();
  const { refreshUserType } = useUser();
  const resetOnboarding = useOnboardingStore((s)=> s.reset);
  const completeOnboarding = useAppStore((s)=> s.completeOnboarding);
  const setUserOnboaring = useOnboardingStore((s)=> s.set);
  const [error, setError] = useState<string | null>(null);
  const [changingPin, setChangingPin] = useState(false);
  const phone_number = useOnboardingStore((s) => s.phone_number);

  // prevent multiple button press
  const loggingIn = useRef(false);
  async function attemptLogIn(pin: string) {
    if (loggingIn.current) return;
    loggingIn.current = true;
    try {
      await runLogIn(pin);
    } finally {
      loggingIn.current = false;
    }
  }

  async function runLogIn(pin: string) {
    setError(null);
    setUserOnboaring({ pin }); // kept so phoneVerification can reuse it on a new device

    // read at call time to always get the current phone number
    const { phone_number } = useOnboardingStore.getState();

    try {
      const device_id = await GetDeviceId(); // inside try so a failure shows an error
      const result = await login({ phone_number, pin, device_id });

      completeOnboarding(result.token); // token first so the next call is authenticated
      resetOnboarding();
      await refreshUserType(); // RootNavigator moves to (tabs) once userType is defined
    } catch (e) {
      if (e instanceof ApiError) {
        if (e.status === 403) {
          // new device: send the SMS, then continue to verification
          try {
            await request_code(phone_number);
          } catch (smsError) {
            console.error('Failed to send SMS', smsError);
            setError("We couldn't send a verification code. Try again shortly.");
            return;
          }
          router.navigate('/(onboarding)/signIn/phoneVerification');
          return;
        }
        if (e.status === 401) {
          setError('Invalid phone number or PIN');
          return;
        }
      }
      console.error('login failed', e);
      setError('Something went wrong, please try again.');
    }
  }

  /**
   * Called by the modal once the SMS code is verified and the new PIN is chosen.
   * Throws on failure so the modal can show the error and stay open.
   * The new PIN signs the user in, the same way a successful login does.
   */
  async function handleChangePin(verification_id: string, pin: string) {
    const device_id = await GetDeviceId();
    const { token } = await apiChangePin({
      phone_number,
      verification_id,
      pin,
      device_id
    });
    setChangingPin(false);
    completeOnboarding(token); // token first so the next call is authenticated
    resetOnboarding();
    await refreshUserType(); // RootNavigator moves to (tabs) once userType is defined
  }

  return (
   <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
      >
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
          length={NUM_DIGITS}
          secure
          placeholder="Enter 6-digit PIN"
        />

        <View
            style={[theme.rightItems, { marginVertical: 15, paddingEnd: 20 }]}
          >
            <TextButton
              label="Forgot PIN?"
              onPress={() => setChangingPin(true)}
              fontColour={colours.onBackground}
            />
          </View>
        
      </View>
    </ScrollView>

    <ChangePinModal
        visible={changingPin}
        phone={phone_number}
        onConfirm={handleChangePin}
        onCancel={() => setChangingPin(false)}
      />
    </KeyboardAvoidingView>
  );
}

