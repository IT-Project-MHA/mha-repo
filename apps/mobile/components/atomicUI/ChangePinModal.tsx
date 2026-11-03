/**
 * Modal for changing the pin by sms verification.
 *  -opens by texting a code to the user's phone.
 *  - user enters code
 *  - user enters new pin, and confirms new pin
 *  - onConfirm saves the pin and throws if it fails.
 */
import React, { useEffect, useRef, useState } from "react";
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { HelperText } from "react-native-paper";
import { useTheme, ColourSet } from "../../context/ThemeContext";
import { NumberEntry } from "@/components/onboarding/onboardingFields/NumberEntryOnboarding";
import TextButton from "@/components/atomicUI/TextButton";
import { request_code, verify_code, ApiError } from "@/api/django-API";

const CODE_LENGTH = 6;
const PIN_LENGTH = 6;

type Step = "code" | "pin" | "confirm";

type Props = {
  visible: boolean;
  phone: string;
  onConfirm: (verification_id: string, pin: string) => Promise<void>;
  onCancel: () => void;
};

const TITLES: Record<Step, string> = {
  code: "Verify your number",
  pin: "Choose a new PIN",
  confirm: "Confirm your new PIN"
};

export default function ChangePinModal({
  visible,
  phone,
  onConfirm,
  onCancel
}: Props) {
  const { theme, colours } = useTheme();
  const styles = createStyles(colours);

  const [step, setStep] = useState<Step>("code");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);
  const verificationId = useRef("");
  const newPin = useRef("");

  async function run(action: () => Promise<void>, fallback: string) {
    if (busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    setError(null);
    setInfo(null);
    try {
      await action();
    } catch (err) {
      console.error(
        fallback,
        err,
        err instanceof ApiError ? JSON.stringify(err.data) : null
      );
      if (err instanceof ApiError && err.status === 429) {
        setError("Too many attempts. Please wait a few minutes and try again.");
      } else {
        setError(fallback);
      }
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }

  function sendCode() {
    run(async () => {
      await request_code(phone);
      setInfo("We've texted you a code. It is valid for 5 minutes.");
    }, "We couldn't send a code. Please try again.");
  }

  // start fresh and text a code whenever the modal opens
  useEffect(() => {
    if (!visible) return;
    setStep("code");
    setError(null);
    setInfo(null);
    verificationId.current = "";
    newPin.current = "";
    sendCode();
  }, [visible]);

  function submitCode(code: string) {
    run(async () => {
      try {
        const result = await verify_code(phone, code);
        verificationId.current = result.verification_id;
        setStep("pin");
      } catch (err) {
        if (err instanceof ApiError && err.status === 400) {
          setError("That code didn't work. Check it and try again, or resend.");
          return;
        }
        throw err;
      }
    }, "Couldn't verify the code. Please try again.");
  }

  function submitPin(pin: string) {
    newPin.current = pin;
    setError(null);
    setStep("confirm");
  }

  function submitConfirm(pin: string) {
    if (pin !== newPin.current) {
      setError("The PINs don't match. Choose your new PIN again.");
      newPin.current = "";
      setStep("pin");
      return;
    }
    run(async () => {
      try {
        await onConfirm(verificationId.current, newPin.current); // parent closes the modal
      } catch (err) {
        if (err instanceof ApiError && err.status === 400) {
          // verification expired/used, or the server rejected the PIN
          verificationId.current = "";
          newPin.current = "";
          setStep("code");
          setError("That didn't work. Request a new code and try again.");
          return;
        }
        throw err;
      }
    }, "Couldn't change your PIN. Please try again.");
  }

  const onSubmit =
    step === "code" ? submitCode : step === "pin" ? submitPin : submitConfirm;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >

    <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >   
       <View style={styles.backdrop}>

        <View style={[styles.card, { backgroundColor: colours.surface }]}>
          <Text
            style={[theme.h4, theme.leftItems, { color: colours.onSurface }]}
          >
            {TITLES[step]}
          </Text>

          <NumberEntry
            key={step}
            onSubmit={onSubmit}
            length={step === "code" ? CODE_LENGTH : PIN_LENGTH}
            secure={step !== "code"}
          />

          {step === "code" && (
            <TextButton
              label="Resend Code"
              onPress={sendCode}
              fontColour={colours.onSurface}
            />
          )}

          <HelperText type="error" visible={!!error}>
            {error}
          </HelperText>

          {info && (
            <Text style={[theme.small, theme.centerText, { color: colours.onSurface }]}>
              {info}
            </Text>
          )}

          {busy && <ActivityIndicator />}

          <View style={styles.buttons}>
            <Pressable
              style={[
                styles.button,
                { borderColor: colours.onSurface, borderWidth: 1 }
              ]}
              onPress={onCancel}
              disabled={busy}
            >
              <Text style={[theme.body, { color: colours.onSurface }]}>
                Go Back
              </Text>
            </Pressable>
          </View>
        </View>
        </View>
        </KeyboardAvoidingView>
    </Modal>
  );
}

function createStyles(colours: ColourSet) {
  return StyleSheet.create({
    backdrop: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 15,
      backgroundColor: "rgba(0,0,0,0.6)",
      textAlign: 'center',
    },
    card: {
      width: "100%",
      maxWidth: 420,
      borderRadius: 28,
      padding: 24,
      gap: 8
    },
    buttons: { flexDirection: "row", justifyContent: "center", marginTop: 16 },
    button: {
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 50,
      minHeight: 44,
      justifyContent: "center",
      alignItems: "center"
    }
  });
}
