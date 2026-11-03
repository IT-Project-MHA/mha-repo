/**
 * Initial sign in / create account page for onboarding.
 */
import { Text, StyleSheet, Modal, View, ScrollView, Platform, Pressable} from "react-native";

import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import OnboardingSplashScreen from "./splashScreen";

import {
  useSafeAreaInsets
} from "react-native-safe-area-context";
import { useTheme, ColourSet } from "../../../context/ThemeContext";
import { Typography } from "../../../constants/textSize";
import React from "react";

export default function Page() {
  const { colours, theme } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = createStyles(colours, theme, insets.bottom);
  const router = useRouter();

  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    async function checkIfOnboarded() {
      //const firstLaunchVal = await AsyncStorage.getItem(LocalConfig.IsOnboarded);
      const isOnboarded = false;
      if (!isOnboarded) {
        setShowOnboarding(true);
      }
    }
    checkIfOnboarded();
  }, []);

  async function onFirstLaunchClosed() {
    //await AsyncStorage.setItem(LocalConfig.IsOnboarded, 'true');
    setShowOnboarding(false);
  }

  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
    >
      <View style={[theme.header, theme.leftItems]}>
        <Text style={[theme.h5, { color: colours.onSurface }]}>
          Lets get you started.
        </Text>
        <Text style={[theme.body, { color: colours.onSurface }]}>
          Sign In or Create an Account.
        </Text>
      </View>

       <Modal
        animationType="slide"
        presentationStyle="fullScreen"
        visible={showOnboarding}
        onRequestClose={() => setShowOnboarding(false)}
      >
      <OnboardingSplashScreen onClose={onFirstLaunchClosed} />

      </Modal>
       

    
      <View style={[theme.clearContainer, {gap: 30}]}>

        <Pressable 
            onPress={() => {router.navigate("/(onboarding)/userOnboarding/createAccount");}}
            style={styles.button}>
        <Text style={[theme.h6, styles.buttonText, { color: colours.onPrimary }]}>Create Account</Text>
        </Pressable>

        <Pressable 
            onPress={() => {router.navigate("/(onboarding)/signIn/signIn");}} 
            style={styles.button}>
        <Text style={[theme.h6, styles.buttonText, { color: colours.onPrimary }]}>Sign In</Text>

      </Pressable>

      </View>
    </ScrollView>
  );
}

function createStyles(
  colours: ColourSet,
  text: Typography,
  bottomInset: number
) {
  return StyleSheet.create({
    button: {
      height: 60,
      width: "100%",
      borderRadius: 100,
      justifyContent: "center",
      backgroundColor: colours.primary,
    },
    buttonText: { 
      textAlign: "center" 
    },
  });
}
