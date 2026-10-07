/**
 * First screen users see on opening the app, with three splash screens they can scroll through
 */

import { Image, StyleSheet, Text, View } from 'react-native';
import { SignInButton } from '../../../components/onboarding/SignInButton';
import { useTheme } from "../../../context/ThemeContext";

export default function Tab() {
  const { theme } = useTheme();

  return (
    <View style={theme.container}>
      <Text style={theme.text}>SPLASH SCREEN</Text>
      <Text style={theme.text}>In this section, we see three splash screens the user can swipe through, a create account button and a sign in button</Text>
      <Image
        style={styles.splash}
        source={require("../../../assets/images/FigmaAssets/OnboardingSplash/Alt 2 Doctor's appointment empty state 1.svg")}
      />
      <SignInButton/>
    </View>
  );
}

const styles = StyleSheet.create({
  splash: {
    width: 200,
    height: 200,
  }
});
