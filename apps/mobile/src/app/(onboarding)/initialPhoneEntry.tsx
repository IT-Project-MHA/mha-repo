/**
 * Last page of patient onboarding
 * 
 * Includes:
 * Phone field
 * Header text
 * descriptive text
 * submit / next button
 * back button
 */

import { View, Text } from 'react-native';
import { PhoneField } from '../../../components/onboarding/PhoneField';
import { useTheme } from "../../../context/ThemeContext";



export default function Page() {
  const { theme } = useTheme();
  
  return (
    <View style={theme.container}>
      <Text style={theme.text}>SIGN IN</Text>
      <Text style={theme.text}>The first sign-in page. Prompts user for their phone number, then asks for verification based on account info</Text>
      <Text style={theme.text}>This is a basic implementation though, so just phone verification</Text>
      <PhoneField/>
      
    </View>
  );
}

