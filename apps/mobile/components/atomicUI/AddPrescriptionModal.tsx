import {useEffect, useState} from "react";
import {Modal, View, Text, Pressable, StyleSheet, TextInput} from 'react-native'
import { useTheme, ColourSet } from "../../context/ThemeContext";

/**
 * props for the modal
 */
type Props = {
    visible: boolean; 
    title: string;
    onConfirm: (values: PrescriptionDetails) => void;
    onCancel: () => void;
}

/**
 * form fields with keys matching API attribute names from apiPrescription
 * name, dosage and frequency are required by API
 */
export type PrescriptionDetails = {
    name: string;
    dosage: string;
    frequency: string;
    strength: string;
    started_on: string;
    notes: string;
}

/**
 * blank form used as initial state and to reset form when modal is closed
 * will be replaced with initialValues when editing prescriptions
 */
const emptyDraft : PrescriptionDetails = {
    name: '',
    dosage: '',
    frequency: '',
    strength: '',
    started_on: '',
    notes: '',
}

/**
 * modal which renders the form for adding a prscription (to be extending to editing as well)
 * collects input and reports it through onConfirm for parent screen (prescriptions.tsx)
 * to make API call and close modal.
 */
const addPrescriptionModal = ({visible, title, onConfirm, onCancel} : Props) => {
    const { theme, colours } = useTheme();
    const styles = createStyles(colours);
    const [draft, setDraft] = useState<PrescriptionDetails>(emptyDraft); // whats been types into the input fields

    /**
     * clears form to emptyDraft whenever 'visible' changes (modal is closed)
     */
    useEffect(()=>{
      if (!visible)
        setDraft(emptyDraft);
    }, [visible]);

    /**
     * add button can only be pressed when the three required fields are filled
     */
    const canSubmit = draft.name.trim() !== ''&& draft.frequency.trim() !=='' && draft.dosage.trim() !=='';

    /**
     *handler to update the field when the user types into it
     */
    const updateHandler = (field: keyof PrescriptionDetails) => (text: string) => setDraft((prev) => ({...prev, [field]: text}))
  
    /**
     * runs on 'add prescription' button press
     * breaks input into key value pairs, trims spaces from every value and doesnt include empty fields
     * passed back to prescriptions.tsx as PrescriptionDetails
     */
    const handleConfirmation = () => {
      const clean = Object.fromEntries(
        Object.entries(draft)
        .map(([k,v])=> [k,v.trim()] as [string,string])
        .filter(([,v])=>v.trim()!=='')
      ) as PrescriptionDetails
      onConfirm(clean);
    };

    const handleCancel = () => {
      onCancel();
    };
  
    /**
   * Function to render a text input section (split into sections)
   */
    const renderField = (label: string, field: keyof PrescriptionDetails, keyboardType: 'default' | 'numeric' = 'default') => (
      
        <View style={styles.field}>
          <Text style={[theme.h6, theme.leftItems, theme.fontOnSurface]}>{label}</Text>
          <Text> </Text>
          <TextInput
            value={draft[field]}
            onChangeText={updateHandler(field)}
            keyboardType={keyboardType}
            placeholder={label}
            placeholderTextColor={colours.onSurface}
            style={[styles.textInput, { color: colours.onSurface, borderColor: colours.onSurface }]}
          />
        </View>
    );

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

          </Text>

          {renderField('Name','name')}
          {renderField('Dosage','dosage', 'numeric')}
          {renderField('Frequency','frequency', 'numeric')}

          <View style={[styles.buttons, theme.centerItems, theme.row]}>
            <Pressable
              style={[styles.button, { borderColor: colours.onSurface, borderWidth: 1 }]}
              onPress={handleCancel}
            >
              <Text style={[theme.body, { color: colours.onSurface }]}>Go Back</Text>
            </Pressable>

            <Pressable
              style={[styles.button, { backgroundColor: colours.primary, opacity: canSubmit ? 1:0.4 }]}
              onPress={handleConfirmation}
              disabled={!canSubmit}
            >
              <Text style={[theme.body, { color: colours.onPrimary}]}>Add Prescription</Text>
            </Pressable>
          </View>
        </Pressable>
    </Pressable>
    </Modal>
  );
}

export default addPrescriptionModal;



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
          maxWidth: 500,
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
        field : {
          width: '100%',
          borderRadius: 28,
          padding: 5,
        },
        textInput : {
          height: 40,
            padding: 5,
            marginHorizontal: 8,
            borderWidth: 1,
        },
    })};