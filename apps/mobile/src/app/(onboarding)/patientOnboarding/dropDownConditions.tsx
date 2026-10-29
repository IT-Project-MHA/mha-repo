/**
 * page with a drop-down for conditions in figma design
 * I'm thinking I can re-use the multi-select though, as there is no search functionality in the figma to my understanding, and the
 * list is maybe just short enough to get away with that. Thinking it would be good to go through and cut particularly rare conditions, 
 * but MHA may specialize in those conditions so talk to client about this.
 * From https://www.aihw.gov.au/reports/musculoskeletal-conditions/chronic-musculoskeletal-conditions
 * 
 * 4.0 million (15.7%) people were living with a back problem
 * 3.7 million (14.5%) were living with arthritis (includes osteoarthritis, rheumatoid arthritis, and other types of arthritis)
 * 854,000 (3.4%) were living with osteoporosis or osteopenia
 * 224,000 (0.9%) were living with gout.
 * Fibromyalgia is also quite common ~3%
 * 
 * Figma list:
 * ["Arthritis", "Ankylosing spondylitis", "Back pain", "Baker’s cyst", "Bursitis", "Foot related conditions", "Fibromyalgia", "Gout", "Juvenile idiopathic arthritis", "Hand conditions", "Lupus", "Neck pain", "Osteoarthritis", "Osteoporosis", "Paget’s disease", "Perthes’ disease", "Polymyalgia rheumatica", "Psoriatic arthritis", "Raynaud’s phenomenon", "Reactive arthritis", "Rheumatoid arthritis", "Scleroderma", "Shoulder pain", "Sjogren’s disease"]
 */


import { View, Text, ScrollView } from 'react-native';
import { useTheme } from "../../../../context/ThemeContext";
import { useRouter } from 'expo-router';
import { MultiSelect } from '../../../../components/answerFields/MultiSelect';
import {apiQuestionOption} from '../../../api/django-API';
import { SafeAreaView } from 'react-native-safe-area-context';
import React from 'react';

import { useOnboardingStore } from '../../../store/onboardingStorage';
import { useEffect, useState } from 'react';

export default  function Page() {
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

  function setPainTypes(painTypes: string[]){

    //append option to health list
    let health = answers.health;
    if(health!=undefined)
      health.pain_types = painTypes;
    
    setUserOnboaring({health})
    //on success, next page
    router.navigate('/(onboarding)/patientOnboarding/additionalConditionsTextEntry')
  }

  return (
    <SafeAreaView style={theme.screen}>
      
      <Text style={theme.fontOnBackground}>Do you have any of the following conditions? You can select multiple</Text>
      <ScrollView
      showsVerticalScrollIndicator={false}
      >
        <MultiSelect
        questionOptions={questionOptions}
        headingText='You can select multiple conditions'
        onSubmit={setPainTypes}
        MIN_SELECTIONS={0}
        MAX_SELECTIONS={questionOptions.length+1}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

