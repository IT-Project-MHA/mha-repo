/**
 * User select password screen
 *  - 6 digit code
 *  - button for submit
 *  - submits on field completion
 *  - submits on enter
 */
import { useRouter } from 'expo-router';
import { NumberEntry } from '../../../../components/onboarding/onboardingFields/NumberEntryOnboarding';
import { useOnboardingStore } from '../../../store/onboardingStorage';

import { Text, View, KeyboardAvoidingView, ScrollView, Platform } from 'react-native';
import { useTheme } from '../../../../context/ThemeContext';
import React from 'react';

const NUM_DIGITS = 6;

export default function Page() {
  const { colours, theme } = useTheme();
  const router = useRouter();
  const setUserOnboaring = useOnboardingStore((s)=> s.set);


  function saveCode(pin: string) {
    setUserOnboaring({ pin });
    router.navigate('/(onboarding)/userOnboarding/initialPhoneEntry');
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
              Choose your six-digit passcode
      </Text>
    </View>
          
    <NumberEntry
      onSubmit={saveCode}
      length={NUM_DIGITS}
      secure
      placeholder="Enter 6-digit PIN"
    />

    </ScrollView>
  </KeyboardAvoidingView>
  );
}