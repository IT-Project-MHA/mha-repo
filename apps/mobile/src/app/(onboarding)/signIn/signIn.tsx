/**
 * First page of sign-in sequence
 * If new device request-code → verify-code → login again with verification code
 * Includes:
 * Phone field
 * Header text
 * descriptive text
 * submit / next button
 * back button
 */
import { useRouter } from "expo-router";
import { PhoneField } from "../../../../components/onboarding/PhoneField";
import { useOnboardingStore } from "../../../store/onboardingStorage";

import {
  Text,
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from "react-native";
import { useTheme } from "../../../../context/ThemeContext";
import React from "react";
import { useLocalSearchParams } from "expo-router";

export default function Page() {
  const { colours, theme } = useTheme();
  const router = useRouter();
  const setUserOnboaring = useOnboardingStore((s) => s.set);

  // for when user is flagged in create mode
  const { notice } = useLocalSearchParams<{ notice?: string }>();

  /**
   * catch if phone doesnt have an account associated
   */
  function setPhone(phone_number: string) {
    setUserOnboaring({ phone_number });
    router.navigate("/(onboarding)/signIn/enterPin");
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
      >
        <View>
          <View style={[theme.header, theme.leftText]}>
            <Text style={[theme.h5, { color: colours.onSurface }]}>
              Enter your mobile
            </Text>
            <Text style={[theme.small, { color: colours.onSurface }]}>
              Please enter an Australian phone number
            </Text>
          </View>

          {/** catches if user tried to create a new account with a registered number */}
          {notice === "accountExists" && (
            <Text style={[theme.h5, { color: colours.onSurface }]}>
              You already have an account with this number. Sign in below.
            </Text>
          )}
          
          <PhoneField onSubmit={setPhone} />
        
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
