/**
 * Modal that allows the user to change their 'my conditions' information
 * 
 * On confirm, input is checked for validity and saved to backend.
 */
import React, { useEffect, useState } from "react";
import {Modal, View, Text, Pressable, StyleSheet, TextInput, ActivityIndicator} from 'react-native'
import { useTheme, ColourSet } from "../../context/ThemeContext";
import { apiErrorMessage } from "@/api/settings_api_helpers"

export type userDetails ={
  hasDiagnosis: boolean | null; // null if not answered
  otherConditions: string;
}

type Props = {
    visible: boolean;
    initialValues: userDetails;
    onConfirm: (values: userDetails) => Promise<void>; // saves to the backend, throws if it fails
    onCancel: () => void;
}

const MyConditionsModal = ({visible, initialValues, onConfirm, onCancel} : Props) => {
    const { theme, colours } = useTheme();
    const styles = createStyles(colours);
    const [draft, setDraft] = useState<userDetails>(initialValues);
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
        setDraft(initialValues)
        setError(null)
      }
    },[visible]);

     /**
     * saves the input, showing the error and keeping the modal open if it fails. The parent
     * closes the modal once the save has worked.
     */
    const handleSave = async () => {
      setSaving(true);
      setError(null);
      try {
        await onConfirm(draft);
      } catch (error) {
        setError(apiErrorMessage(error, "Couldn't save your changes. Please try again."));
      } finally {
        setSaving(false);
      }
    };

    /**
     * Function to render the diagnosis section, a yes / no choice
     */
    const renderDiagnosis = () => (

      <View style={styles.field}>
        <Text style={[theme.h6, theme.leftItems, theme.fontOnSurface]}>Do you have a diagnosis?</Text>
        <Text> </Text>
        <View style={styles.chips}>
          {[{ label: 'Yes', value: true }, { label: 'No', value: false }].map((option) => {
            const selected = draft.hasDiagnosis === option.value;
            return (
              <Pressable
                key={option.label}
                style={[styles.button, { borderColor: colours.onSurface, borderWidth: 1 },
                        selected && { backgroundColor: colours.primary }]}
                onPress={() => setDraft((prev) => ({...prev, hasDiagnosis: option.value}))}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
              >
                <Text style={theme.body}>{option.label}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    );

    /**
     * Function to render the other conditions text input section
     */
    const renderOtherConditions = () => (
    
      <View style={styles.field}>
        <Text style={[theme.h6, theme.leftItems, theme.fontOnSurface]}>Other Conditions</Text>
        <Text> </Text>
        <TextInput
          value={draft.otherConditions}
          onChangeText={(text) => setDraft((prev) => ({...prev, otherConditions: text}))}
          keyboardType={'default'}
          autoCapitalize={'sentences'}
          multiline={true}
          placeholder="Other Conditions"
          placeholderTextColor={colours.onSurface}
          style={[styles.textInput, { color: colours.onSurface, borderColor: colours.onSurface }]}
        />
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
        
    <View style={styles.backgroundColour}/>             
    
    <Pressable style={styles.modalView} onPress={onCancel}> 
        
        <Pressable
          style={[styles.card, { backgroundColor: colours.surface}]}
          onPress={() => {}}
        >
          
          <Text style={[theme.h4, theme.leftItems, theme.fontOnSurface]}>Edit My Details</Text>
          <Text> </Text>

          {renderDiagnosis()}
          <Text> </Text>
          {renderOtherConditions()}

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
        }
    })};