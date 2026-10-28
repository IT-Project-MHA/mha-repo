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
import {Modal, View, Text, Pressable, StyleSheet, TextInput, ActivityIndicator,
        ScrollView, KeyboardAvoidingView, Platform,

} from 'react-native'
import { useTheme, ColourSet } from "../../context/ThemeContext";
import { apiErrorMessage } from "@/api/settings_api_helpers"

export type userDetails = {
  hasDiagnosis: boolean | null; // meaningful when hasMskIssues is true
  conditions: string[]; // other conditions / symptoms
};

type Props = {
    visible: boolean;
    creating?: boolean; // true when a support person is becoming a patient
    initialValues: userDetails;
    onConfirm: (values: userDetails) => Promise<void>; // saves to the backend, throws if it fails
    onCancel: () => void;
}

const MyConditionsModal = ({visible, initialValues, onConfirm, onCancel} : Props) => {
    const { theme, colours } = useTheme();
    const styles = createStyles(colours);
    const [draft, setDraft] = useState<userDetails>(initialValues);
    const [newCondition, setNewCondition] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    /**
     * resets modal to saved values (initialValues) when it opens
     * 
     * when connected to backend, this will open the form with the up to date
     * data from backend.
     */
    useEffect(()=>{
      if(visible){
        setDraft(initialValues);
        setNewCondition("");
        setError(null);
      }
    },[visible]);

    const hasCondition = (conditions: string[], text: string) => conditions.some((c) => c.toLowerCase() === text.toLowerCase());

    const addCondition = () => {
      const text = newCondition.trim();
        if (!text) return;
          // ignore duplicates, case-insensitive
          if (draft.conditions.some((c) => c.toLowerCase() === text.toLowerCase())) {
            setNewCondition("");
            return;
      }
        setDraft((prev) => ({ ...prev, conditions: [...prev.conditions, text] }));
        setNewCondition("");
    };


  const removeCondition = (index: number) =>
    setDraft((prev) => ({ ...prev, conditions: prev.conditions.filter((_, i) => i !== index) }));


     /**
     * saves the input, showing the error and keeping the modal open if it fails. The parent
     * closes the modal once the save has worked.
     */
    const handleSave = async () => {
      if (draft.hasDiagnosis === null) {
        setError("Please specify whether you have a diagnosis.");
        return;
      }

    // include anything typed but not yet added
    const pendingText = newCondition.trim();
    const conditions = pendingText && !draft.conditions.includes(pendingText)
      ? [...draft.conditions, pendingText]
      : draft.conditions;

    setSaving(true);
    setError(null);
    try {
      await onConfirm({ ...draft, conditions });
    } catch (e) {
      setError(apiErrorMessage(e, "Couldn't save your changes. Please try again."));
    } finally {
      setSaving(false);
    }
  };

  // reusable Yes / No chips
  const renderYesNo = (value: boolean | null, onSelect: (v: boolean) => void) => (
    <View style={styles.chips}>
      {[{ label: "Yes", value: true }, { label: "No", value: false }].map((option) => {
        const selected = value === option.value;
        return (
          <Pressable
            key={option.label}
            style={[styles.button, { borderColor: colours.onSurface, borderWidth: 1 },
                    selected && { backgroundColor: colours.primary }]}
            onPress={() => onSelect(option.value)}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
          >
            <Text style={theme.body}>{option.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );

  const renderDiagnosisQuestion = () => (
    <View style={styles.field}>
      <Text style={[theme.h6, theme.leftItems, theme.fontOnSurface]}>Do you have a diagnosis?</Text>
      <Text> </Text>
      {renderYesNo(draft.hasDiagnosis, (v) => setDraft((prev) => ({ ...prev, hasDiagnosis: v })))}
    </View>
  );

  const renderConditionsList = () => (
    <View style={styles.field}>
      <Text style={[theme.h6, theme.leftItems, theme.fontOnSurface]}>
        Other conditions or symptoms
      </Text>
      <Text> </Text>

      {draft.conditions.map((condition, index) => (
        <View key={`${condition}-${index}`} style={styles.conditionRow}>
          <Text style={[theme.body, theme.fontOnSurface, { flex: 1 }]}>{condition}</Text>
          <Pressable
            onPress={() => removeCondition(index)}
            accessibilityRole="button"
            accessibilityLabel={`Remove ${condition}`}
            hitSlop={8}
          >
            <Text style={[theme.body, theme.fontOnSurface]}>Remove</Text>
          </Pressable>
        </View>
      ))}

      <View style={styles.addRow}>
        <TextInput
          value={newCondition}
          onChangeText={setNewCondition}
          onSubmitEditing={addCondition}
          returnKeyType="done"
          autoCapitalize="sentences"
          placeholder="e.g. lower back pain"
          placeholderTextColor={colours.onSurface}
          style={[styles.textInput, { flex: 1, color: colours.onSurface, borderColor: colours.onSurface }]}
        />
        <Pressable
          style={[styles.button, { borderColor: colours.onSurface, borderWidth: 1 }]}
          onPress={addCondition}
          accessibilityRole="button"
        >
          <Text style={[theme.body, theme.fontOnSurface]}>Add</Text>
        </Pressable>
      </View>
    </View>
  );

  /**
   * returns the modal which renders text input fields to condition and other conditions/s where the 
   * user can change/add conditions.
   * 
   */
  return (

    <Modal
        visible = {visible}
        transparent = {true} // display app in background
        animationType="fade"
        onRequestClose={onCancel} // considers tapping out of frame a 'cancel' scenario
    > 

    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        
    <View style={styles.backgroundColour}/>             
    
    <Pressable style={styles.modalView} onPress={onCancel}> 
        
        <Pressable
          style={[styles.card, { backgroundColor: colours.surface}]}
          onPress={() => {}}
        >
          
          <Text style={[theme.h4, theme.leftItems, theme.fontOnSurface]}>Edit My Details</Text>
          <Text> </Text>

          <Text> </Text>
          {renderDiagnosisQuestion()}
           <Text> </Text>
          {renderConditionsList()}

          {error && <Text style={[theme.body, styles.errorText]} accessibilityRole="alert">{error}</Text>}

          <View style={[styles.buttons, theme.centerItems, theme.row]}>
            <Pressable
              style={[styles.button, { borderColor: colours.onSurface, borderWidth: 1 }]}
              onPress={onCancel}
              disabled={saving}
              accessibilityRole="button"
            >
              <Text style={[theme.body, theme.fontOnSurface]}>Go Back</Text>
            </Pressable>

            <Pressable
              style={[styles.button, { backgroundColor: colours.primary }, saving && { opacity: 0.6 }]}
              onPress={handleSave}
              disabled={saving}
              accessibilityRole="button"
            >
              {saving ? <ActivityIndicator /> : <Text style={theme.body}>Save Changes</Text>}
            </Pressable>
          </View>
        </Pressable>
    </Pressable>

    </KeyboardAvoidingView>

    </Modal>
  );
}

export default MyConditionsModal;

function createStyles(colours: ColourSet){
    return StyleSheet.create({
        modalView: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            padding: 15,
        },
        card: {
          width: '100%',
          maxWidth: 420,
          borderRadius: 28,
          padding: 24,
        },
        buttons: {
          flexDirection: 'row',
          justifyContent: 'center',
          flexWrap: 'wrap',
          gap: 10,
          marginTop: 24,
          paddingHorizontal: 15,
        },
        button: {
          paddingVertical: 12,
          paddingHorizontal: 20,
          borderRadius: 50,
          minHeight: 44,
          justifyContent: 'center',
          alignItems: 'center',
        },
        backgroundColour: {
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.6)'
        },
        textInput : {
          height: 40,
            padding: 5,
            marginHorizontal: 8,
            borderWidth: 1,
        },
        field : {
          width: '100%',
          borderRadius: 28,
          padding: 5,
        },
        chips : {
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: 8,
          marginHorizontal: 8,
        },
        errorText : {
          color: colours.primary,
          marginTop: 12,
        },
        conditionRow: {
      flexDirection: "row", alignItems: "center", gap: 12,
      marginHorizontal: 8, minHeight: 44,
    },
        addRow: { flexDirection: "row", alignItems: "center", gap: 8, marginHorizontal: 8, marginTop: 8 },
    })};