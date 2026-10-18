/**
 * first page of sign-up sequence
 * asks for name
 * directs to terms and conditions page
 */


import { View, Text } from 'react-native';
import { useTheme } from "../../../../context/ThemeContext";
import { TextEntry } from '../../../../components/answerFields/TextEntry';
import { useRouter } from 'expo-router';
import { useOnboardingUserStore } from '../../store/onboardingStorage';

export default function Page() {
  const router = useRouter();
  const { theme } = useTheme();
  const setUserOnboaring = useOnboardingUserStore((s)=> s.set);

  function setDisplayName(display_name: string){
    setUserOnboaring({display_name});

    router.navigate('/(onboarding)/userOnboarding/email')
  }

  return (
    <View style={theme.screen}>
      <Text style={theme.text}>CREATE ACCOUNT</Text>
      <Text style={theme.text}>Prompts the user to enter their name</Text>
      <View style={theme.container}>
        <TextEntry 
        onSubmit={setDisplayName}
        placeholder='Type your name'
        keyboardType='default'
        />
      </View>
      {/**FIX: link to terms of use and privacy policy */}
      <Text style={theme.text}>By signing up, you agree to MPowered's Terms of Use and Privacy Policy</Text>
      
    </View>
  );
}

