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
import { useOnboardingPatientStore } from '../../store/onboardingStorage';
import { SafeAreaView } from 'react-native-safe-area-context';
export default function Page() {
  const router = useRouter();
  const { theme } = useTheme();
  const setPatientOnboaring = useOnboardingPatientStore((s)=> s.set);
  function setSex(){

  }


  return (
    <SafeAreaView style={theme.screen}>
      <Text style={theme.text}>Hello {'FIX: add displayName'}</Text>
      <Text style={theme.text}>A few quick questions so we can make things more relevant for you</Text>
      <View>
        <MultipleChoice 
        questionOptions={["Female", "Male", "Prefer not to say"]}
        onSubmit={()=>{router.navigate('/(onboarding)/patientOnboarding/ageEntry')}}
        />
      </View>
    </SafeAreaView>
  );
}

