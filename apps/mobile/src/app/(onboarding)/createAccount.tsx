/**
 * first page of sign-up sequence
 * asks for name
 * directs to terms and conditions page
 */


import { View, Text } from 'react-native';
import { PhoneField } from '../../../components/onboarding/PhoneField';
import { useTheme } from "../../../context/ThemeContext";
import { TextEntry } from '../../../components/answerFields/TextEntry';
import { useRouter } from 'expo-router';

export default function Page() {
  const router = useRouter();
  const { theme } = useTheme();
  
  return (
    <View style={theme.screen}>
      <Text style={theme.text}>CREATE ACCOUNT</Text>
      <Text style={theme.text}>Prompts the usder to enter their name</Text>
      <View style={theme.container}>
        <TextEntry 
        onSubmit={()=>{router.navigate('/(onboarding)/termsOfService')}}
        placeholder='Type your name'
        />
      </View>
    </View>
  );
}

