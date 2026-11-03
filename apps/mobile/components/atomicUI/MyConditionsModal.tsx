/**
 * Modal that allows the user to change their 'my conditions' information
 *
 * Used two ways:
 * - a patient edits their saved answers, e.g. to fix a typo
 * - a support person who has said they experience musculoskeletal symptoms fills it in for the
 *   first time (creating = true), which makes them a patient
 * - Primary condition is the user's selected pain types, other conditions is free text, which is broken into a list.
 * - On confirm, input is checked for validity and saved to backend.
 */
import React, { useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from "react-native";
import { Checkbox, TextInput, List, IconButton } from "react-native-paper";

import { useTheme, ColourSet } from "../../context/ThemeContext";
import { apiErrorMessage } from "@/api/settings_api_helpers";

export type userDetails = {
  painTypes: string[]; // QuestionOption ids (pain_type)
  otherConditions: string;
};

export type PainTypeOption = { id: string; text: string };

type Props = {
  visible: boolean;
  creating?: boolean; // true when a support person is becoming a patient
  initialValues: userDetails;
  painTypeOptions: PainTypeOption[];
  onConfirm: (values: userDetails) => Promise<void>; // saves to the backend, throws if it fails
  onCancel: () => void;
};

/**
 * Modal triggered in 'About Me' in My Account
 *  - Support people can select 'Yes I do' to 'do you experience MSK symptoms' and transition from
 *    support person -> patient account.
 *  - Patients can view and edit their diagnosis and other conditions information
 *  - Once a user saves 'has diagnosis' this cannot be altered unless they select 'delete my data' in myData
 */
const MyConditionsModal = ({
  visible,
  creating,
  initialValues,
  painTypeOptions,
  onConfirm,
  onCancel
}: Props) => {
  const { theme, colours } = useTheme();
  const styles = createStyles(colours);

  const [painTypes, setPainTypes] = useState<string[]>(initialValues.painTypes);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  /**
   * Splitting other_conditions into a list separated by \n
   */
  const splitConditions = (s: string) =>
    s
      .split("\n")
      .map((c) => c.trim())
      .filter(Boolean);
  const hasCondition = (list: string[], text: string) =>
    list.some((c) => c.toLowerCase() === text.toLowerCase());

  const [conditions, setConditions] = useState<string[]>(
    splitConditions(initialValues.otherConditions)
  );
  const [newCondition, setNewCondition] = useState("");

  /**
   * resets modal to saved values (initialValues) when it opens
   */
  useEffect(() => {
    if (visible) {
      setPainTypes(initialValues.painTypes);
      setConditions(splitConditions(initialValues.otherConditions));
      setNewCondition("");
      setError(null);
    }
  }, [visible]);

  // ticks or unticks a pain type
  const togglePainType = (id: string) =>
    setPainTypes((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );

  // appends the typed condition to the list
  const addCondition = () => {
    const value = newCondition.trim();
    if (!value) return;
    if (!hasCondition(conditions, value)) {
      setConditions((prev) => [...prev, value]);
    }
    setNewCondition("");
  };

  const removeCondition = (index: number) =>
    setConditions((prev) => prev.filter((_, i) => i !== index));

  // saves input data when 'Save Changes' is pressed
  const handleSave = async () => {
    // include anything typed but not yet added
    const pending = newCondition.trim();
    const finalConditions =
      pending && !hasCondition(conditions, pending)
        ? [...conditions, pending]
        : conditions;

    // a support person becoming a patient needs to give something
    if (creating && painTypes.length === 0 && finalConditions.length === 0) {
      setError("Please select a condition or describe your symptoms.");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await onConfirm({
        painTypes,
        otherConditions: finalConditions.join("\n")
      });
    } catch (e) {
      setError(
        apiErrorMessage(e, "Couldn't save your changes. Please try again.")
      );
    } finally {
      setSaving(false);
    }
  };

  /**
   * returns the modal which renders text input fields to condition and other conditions/s where the
   * user can change/add conditions.
   */
  return (
    <Modal
      visible={visible}
      transparent={true} // display app in background
      animationType="fade"
      onRequestClose={onCancel} // considers tapping out of frame a 'cancel' scenario
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.backgroundColour} />

        <Pressable style={styles.modalView} onPress={onCancel}>
          <Pressable
            style={[styles.card, { backgroundColor: colours.surface }]}
            onPress={() => {}}
          >
            <ScrollView keyboardShouldPersistTaps="handled">
              <Text
                style={[
                  theme.h4,
                  theme.leftItems,
                  { color: colours.onSurface }
                ]}
              >
                Edit My Conditions
              </Text>

              {/* Primary condition: pain types */}
              <View style={styles.field}>
                <Text
                  style={[
                    theme.h6,
                    theme.leftItems,
                    { color: colours.onSurface, marginVertical: 10 }
                  ]}
                >
                  Primary condition
                </Text>
                {painTypeOptions.map((option) => (
                  <View key={option.id} style={{padding: 15}}>
                  <Checkbox.Item
                    key={option.id}
                    label={option.text}
                    status={
                      painTypes.includes(option.id) ? "checked" : "unchecked"
                    }
                    onPress={() => togglePainType(option.id)}
                    labelStyle={[theme.body, { color: colours.onSurface }]}
                    style={styles.checkboxItem}
                  />
                  </View>
                ))}
              </View>

              {/* Other conditions: a list to add to */}
              <View style={styles.field}>
                <Text
                  style={[
                    theme.h6,
                    theme.leftItems,
                    { color: colours.onSurface, marginVertical: 10 }
                  ]}
                >
                  Other conditions or symptoms
                </Text>

                <TextInput
                  mode="outlined"
                  label="Add a condition"
                  placeholder="e.g. lower back pain"
                  value={newCondition}
                  onChangeText={setNewCondition}
                  onSubmitEditing={addCondition}
                  returnKeyType="done"
                  autoCapitalize="sentences"
                  outlineColor={colours.onSurface}
                  activeOutlineColor={colours.onSurface}
                  textColor={colours.onSurface}
                  style={styles.paperInput}
                  right={
                    <TextInput.Icon
                      icon="plus"
                      onPress={addCondition}
                      accessibilityLabel="Add condition"
                    />
                  }
                />

                {conditions.map((item, index) => (
                  <View key={index} style={{padding: 15}}>
                  <List.Item
                    key={`${item}-${index}`}
                    title={item}
                    titleNumberOfLines={0}
                    titleStyle={[theme.body, { color: colours.onSurface }]}
                    style={styles.conditionItem}
                    right={() => (
                      <View style={{left: 27}}>
                      <IconButton
                        icon="close"
                        iconColor={colours.onSurface}
                        onPress={() => removeCondition(index)}
                        accessibilityLabel={`Remove ${item}`}
                        size={20}
                      />
                      </View>
                    )}
                  />
                  </View>
                ))}
              </View>

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
                  accessibilityRole="button"
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
                  accessibilityRole="button"
                >
                  {saving ? (
                    <ActivityIndicator />
                  ) : (
                    <Text style={theme.body}>
                      {creating ? "Change to patient profile" : "Save Changes"}
                    </Text>
                  )}
                </Pressable>
              </View>
            </ScrollView>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default MyConditionsModal;

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
      maxHeight: "90%",
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
      padding: 5,
      marginHorizontal: 8,
      borderWidth: 1
    },
    field: {
      width: "100%",
      borderRadius: 28,
      padding: 5
    },
    checkboxField: {
      width: "95%",
      borderRadius: 28,
      padding: 5,
      alignSelf: "center"
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
    editLink: {
      alignSelf: "flex-end",
      minHeight: 44,
      justifyContent: "center",
      marginHorizontal: 8
    },
    checkboxItem: {
      outlineWidth: 2,
      outlineColor: colours.tertiary
    },
    conditionRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      marginHorizontal: 8,
      minHeight: 44
    },
    addRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginHorizontal: 8,
      marginTop: 8
    },
    paperInput: {
      marginHorizontal: 8,
      backgroundColor: colours.surface
    },
    conditionItem: {
      paddingVertical: 0,
      borderBottomWidth: 1,
      borderBottomColor: colours.ex3
    }
  });
}
