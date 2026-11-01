/**
 * Modal for changing the users phone number.
 *  - requires pin sign in
 *  - number is verifised with a ccode.
 */
import React, { useEffect, useRef, useState } from "react";
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator
} from "react-native";
import { HelperText } from "react-native-paper";
import { useTheme, ColourSet } from "../../context/ThemeContext";
import { PhoneField } from "@/components/onboarding/PhoneField";
import { NumberEntry } from "@/components/answerFields/NumberEntry";
import TextButton from "@/components/atomicUI/TextButton";
import { request_code, verify_code, ApiError } from "@/api/django-API";

const NUM_DIGITS = 10;
const PIN_LENGTH = 6;

type Step = "pin" | "phone" | "code";

type Props = {
  visible: boolean;
  currentPhone: string;
  // saves the new number to the backend, throws if it fails
  onConfirm: (
    phone: string,
    verification_id: string,
    pin: string
  ) => Promise<void>;
  onCancel: () => void;
};

export default function ChangePhoneModal({
  visible,
  currentPhone,
  onConfirm,
  onCancel
}: Props) {
  const { theme, colours } = useTheme();
  const styles = createStyles(colours);

  const [step, setStep] = useState<Step>("pin");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false); // blocks double submits (state updates are async)
  const pinRef = useRef(""); // kept in a ref so it isn't held in render state

  // start fresh every time the modal opens
  useEffect(() => {
    if (visible) {
      setStep("pin");
      setPhone("");
      setError(null);
      setInfo(null);
      setBusy(false);
      busyRef.current = false;
    }
    pinRef.current = ""; // also clears the pin when the modal closes
  }, [visible]);

  /** runs an async action with the busy guard and shared error handling */
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
      } else if (err instanceof ApiError && err.status === 409) {
        setError("That number is already linked to another account.");
      } else {
        setError(fallback);
      }
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }

  // NumberEntry returns a number, which drops leading zeros (0123 -> 123), so padping it back
  const pad = (value: number | string, length: number) =>
    String(value).padStart(length, "0");

  function submitPhone(newPhone: string) {
    if (newPhone === currentPhone) {
      setError("That's already your number.");
      return;
    }
    run(async () => {
      await request_code(newPhone);
      setPhone(newPhone);
      setStep("code");
    }, "We couldn't send a code to that number. Check it and try again.");
  }

  function submitPin(pin: string) {
    pinRef.current = pin;
    setError(null);
    setStep("phone");
  }

  function submitCode(code: string) {
    run(async () => {
      let verification_id: string;
      try {
        const result = await verify_code(phone, code);
        verification_id = result.verification_id;
      } catch (err) {
        // a wrong or expired code is a 400, anything else falls through to run()'s handling
        if (err instanceof ApiError && err.status === 400) {
          setError("That code didn't work. Check it and try again, or resend.");
          return;
        }
        throw err;
      }
      try {
        await onConfirm(phone, verification_id, pinRef.current); // parent closes the modal on success
      } catch (err) {
        // adjust to what your server returns for a wrong PIN (400 with a pin error, or 403)
        const wrongPin =
          err instanceof ApiError &&
          (err.status === 403 ||
            (err.status === 400 && err.data && "pin" in err.data));
        if (wrongPin) {
          pinRef.current = "";
          setStep("pin");
          setError("Your PIN is incorrect. Enter it again to continue.");
          return;
        }
        throw err;
      }
    }, "Couldn't update your number. Please try again.");
  }

  function resend() {
    run(async () => {
      await request_code(phone);
      setInfo("New code sent.");
    }, "We couldn't resend the code. Please try again.");
  }

  const title =
    step === "pin"
      ? "Enter your PIN"
      : step === "phone"
        ? "Change my number"
        : "Verify your number";

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.backdrop}>
        <View style={[styles.card, { backgroundColor: colours.surface }]}>
          <Text
            style={[theme.h4, theme.leftItems, { color: colours.onSurface }]}
          >
            {title}
          </Text>
          <Text> </Text>

          {step === "pin" && (
            <>
              <Text style={[theme.body, { color: colours.onSurface }]}>
                Enter your PIN to change your phone number.
              </Text>
              <NumberEntry
                key="pin"
                onSubmit={submitPin}
                length={PIN_LENGTH}
                secure
              />
            </>
          )}

          {step === "phone" && (
            <>
              <Text style={[theme.body, { color: colours.onSurface }]}>
                Enter your new Australian mobile number. We'll text you a code
                to confirm it.
              </Text>
              <PhoneField onSubmit={submitPhone} />
            </>
          )}

          {step === "code" && (
            <>
              <Text style={[theme.body, { color: colours.onSurface }]}>
                We've sent a temporary code to {phone}. It is valid for 5
                minutes.
              </Text>
              <NumberEntry
                key="code"
                onSubmit={submitCode}
                length={NUM_DIGITS}
              />
              <TextButton
                label="Resend Code"
                onPress={resend}
                fontColour={colours.onSurface}
              />
              <TextButton
                label="Use a different number"
                onPress={() => {
                  setStep("phone");
                  setError(null);
                  setInfo(null);
                }}
                fontColour={colours.onSurface}
              />
            </>
          )}

          <HelperText type="error" visible={!!error}>
            {error}
          </HelperText>
          {info && (
            <Text style={[theme.small, { color: colours.onSurface }]}>
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
      backgroundColor: "rgba(0,0,0,0.6)"
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
