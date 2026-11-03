/**
 * 
 */
import { Text, View, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useTheme } from "../../../../context/ThemeContext";
import { useRouter } from 'expo-router';
import { MultiSelect } from '../../../../components/onboarding/onboardingFields/MultiSelectOnboarding';
import {apiQuestionOption} from '../../../api/django-API';
import { SafeAreaView } from 'react-native-safe-area-context';
import React from 'react';

import { useOnboardingStore } from '../../../store/onboardingStorage';
import { useEffect, useState } from 'react';

export default  function Page() {
  const router = useRouter();
  const { theme, colours } = useTheme();

  const setUserOnboarding = useOnboardingStore((s)=> s.set);
  const {set, reset, ...answers} = useOnboardingStore.getState();

  const [questionOptions, setQuestionOptions] = useState<string[]>([]);
  const [idByText, setIdByText] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(()=>{
    let cancelled = false;
    async function loadOptions(){
      try{
        const options = await apiQuestionOption('select', {
          app_section: 'onboarding',
          question_key: 'pain_type',
        });
        console.log('options', JSON.stringify(options))
        if(!cancelled){
          const active = options
    .filter((o: any) => o.is_active)
    .sort((a: any, b: any) => a.sort_order - b.sort_order);

  setQuestionOptions(active.map((o: any) => o.text));
  setIdByText(Object.fromEntries(active.map((o: any) => [o.text, o.id])));
        }
        console.log('questionOptions', questionOptions)

      }catch(error){
        console.error('Failed to load options', error);
        if(!cancelled) setError('could not load options')
      }finally{
        if (!cancelled) setLoading(false);
      }

    }
    loadOptions();
    return () => {cancelled = true;};
  }, []);

  function setPainTypes(selected: string[]){
    // the server wants QuestionOption ids, not the display text
    const ids = selected.map((text) => idByText[text]).filter(Boolean);

    // read the store at call time and build a new object rather than mutating it
    const { health } = useOnboardingStore.getState();
    if (health) {
    setUserOnboarding({ health: { ...health, pain_types: ids } });
    }

    //on success, next page
    router.navigate('/(onboarding)/patientOnboarding/additionalConditionsTextEntry')
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
              Tell us about the musculoskeletal or chronic pain you're experiencing.
            </Text>

            <Text style={[theme.body, {color: colours.onBackground}]}>Do you have any of the following conditions? You may select multiple.</Text>
      <ScrollView
      showsVerticalScrollIndicator={false}
      >
        <MultiSelect
        questionOptions={questionOptions}
        onSubmit={setPainTypes}
        MIN_SELECTIONS={0}
        MAX_SELECTIONS={questionOptions.length+1}
        />
      </ScrollView>

        </View>
        </ScrollView>
        </KeyboardAvoidingView>

  );
}

