/**
 * First screen users see on opening the app, with three splash screens they can scroll through
 */

import { View, Text, StyleSheet } from 'react-native';
import {SignInButton} from '../../../components/onboarding/SignInButton'
import { useTheme } from "../../../context/ThemeContext";

export default function Tab() {
  const { theme } = useTheme();

  return (
    <View style={theme.container}>
      <Text style={theme.text}>SPLASH SCREEN</Text>
      <Text style={theme.text}>In this section, we see three splash screens the user can swipe through, a create account button and a sign in button</Text>
      <SignInButton/>
    </View>
  );
}
