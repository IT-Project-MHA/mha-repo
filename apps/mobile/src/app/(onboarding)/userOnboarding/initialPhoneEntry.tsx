/**
 * Phone number entry page
 * -asks for phone field
 * -sends API request for sms code. Does not proceed until success
 */
import { useRouter } from "expo-router";
import { PhoneField } from "../../../../components/onboarding/PhoneField";
import { useOnboardingStore } from "../../../store/onboardingStorage";
import { request_code, ApiError } from "../../../api/django-API";

import { Text, View, ScrollView } from "react-native";
import { useTheme } from "../../../../context/ThemeContext";
import React, { useState } from "react";
import { HelperText } from "react-native-paper";

export default function Page() {
  const { colours, theme } = useTheme();
  const router = useRouter();
  const setUserOnboaring = useOnboardingStore((s) => s.set);

  // catch if an account has already been made with this number
  const [accountExists, setAccountExists] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function setPhone(phone_number: string) {
    if (sending) return; // stop double-submits from sending two SMS codes
    setSending(true);
    setError(null);
    setAccountExists(false);
    setUserOnboaring({ phone_number });
    try {
      await request_code(phone_number);
      router.navigate("/(onboarding)/userOnboarding/verifyPhone");
    } catch (error) {
      console.error("Failed to send SMS", error);
      setError(
        "We couldn't send a code to that number. Check it and try again."
      );
      if (error instanceof ApiError && error.status === 409) {
        // number already registered
        setAccountExists(true);
        setError("An account is already registered with this number.");
      }
    } finally {
      setSending(false);
    }
  }

  return (
    <ScrollView stickyHeaderIndices={[0]}>
      <View>
        <View style={[theme.header, theme.leftText]}>
          <Text style={[theme.h5, { color: colours.onSurface }]}>
            Add your mobile
          </Text>
        </View>

        <View style={[theme.clearContainer, theme.centerItems]}>
          <Text style={[theme.small, { color: colours.onSurface }]}>
            Please enter an Australian phone number
          </Text>
        </View>

        <PhoneField onSubmit={setPhone} />

        <HelperText type="error" visible={!!error} style={theme.centerText}>
          {error}
        </HelperText>

      </View>
    </ScrollView>
  );
}
