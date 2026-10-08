/**
 * Modal that allows the user to change their 'my conditions' information
 * 
 * On confirm, input should be checked for validity and saved to backend.
 */
import React, { useEffect } from "react";
import {Modal, View, Text, Pressable, StyleSheet, TextInput} from 'react-native'
import { useState } from "react";
import { useTheme, ColourSet } from "../context/ThemeContext";

export type userDetails ={
  primaryCondition: string;
  otherConditions: string; // how many other conditions should the user be able to add?
}

type Props = {
    visible: boolean;
    initialValues: userDetails;
    onConfirm: () => void; // void for now- change with api
    onCancel: () => void;
}

const AboutMeModal = ({visible, initialValues, onConfirm, onCancel} : Props) => {
    const { theme, colours } = useTheme();
    const styles = createStyles(colours);
    const [draft, setDraft] = useState<userDetails>(initialValues);

    /**
     * resets modal to saved values (initialValues) when it opens
     * 
     * when connected to backend, this will open the form with the up to date
     * data from backend.
     */
    useEffect(()=>{
      if(visible){
        setDraft(initialValues)
      }
    },[visible]);

    /**
     * handler to update the field when the user types into it
     */
    const updateHandler = (field: keyof userDetails) => (text: string) => setDraft((prev) => ({...prev, [field]: text}))

    /**
     * function to render a text input section
     */
    const renderField = (label: string, field: keyof userDetails) => (
    
      <View style={styles.field}>
        <Text style={[theme.h6, { color: colours.onSurface }, theme.leftItems]}>{label}</Text>
        <Text> </Text>
        <TextInput
          value={draft[field]}
          onChangeText={updateHandler(field)}
          keyboardType={'default'}
          autoCapitalize={'sentences'}
          placeholder={label}
          placeholderTextColor={colours.onSurface}
          style={[styles.textInput, { color: colours.onSurface, borderColor: colours.onSurface }]}
        />
      </View>
    );

  /**
   * returns the modal which renders text input fields to condition and other conditions/s where the 
   * user can change/add conditions.
   * 
   * change save not implemented- will be implementing with api.
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

          {renderField('Primary Condition','primaryCondition')}
          <Text> </Text>
          {renderField('Other Conditions','otherConditions')}

          <View style={[styles.buttons, theme.centerItems, theme.row]}>
            <Pressable
              style={[styles.button, { borderColor: colours.onSurface, borderWidth: 1 }]}
              onPress={onCancel}
              accessibilityRole="button"
            >
              <Text style={[theme.body, theme.fontOnSurface]}>Go Back</Text>
            </Pressable>

            <Pressable
              style={[styles.button, { backgroundColor: colours.primary }]}
              onPress={onConfirm}
              accessibilityRole="button"
            >
              <Text style={theme.body}>Save Changes</Text>
            </Pressable>
          </View>
        </Pressable>
    </Pressable>
    </Modal>
  );
}

export default AboutMeModal;

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
        }
    })};