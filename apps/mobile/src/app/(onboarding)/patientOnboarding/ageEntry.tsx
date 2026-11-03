/**
 * entry page for year of birth
 * 
 */
import { Text, View, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useTheme } from "../../../../context/ThemeContext";
import { NumberEntry } from '../../../../components/onboarding/onboardingFields/NumberEntryOnboarding';
import { useRouter } from 'expo-router';
import React from 'react';
import type { Health } from '../../../store/onboardingStorage';

import { useOnboardingStore } from '../../../store/onboardingStorage';

export default function Page() {
  const router = useRouter();
  const { theme, colours } = useTheme();
  const setUserOnboaring = useOnboardingStore((s)=> s.set);
  const {set, reset, ...answers} = useOnboardingStore.getState();

  const NUM_DIGITS = 4;
  const CURRENT_YEAR = 2026;

  function setAge(birthYear: string) {
    const { health, set } = useOnboardingStore.getState();
    set({ health: { ...(health ?? {}), birth_year: Number(birthYear) } as Health });
    router.navigate('/(onboarding)/patientOnboarding/diagnosis');
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
          What year were you born?
        </Text>
        <NumberEntry
                  onSubmit={setAge}
                  length={NUM_DIGITS}
                  placeholder="e.g. 1985"
                  validate={(v) =>
            Number(v) >= 1900 && Number(v) <= CURRENT_YEAR
              ? null
              : `Enter a year between 1900 and ${CURRENT_YEAR}.`
          }
        />
    </View>
    </ScrollView>
    </KeyboardAvoidingView>
  );
}

