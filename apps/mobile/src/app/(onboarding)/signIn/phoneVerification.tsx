/**
 * entry page for a texted phone code
 * -button for submit
 * -submits on field completion
 * -submits on enter
 *
 * clickable text for resending code
 */
import React, { useState } from "react";
import { HelperText } from "react-native-paper";
import { NumberEntry } from "../../../../components/onboarding/onboardingFields/NumberEntryOnboarding";
import Button from "../../../../components/atomicUI/Button";
import { useOnboardingStore } from "../../../store/onboardingStorage";
import { useAppStore } from "../../../store/appStore";
import {
  verify_code,
  request_code,
  login,
  ApiError
} from "../../../api/django-API";
import { useUser } from "@/context/AuthorisationContext";
import {
  Text,
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from "react-native";
import { useTheme } from "../../../../context/ThemeContext";
import GetDeviceId from "../../../../components/onboarding/GetDeviceID";

const NUM_DIGITS = 6;

export default function Page() {
  const { colours, theme } = useTheme();
  const { refreshUserType } = useUser();

  const { set, reset, ...answers } = useOnboardingStore.getState();
  const phone_number = answers.phone_number;

  const resetOnboarding = useOnboardingStore((s) => s.reset);
  const completeOnboarding = useAppStore((s) => s.completeOnboarding);

  const [error, setError] = useState<string | null>(null);
  const [resent, setResent] = useState(false);

  async function attemptLogIn(verification_number: string) {
    setError(null);

    try {
      const { verification_id } = await verify_code(
        phone_number,
        verification_number
      );
      const { pin } = useOnboardingStore.getState(); // read at call time
      const device_id = await GetDeviceId();

      const result = await login({
        phone_number,
        pin,
        device_id,
        verification_id
      });
      resetOnboarding();
      //set the onboarded flag
      completeOnboarding(result.token);

      await refreshUserType();
    } catch (error) {
      console.error("login failed", error);
      setError("Something went wrong, please try again.");
    }
  }

  async function resendCode() {
    setError(null);
    try {
      await request_code(phone_number);
      setResent(true);
    } catch {
      setError("Couldn't resend the code. Try again shortly.");
    }
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
        <View style={[theme.header, theme.leftText]}>
          <Text style={[theme.h5, { color: colours.onSurface }]}>
            SMS incoming...
          </Text>
          <Text style={[theme.small, { color: colours.onSurface }]}>
            We've sent you a code to verify your number.
          </Text>
        </View>

        <NumberEntry
          onSubmit={attemptLogIn}
          length={NUM_DIGITS}
          placeholder="6-digit code"
        />

        <HelperText type={error ? "error" : "info"} visible={!!error || resent}>
          {error ?? "New code sent."}
        </HelperText>

        <Button
          label="Resend Code"
          onPress={resendCode}
          buttonType="roundButton"
        />

        <Text
          style={[
            theme.body,
            theme.centerText,
            { color: colours.onBackground }
          ]}
        >
          We've sent a code to {phone_number}
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
