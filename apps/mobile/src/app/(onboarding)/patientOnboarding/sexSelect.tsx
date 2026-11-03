/**
 * asks for "Your sex"
 * options ["Female", "Male", "Prefer not to say"]
 * uses the multiple choice framework
 * continue takes us to yearOfBirth page
 */
import { useRouter } from 'expo-router';
import { Text, View, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { MultipleChoice } from '../../../../components/onboarding/onboardingFields/MultipleChoiceOnboarding';
import { useTheme } from "../../../../context/ThemeContext";
import { useOnboardingStore } from '../../../store/onboardingStorage';
import React from 'react';
import type { Health } from '../../../store/onboardingStorage';

import { apiAssignedGender } from '../../../api/django-API'
import { useState, useEffect } from 'react';

type Choice = { value: string; label: string };

export default function Page() {
  const router = useRouter();
  const { theme, colours } = useTheme();

  const {set, reset, ...answers} = useOnboardingStore.getState();
  
  const [choices, setChoices] = useState<Choice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const result = await apiAssignedGender();
        if (!cancelled) setChoices(result);
      } catch (e) {
        console.error('Failed to load options', e);
        if (!cancelled) setError("Couldn't load options. Check your connection and try again.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  function setSex(label: string) {
    const choice = choices.find((c) => c.label === label);
    if (!choice) return;

    const { health, set } = useOnboardingStore.getState();
    set({ health: { ...(health ?? {}), assigned_gender_at_birth: choice.value } as Health });
    router.navigate('/(onboarding)/patientOnboarding/ageEntry');
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
          What is your assigned gender at birth?
        </Text>
      </View>
      {loading && (
        <Text style={[theme.body, { color: colours.onSurface }]}>Loading...</Text>
      )}
      {!!error && (
        <Text style={[theme.body, { color: colours.onSurface }]} accessibilityRole="alert">
          {error}
        </Text>
      )}
      {!loading && !error && (
        <MultipleChoice 
          questionOptions={choices.map((c) => c.label)} 
          onSubmit={setSex} />
          
      )}
    </ScrollView>
    </KeyboardAvoidingView>
  );
}

