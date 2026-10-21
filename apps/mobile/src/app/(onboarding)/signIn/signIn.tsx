/**
 * First page of sign-in sequence
 * 
 * Includes:
 * Phone field
 * Header text
 * descriptive text
 * submit / next button
 * back button
 */

import { View, Text } from 'react-native';
import { PhoneField } from '../../../../components/onboarding/PhoneField';
import { useTheme } from "../../../../context/ThemeContext";
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';



export default function Page() {
  const { theme } = useTheme();
  const router = useRouter();

  function sendSMS(phone: string){
    //FIX: add verification API call

    router.navigate("/(onboarding)/signIn/phoneVerification");
  }

  return (
    <SafeAreaView style={theme.container}>
      <Text style={theme.text}>SIGN IN</Text>
      <Text style={theme.text}>The first sign-in page. Prompts user for their phone number, then asks for verification based on account info</Text>
      <Text style={theme.text}>This is a basic implementation though, so just phone verification</Text>
      <PhoneField
        onSubmit={sendSMS}
      />
    </SafeAreaView>
  );
}

