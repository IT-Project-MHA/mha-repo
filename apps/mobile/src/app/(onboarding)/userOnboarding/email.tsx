/**
 * page for email entry
 * asks for email
 * directs to phone entry
 */


import { View, Text } from 'react-native';
import { useTheme } from "../../../../context/ThemeContext";
import { TextEntry } from '../../../../components/answerFields/TextEntry';
import { useRouter } from 'expo-router';
import { useOnboardingUserStore } from '../../store/onboardingStorage';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Page() {
  const router = useRouter();
  const { theme } = useTheme();
  const setUserOnboaring = useOnboardingUserStore((s)=> s.set);

  function setEmail(email: string){
    setUserOnboaring({email});

    router.navigate('/(onboarding)/userOnboarding/initialPhoneEntry');
  }

  return (
    <SafeAreaView style={theme.screen}>
      <Text style={theme.text}>EMAIL ADRESS SCREEN</Text>
      <Text style={theme.text}>Prompts the user to enter their email</Text>
      <View style={theme.container}>
        <TextEntry 
        onSubmit={setEmail}
        placeholder='email'
        keyboardType='email-address'
        textContentType='emailAddress'
        />
      </View>
    </SafeAreaView>
  );
}

