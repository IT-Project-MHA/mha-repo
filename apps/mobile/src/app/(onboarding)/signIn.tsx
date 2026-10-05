/**
 * First screen users see on opening the app, with three splash screens they can scroll through
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


export default function Tab() {
  const { theme } = useTheme();
  
  return (
    <View style={theme.container}>
      <Text style={theme.text}>SIGN IN</Text>
      <Text style={theme.text}>The first sign-in page. Prompts user for their phone number, then asks for verification based on account info</Text>
      <PhoneField/>
    </View>
  );
}

