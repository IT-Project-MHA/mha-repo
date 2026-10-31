/**
 * Modal that allows the user to change their about me information
 *
 * On confirm, input is checked for validity and saved to backend.
 */
import React, { useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
  ScrollView
} from "react-native";
import { useTheme, ColourSet } from "../../context/ThemeContext";
import { validateAboutMe, apiErrorMessage } from "@/api/settings_api_helpers";
import { useUser } from "@/context/AuthorisationContext";

export type UserDetails = {
  name: string;
  sex: string; // value of an assigned_gender_at_birth choice
  birthYear: string; // 4 digits, or blank
  phone: string;
  email: string;
};

export type Choice = {
  value: string; // sent to the API
  label: string; // shown to the user
};

type AboutMeModalProps = {
  visible: boolean;
  initialValues: UserDetails;
  sexOptions: Choice[];
  onConfirm: (values: UserDetails) => Promise<void>; // saves to the backend, throws if it fails
  onCancel: () => void;
};

const AboutMeModal = ({
  visible,
  initialValues,
  sexOptions,
  onConfirm,
  onCancel
}: AboutMeModalProps) => {
  const { theme, colours } = useTheme();
  const { isPatient } = useUser();
  const styles = createStyles(colours);
  const [draft, setDraft] = useState<UserDetails>(initialValues);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  /**
   * resets modal to saved values (initialValues) when it opens
   *
   * when connected to backend, this will open the form with the up to date
   * data from backend.
   */
  useEffect(() => {
    if (visible) {
      setDraft(initialValues);
      setError(null);
    }
  }, [visible]);

  /**
   * handler to update the field when the user types into it
   */
  const updateHandler = (field: keyof UserDetails) => (text: string) =>
    setDraft((prev) => ({ ...prev, [field]: text }));

  /**
   * checks the input is valid then saves it, showing the error and keeping the modal open if
   * either fails. The parent closes the modal once the save has worked.
   */
  const handleSave = async () => {
    const problem = validateAboutMe(draft);
    if (problem) {
      setError(problem);
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onConfirm(draft);
    } catch (error) {
      setError(
        apiErrorMessage(error, "Couldn't save your changes. Please try again.")
      );
    } finally {
      setSaving(false);
    }
  };

  /**
   * Function to render a text input section
   */
  const renderField = (
    label: string,
    field: keyof UserDetails,
    keyboardType: "default" | "email-address" | "phone-pad" = "default"
  ) => (
    <View style={styles.field}>
      <Text style={[theme.h6, theme.leftText, {color: colours.onSurface, marginVertical: 10}]}>
        {label}
      </Text>
      <TextInput
        value={draft[field]}
        onChangeText={updateHandler(field)}
        keyboardType={keyboardType}
        autoCapitalize={field === "email" ? "none" : "sentences"}
        placeholder={label}
        placeholderTextColor={colours.onSurface}
        style={[
          styles.textInput,
          { color: colours.onSurface, borderColor: colours.onSurface }
        ]}
      />
    </View>
  );

  const [sexOpen, setSexOpen] = useState(false);

  /**
   * Function to render the assigned gender at birth section as a dropdown, chosen from the
   * options the server accepts rather than typed
   */
  const renderSexField = () => (
    <View style={styles.field}>
      <Text style={[theme.h6, theme.leftItems, {color: colours.onSurface}]}>Sex</Text>
      <Pressable
        style={[styles.dropdown, { borderColor: colours.onSurface }]}
        onPress={() => setSexOpen((open) => !open)}
        accessibilityRole="button"
        accessibilityState={{ expanded: sexOpen }}
      >
        <Text style={[theme.body, {color: colours.onSurface}]}>
          {sexOptions.find((option) => option.value === draft.sex)?.label ??
            "Select"}
        </Text>
      </Pressable>
      {sexOpen &&
        sexOptions.map((option) => (
          <Pressable
            key={option.value}
            style={[
              styles.dropdownItem,
              draft.sex === option.value && { backgroundColor: colours.primary }
            ]}
            onPress={() => {
              setDraft((prev) => ({ ...prev, sex: option.value }));
              setSexOpen(false);
            }}
            accessibilityRole="radio"
            accessibilityState={{ selected: draft.sex === option.value }}
          >
            <Text style={theme.body}>{option.label}</Text>
          </Pressable>
        ))}
    </View>
  );

  /**
   * returns the modal which renders text input fields to condition personal details where the
   * user can change their information.
   */
  return (
    <Modal
      visible={visible}
      transparent={true} // display app in background
      animationType="fade"
      onRequestClose={onCancel} // considers tapping out of frame a 'cancel' scenario
    >
      <View style={styles.backgroundColour} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Pressable style={styles.modalView} onPress={onCancel}>
            <Pressable
              style={[styles.card, { backgroundColor: colours.surface }]}
              onPress={() => {}}
            >
              <Text style={[theme.h4, theme.leftItems, {color: colours.onSurface}]}>
                Edit My Details
              </Text>
              
              {renderField("Name", "name", "default")}
              

              {isPatient && (
                <>
                {renderSexField()}
                {renderField("Birth Year", "birthYear", "phone-pad")}
                </>
              )}
              
              {renderField("Phone Number", "phone", "phone-pad")}
              {renderField("Email", "email", "email-address")}

              {error && (
                <Text
                  style={[theme.body, styles.errorText]}
                  accessibilityRole="alert"
                >
                  {error}
                </Text>
              )}

              <View style={[styles.buttons, theme.centerItems, theme.row]}>
                <Pressable
                  style={[
                    styles.button,
                    { borderColor: colours.onSurface, borderWidth: 1 }
                  ]}
                  onPress={onCancel}
                  disabled={saving}
                >
                  <Text style={[theme.body, { color: colours.onSurface }]}>
                    Go Back
                  </Text>
                </Pressable>

                <Pressable
                  style={[
                    styles.button,
                    { backgroundColor: colours.primary },
                    saving && { opacity: 0.6 }
                  ]}
                  onPress={handleSave}
                  disabled={saving}
                >
                  {saving ? (
                    <ActivityIndicator />
                  ) : (
                    <Text style={theme.body}>Save Changes</Text>
                  )}
                </Pressable>
              </View>
            </Pressable>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default AboutMeModal;

function createStyles(colours: ColourSet) {
  return StyleSheet.create({
    modalView: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 15
    },
    card: {
      width: "100%",
      maxWidth: 420,
      borderRadius: 28,
      padding: 24
    },
    buttons: {
      flexDirection: "row",
      justifyContent: "center",
      flexWrap: "wrap",
      gap: 10,
      marginTop: 24,
      paddingHorizontal: 15
    },
    button: {
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 50,
      minHeight: 44,
      justifyContent: "center",
      alignItems: "center"
    },
    backgroundColour: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0,0,0,0.6)"
    },
    textInput: {
      height: 40,
      padding: 5,
      marginHorizontal: 8,
      borderWidth: 1
    },
    field: {
      width: "100%",
      borderRadius: 28,
      padding: 5
    },
    chips: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      marginHorizontal: 8
    },
    errorText: {
      color: colours.primary,
      marginTop: 12
    },
    dropdown: {
      padding: 10,
      marginHorizontal: 8,
      borderWidth: 1,
      minHeight: 44,
      justifyContent: "center"
    },
    dropdownItem: {
      padding: 12,
      marginHorizontal: 8,
      minHeight: 44,
      justifyContent: "center"
    },
    scrollContent: {
      flexGrow: 1 // lets the content centre when short, scroll when tall
    },
    outside: {
      flexGrow: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 15
    }
  });
}
