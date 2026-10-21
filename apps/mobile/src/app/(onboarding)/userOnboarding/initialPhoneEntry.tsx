/**
 * First page of patient onboarding.
 * asks for phone field
 * FIX LATER: add modal for terms of use and privacy policy.
 */

import { useRouter } from 'expo-router';
import { Text, View } from 'react-native';
import { PhoneField } from '../../../../components/onboarding/PhoneField';
import { useTheme } from "../../../../context/ThemeContext";
import { useOnboardingUserStore } from '../../store/onboardingStorage';
import { SafeAreaView } from 'react-native-safe-area-context';


export default function Page() {
  const router = useRouter();
  const { theme } = useTheme();
  const setUserOnboaring = useOnboardingUserStore((s)=> s.set);

  function setPhone(phone_number: string){
    setUserOnboaring({phone_number});
    router.navigate('/(onboarding)/userOnboarding/verifyPhone');
  }

  return (
    <SafeAreaView style={theme.container}>
      <Text style={theme.text}>Add your mobile</Text>

      <PhoneField
      onSubmit={setPhone}
      />
      
    </SafeAreaView>
  );
}

