/**
 * First page of patient onboarding.
 * asks for phone field
 * FIX LATER: add modal for terms of use and privacy policy.
 */

import { useRouter } from 'expo-router';
import { Text, View } from 'react-native';
import { PhoneField } from '../../../components/onboarding/PhoneField';
import { useTheme } from "../../../context/ThemeContext";
import { useOnboardingUserStore } from '../store/onboardingStorage';


export default function Page() {
  const router = useRouter();
  const { theme } = useTheme();
  const setUserOnboaring = useOnboardingUserStore((s)=> s.set);

  function setPhone(phone: string){
    setUserOnboaring({phone});
    router.navigate('/(onboarding)/verifyPhone');
  }

  return (
    <View style={theme.container}>
      <Text style={theme.text}>Add your mobile</Text>

      <PhoneField
      onSubmit={setPhone}
      />
      
    </View>
  );
}

