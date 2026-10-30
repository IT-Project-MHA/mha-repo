/**
 * entry page for a texted phone code
 *
 * button for submit
 * submits on field completion
 * submits on enter
 *
 * clickable text for resending code
 *
 */
import { useRouter } from "expo-router";
import { NumberEntry } from "../../../../components/answerFields/NumberEntry";
import Button from "../../../../components/atomicUI/Button";
import { useOnboardingStore } from "../../../store/onboardingStorage";
import { verify_code, request_code } from "../../../api/django-API";

import { Text, StyleSheet, View, ScrollView } from "react-native";
import { useTheme, ColourSet } from "../../../../context/ThemeContext";
import { Typography } from "../../../../constants/textSize";
import React from "react";

import GetDeviceId from "../../../../components/onboarding/GetDeviceID";

const NUM_DIGITS = 6;

export default function Page() {
  const { colours, theme } = useTheme();
  const router = useRouter();

  const { set, reset, ...answers } = useOnboardingStore.getState();
  const phone_number = answers.phone_number;
  const setUserOnboaring = useOnboardingStore((s) => s.set);

  async function smsVerifier(code: string) {
    //on success, we go to the userType selection page

    //and send the API request
    //fields: phone_number, display_name, email
    try {
      //verify code
      const result = await verify_code(phone_number, code);
      const verification_id = result.verification_id;
      setUserOnboaring({ verification_id });

      const result2 = await GetDeviceId();
      const device_id = result2.toString();
      console.log(device_id);
      setUserOnboaring({ device_id });
      router.navigate("/(onboarding)/patientOnboarding/userType");
    } catch (error) {
      console.error("SMS verification failed", error);
    }
  }

  async function resendCode() {
    try {
      await request_code(phone_number);
      router.navigate("/(onboarding)/signIn/phoneVerification");
    } catch (error) {
      console.error("Failed to send SMS", error);
    }
  }

  return (
    <ScrollView stickyHeaderIndices={[0]}>
      <View style={[theme.header, theme.leftText]}>
        <Text style={[theme.h5, { color: colours.onSurface }]}>
          Verify your mobile
        </Text>
      </View>

      <View>
        <NumberEntry
          onSubmit={smsVerifier}
          UPPER_BOUND={999999}
          LOWER_BOUND={0}
          MAX_lENGTH_NUM={NUM_DIGITS}
        />
        <Button
          label="Resend Code"
          onPress={resendCode}
          buttonType="roundButton"
        />

        <View style={[theme.header, theme.centerItems]}>
          
          <Text style={[theme.body, { color: colours.onSurface }]}>
            We've sent a temporary verification code to {answers.phone_number}.
            It is valid for 5 minutes.
          </Text>

        </View>
      </View>
    </ScrollView>
  );
}

