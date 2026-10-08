import React from "react";
import {Modal, View, Text, Pressable, StyleSheet} from 'react-native'
import { useTheme, ColourSet } from "../context/ThemeContext";

type ConfirmModalProps = {
    visible: boolean;
    title: string;
    message: string;
    confirmLabel: string;
    cancelLabel: string;
    onConfirm: () => void;
    onCancel: () => void;
}

const ConfirmModal = ({visible, title, message, confirmLabel, cancelLabel, onConfirm, onCancel} : ConfirmModalProps) => {
    const { theme, colours } = useTheme();
    const styles = createStyles(colours);

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
          
          <Text style={[theme.h4, { color: colours.onSurface }]}>{title}</Text>
          <Text> </Text>
          <Text style={[theme.body, { color: colours.onSurface}]}>
            {message}
          </Text>

          <View style={[styles.buttons, theme.centerItems, theme.row]}>
            <Pressable
              style={[styles.button, { borderColor: colours.onSurface, borderWidth: 1 }]}
              onPress={onCancel}
              accessibilityRole="button"
            >
              <Text style={[theme.body, { color: colours.onSurface }]}>{cancelLabel}</Text>
            </Pressable>

            <Pressable
              style={[styles.button, { backgroundColor: colours.primary }]}
              onPress={onConfirm}
              accessibilityRole="button"
            >
              <Text style={[theme.body, { color: colours.onPrimary}]}>{confirmLabel}</Text>
            </Pressable>
          </View>
        </Pressable>
    </Pressable>
    </Modal>
  );
}

export default ConfirmModal;



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
        }
    })};