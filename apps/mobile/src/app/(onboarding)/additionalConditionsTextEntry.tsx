/**
 * first page of sign-up sequence
 * asks for name
 * directs to terms and conditions page
 * FIX: allow skip
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
      <Text style={theme.text}>Do you have any other conditions?</Text>
      <View style={theme.container}>
        <TextEntry 
        onSubmit={()=>{router.navigate('/(onboarding)/initialPhoneEntry')}}
        placeholder='Type conditions or symptoms that you know'
        />
      </View>
    </View>
  );
}

