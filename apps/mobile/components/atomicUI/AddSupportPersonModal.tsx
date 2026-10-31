/**
 * Modal that allows the user to invite a support person by phone number
 * 
 * On confirm, the number is checked for validity and the invite is sent by the parent. The modal
 * stays open and shows the error if the invite fails.
 */
import React, { useEffect } from "react";
import {Modal, View, Text, Pressable, StyleSheet, TextInput, ActivityIndicator} from 'react-native'
import { useState } from "react";
import { useTheme, ColourSet } from "../../context/ThemeContext";
import { validateSupportPhone, apiErrorMessage } from "@/api/settings_api_helpers"

type Props = {
    visible: boolean;
    onConfirm: (phone: string) => Promise<void>; // sends the invite, throws if it fails
    onCancel: () => void;
}

const AddSupportPersonModal = ({visible, onConfirm, onCancel} : Props) => {
    const { theme, colours } = useTheme();
    const styles = createStyles(colours);
    const [phone, setPhone] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    /**
     * clears the modal when it opens
     */
    useEffect(()=>{
      if(visible){
        setPhone('')
        setError(null)
      }
    },[visible]);

    /**
     * checks the number is valid then sends the invite, showing the error and keeping the modal
     * open if either fails. The parent closes the modal once the invite has worked.
     */
    const handleSave = async () => {
      const problem = validateSupportPhone(phone);
      if (problem) {
        setError(problem);
        return;
      }
      setSaving(true);
      setError(null);
      try {
        await onConfirm(phone);
      } catch (error) {
        setError(apiErrorMessage(error, "Couldn't send the invite. Please try again."));
      } finally {
        setSaving(false);
      }
    };

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
          
          <Text style={[theme.h4, theme.leftItems, {color: colours.onSurface}]}>Add Support Person</Text>
          <Text> </Text>

          <View style={styles.field}>
            <Text style={[theme.h6, theme.leftItems, {color: colours.onSurface}]}>Phone Number</Text>
            <Text> </Text>
            <TextInput
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              placeholder="Phone Number"
              placeholderTextColor={colours.onSurface}
              style={[styles.textInput, { color: colours.onSurface, borderColor: colours.onSurface }]}
            />
          </View>

          {error && <Text style={[theme.body, styles.errorText]} accessibilityRole="alert">{error}</Text>}

          <View style={[styles.buttons, theme.centerItems, theme.row]}>
            <Pressable
              style={[styles.button, { borderColor: colours.onSurface, borderWidth: 1 }]}
              onPress={onCancel}
              disabled={saving}
              accessibilityRole="button"
            >
              <Text style={[theme.body, {color: colours.onSurface}]}>Go Back</Text>
            </Pressable>

            <Pressable
              style={[styles.button, { backgroundColor: colours.primary }, saving && { opacity: 0.6 }]}
              onPress={handleSave}
              disabled={saving}
              accessibilityRole="button"
            >
              {saving ? <ActivityIndicator /> : <Text style={theme.body}>Send Invite</Text>}
            </Pressable>
          </View>
        </Pressable>
    </Pressable>
    </Modal>
  );
}

export default AddSupportPersonModal;

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
        errorText : {
          color: colours.primary,
          marginTop: 12,
        }
    })};