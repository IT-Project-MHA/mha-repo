/**
 * Greets the user with the name they entered
 * says "By continuing you agree to Mpowered's Terms and Conditions and Privacy Policy"
 * By clicking on the relevant text, the Terms and Conditions and Privacy policy can be read
 */


import { View, Text } from 'react-native';
import { PhoneField } from '../../../components/onboarding/PhoneField';
import { useTheme } from "../../../context/ThemeContext";
import { TextEntry } from '../../../components/answerFields/TextEntry';
import { useRouter } from 'expo-router';

export default function Page() {
  const router = useRouter();
  const { theme } = useTheme();
  const user = "user"
  return (
    <View style={theme.screen}>
      <Text style={theme.text}>Hello {user}</Text>
      <Text style={theme.text}>A few quick questions so we can make things more relevant for you</Text>
      <Text style={theme.text}>This is a basic implementation though, so just phone verification</Text>
      <View style={theme.container}>
        <TextEntry onSubmit={()=>{router.navigate('/(onboarding)/termsOfService')}}/>
      </View>
    </View>
  );
}

