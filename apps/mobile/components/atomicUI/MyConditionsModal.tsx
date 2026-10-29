/**
 * Modal that allows the user to change their 'my conditions' information
 *
 * Used two ways:
 * - a patient edits their saved answers, e.g. to fix a typo
 * - a support person who has said they experience musculoskeletal symptoms fills it in for the
 *   first time (creating = true), which makes them a patient
 *
 * On confirm, input is checked for validity and saved to backend.
 */
import { useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from "react-native";
import { Checkbox } from "react-native-paper";

import { useTheme, ColourSet } from "../../context/ThemeContext";
import { apiErrorMessage } from "@/api/settings_api_helpers";

export type userDetails = {
  hasDiagnosis: boolean | null;
  diagnoses: string[]; // entered by a support person when they become a patient, hasDiagnosis is locked after save
  conditions: string[]; // other conditions / symptoms
};

type Props = {
  visible: boolean;
  creating?: boolean; // true when a support person is becoming a patient
  initialValues: userDetails;
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
  onConfirm,
  onCancel
}: Props) => {
  const { theme, colours } = useTheme();
  const styles = createStyles(colours);

  const [draft, setDraft] = useState<userDetails>(initialValues);
  const [newCondition, setNewCondition] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [newDiagnosis, setNewDiagnosis] = useState("");
  const [editingDiagnosis, setEditingDiagnosis] = useState(false);

  /**
   * resets modal to saved values (initialValues) when it opens
   */
  useEffect(() => {
    if (visible) {
      setDraft(initialValues);
      setNewCondition("");
      setNewDiagnosis("");
      setNewDiagnosis("");
      setEditingDiagnosis(false);
      setError(null);
    }
  }, [visible]);

  const hasCondition = (conditions: string[], text: string) =>
    conditions.some((c) => c.toLowerCase() === text.toLowerCase());

  // for adding items to conditions
  const addItem = (
    key: "diagnoses" | "conditions",
    text: string,
    clear: () => void
  ) => {
    const value = text.trim();
    if (!value) return;
    if (!hasCondition(draft[key] ?? [], value)) {
      setDraft((prev) => ({ ...prev, [key]: [...(prev[key] ?? []), value] }));
    }
    clear();
  };

  // for removing items from conditions
  const removeItem = (key: "diagnoses" | "conditions", index: number) =>
    setDraft((prev) => ({
      ...prev,
      [key]: (prev[key] ?? []).filter((_, i) => i !== index)
    }));

  const withPending = (list: string[], pending: string) => {
    const text = pending.trim();
    return text && !hasCondition(list, text) ? [...list, text] : list;
  };

  // saves input data when 'Save Changes' is pressed
  const handleSave = async () => {
    // never called because clicking nothign and 
    // pressing saves gives the user a patient profile
    
    if (!creating && draft.hasDiagnosis === null) {

      setError("Please specify whether you have a diagnosis.");
      return;
    }

    let diagnoses = draft.diagnoses ?? [];
    let conditions = withPending(draft.conditions, newCondition);

    if (creating && !draft.hasDiagnosis) {
      // if the user unticks the checkbox the input fields go away and drafts are discarded
      diagnoses = [];
      conditions = [];
    } else if (draft.hasDiagnosis) {
      // an individual diagnosis can be edited/removed but state hasDiagnosis = true cannot be changed
      diagnoses = withPending(diagnoses, newDiagnosis);
      if (diagnoses.length === 0) {
        setError("Please add your diagnosis."); // patient trys to press save with no diagnoses
        return;
      }
    } 
    setSaving(true); 
    setError(null);
    try {
      await onConfirm({
        hasDiagnosis: creating ? !!draft.hasDiagnosis : draft.hasDiagnosis,
        diagnoses,
        conditions
      });
    } catch (e) {
      setError(
        apiErrorMessage(e, "Couldn't save your changes. Please try again.")
      );
    } finally {
      setSaving(false);
    }
  };

  const renderDiagnosisCheckbox = () => (
    <View style={styles.checkboxField}>
      <Checkbox.Item
        label="I have a diagnosis"
        status={draft.hasDiagnosis ? "checked" : "unchecked"}
        onPress={() =>
          setDraft((prev) => ({ ...prev, hasDiagnosis: !prev.hasDiagnosis }))
        }
        labelStyle={[theme.body, {color: colours.onSurface}]}
        style={styles.checkboxItem}
        />
    </View>
  );

  const renderDiagnosisQuestion = () => (
    <View style={styles.field}>
      <Text style={[theme.h6, theme.leftItems, {color: colours.onSurface, marginBottom: 20}]}>
        Do you have a diagnosis?
      </Text>
      {renderDiagnosisCheckbox()}
    </View>
  );

  const renderList = (
    title: string,
    placeholder: string,
    key: "diagnoses" | "conditions",
    text: string,
    setText: (t: string) => void
  ) => (
    <View style={styles.field}>
      <Text style={[theme.h6, theme.leftItems, {color: colours.onSurface, marginVertical: 10}]}>
        {title}
      </Text>
      <Text> </Text>

      {(draft[key] ?? []).map((item, index) => (
        <View key={`${item}-${index}`} style={styles.conditionRow}>
          <Text style={[theme.body, {color: colours.onSurface}, { flex: 1 }]}>
            {item}
          </Text>
          <Pressable
            onPress={() => removeItem(key, index)}
            accessibilityRole="button"
            accessibilityLabel={`Remove ${item}`}
            hitSlop={8}
          >
            <Text style={[theme.body, {color: colours.onSurface}]}>Remove</Text>
          </Pressable>
        </View>
      ))}

      <View style={styles.addRow}>
        <TextInput
          value={text}
          onChangeText={setText}
          onSubmitEditing={() => addItem(key, text, () => setText(""))}
          returnKeyType="done"
          autoCapitalize="sentences"
          placeholder={placeholder}
          placeholderTextColor={colours.onSurface}
          style={[
            styles.textInput,
            {
              flex: 1,
              color: colours.onSurface,
              borderColor: colours.onSurface
            }
          ]}
        />
        <Pressable
          style={[
            styles.button,
            { borderColor: colours.onSurface, borderWidth: 1 }
          ]}
          onPress={() => addItem(key, text, () => setText(""))}
          accessibilityRole="button"
        >
          <Text style={[theme.body, theme.fontOnSurface]}>Add</Text>
        </Pressable>
      </View>
    </View>
  );

  // shown once a diagnosis has been saved
  const renderDiagnosisSummary = () =>
    editingDiagnosis || (draft.diagnoses ?? []).length === 0 ? (
      renderList(
        "Diagnosis",
        "e.g. rheumatoid arthritis",
        "diagnoses",
        newDiagnosis,
        setNewDiagnosis
      )
    ) : (
      <View style={styles.field}>
        <Text style={[theme.h6, theme.leftItems, theme.fontOnSurface]}>
          Diagnosis:{" "}
          <Text style={[theme.body, theme.fontOnSurface]}>
            {(draft.diagnoses ?? []).join(", ")}
          </Text>
        </Text>
        <Pressable
          onPress={() => setEditingDiagnosis(true)}
          accessibilityRole="button"
          accessibilityLabel="Edit diagnosis"
          hitSlop={8}
          style={styles.editLink}
        >
          <Text style={[theme.body, theme.fontOnSurface]}>Edit</Text>
        </Pressable>
      </View>
    );

  /**
   * returns the modal which renders text input fields to condition and other conditions/s where the
   * user can change/add conditions.
   *
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
            <Text style={[theme.h4, theme.leftItems, theme.fontOnSurface]}>
              Edit My Details
            </Text>
            <Text> </Text>

            <Text> </Text>

            {creating ? (
              <>
                {renderDiagnosisCheckbox()}
                {draft.hasDiagnosis && (
                  <>
                    <Text> </Text>
                    {renderList(
                      "Your diagnosis",
                      "e.g. rheumatoid arthritis",
                      "diagnoses",
                      newDiagnosis,
                      setNewDiagnosis
                    )}
                    <Text> </Text>
                    {renderList(
                      "Other conditions or symptoms",
                      "e.g. lower back pain",
                      "conditions",
                      newCondition,
                      setNewCondition
                    )}
                  </>
                )}
              </>
            ) : (
              <>
                {renderDiagnosisQuestion()}
                {draft.hasDiagnosis && (
                  renderDiagnosisSummary()
                )}
                <Text> </Text>
                {renderList(
                  "Other conditions or symptoms",
                  "e.g. lower back pain",
                  "conditions",
                  newCondition,
                  setNewCondition
                )}
              </>
            )}

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
                <Text style={[theme.body, theme.fontOnSurface]}>Go Back</Text>
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
                  <Text style={theme.body}>Save Changes</Text>
                )}
              </Pressable>
            </View>
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
    checkboxField: {
      width: "95%",
      borderRadius: 28,
      padding: 5,
      alignSelf: 'center'

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
      outlineColor: colours.tertiary,
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
  });
}
