/**
 * First page of patient onboarding.
 * asks for phone field
 * FIX LATER: add modal for terms of use and privacy policy.
 */

import { View, Text } from 'react-native';
import { PhoneField } from '../../../components/onboarding/PhoneField';
import { useTheme } from "../../../context/ThemeContext";



export default function Page() {
  const { theme } = useTheme();
  
  return (
    <View style={theme.container}>
      <Text style={theme.text}>Add your mobile</Text>

      <PhoneField/>

      <Text style={theme.text}>By signing up, you agree to MPowered's Terms of Use and Privacy Policy</Text>
      
    </View>
  );
}

