/**
 * asks for "Your sex"
 * options ["Female", "Male", "Prefer not to say"]
 * uses the multiple choice framework
 * continue takes us to yearOfBirth page
 */


import { useRouter } from 'expo-router';
import { Text, View } from 'react-native';
import { MultipleChoice } from '../../../../components/answerFields/MultipleChoice';
import { useTheme } from "../../../../context/ThemeContext";
import { useOnboardingStore } from '../../store/onboardingStorage';
import { SafeAreaView } from 'react-native-safe-area-context';
import React from 'react';

import {apiQuestionOption, apiQuestionOptionOrdered} from '../../../api/django-API'
import { useState, useEffect } from 'react';

export default function Page() {
  const router = useRouter();
  const { theme } = useTheme();
  const setUserOnboaring = useOnboardingStore((s)=> s.set);

  const {set, reset, ...answers} = useOnboardingStore.getState();
  

  const [questionOptions, setQuestionOptions] = useState<string[]>([]);


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
          setQuestionOptions(
            options
            .filter((o: any) => o.is_active)
            .sort((a: any, b: any) => a.sort_order - b.sort_order)
            .map((o: any) => o.text)
          );
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

  function setSex(sex: string){
    //append option to health list
    let health = answers.health;
    if(health!=undefined)
      health.assigned_gender_at_birth = sex;
    
    setUserOnboaring({health})
    //on success, next page
    router.navigate('/(onboarding)/patientOnboarding/ageEntry')
  }


  return (
    <SafeAreaView style={theme.screen}>
      <Text style={theme.fontOnBackground}>Cool!</Text>
      <Text style={theme.fontOnBackground}>What's your assigned gender at birth?</Text>
      <View>
        <MultipleChoice 
        questionOptions={questionOptions}
        onSubmit={setSex}
        />
      </View>
      <View>
        {loading ? (
          <Text style={theme.fontOnBackground}>Loading...</Text>
        ) : error ? (
          <Text style={theme.fontOnBackground}>{error}</Text>
        ) : (
          <MultipleChoice questionOptions={questionOptions} onSubmit={setSex} />
        )}
      </View>
    </SafeAreaView>
  );
}

