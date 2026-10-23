import {useEffect, useState} from "react";
import {Modal, View, Text, Pressable, TextInput, ScrollView, Platform} from 'react-native'
import { useTheme } from "../../context/ThemeContext";
import DateTimePicker from '@react-native-community/datetimepicker';
import { toApiDate, parseApiDate, formatDate } from '../../constants/date';

/**
 * props for the modal
 */
type Props = {
    visible: boolean;
    title: string;
    initialValues?: PrescriptionDetails;   // pre-fills the form when editing
    submitLabel: string;
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
    stopped_on: string;
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
    stopped_on: '',
    notes: '',
}

/**
 * modal which renders the form for adding a prscription (to be extending to editing as well)
 * collects input and reports it through onConfirm for parent screen (prescriptions.tsx)
 * to make API call and close modal.
 */
const AddPrescriptionModal = ({visible, title, initialValues, submitLabel, onConfirm, onCancel} : Props) => {
    const { theme, colours } = useTheme();
    const [draft, setDraft] = useState<PrescriptionDetails>(emptyDraft); // whats been types into the input fields
    const [pickerField, setPickerField] = useState<'started_on' | 'stopped_on' | null>(null);

    /**
     * clears form to emptyDraft whenever 'visible' changes (modal is closed)
     */
    useEffect(() => {
      setDraft(visible ? (initialValues ?? emptyDraft) : emptyDraft);
      setPickerField(null);
      // only on visibility change, so typing isn't wiped if the parent re-renders
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
     * Function to render date input fields (started_on & stopped_on)
     */
    const renderDateField = (label: string, field: 'started_on' | 'stopped_on') => (
    <View style={theme.field}>
      <Text style={[theme.h6, theme.leftItems, {color : colours.onSurface}]}>{label}</Text>
      <Text> </Text>
      <Pressable
        style={[theme.textInput, { borderColor: colours.onSurface, justifyContent: 'center' }]}
        onPress={() => setPickerField(pickerField === field ? null : field)}
        >
        <Text style={[theme.body, { color: colours.onSurface }]}>
          {draft[field] ? formatDate(draft[field]) : 'Select date'}
        </Text>
      </Pressable>

    {draft[field] !== '' && (
      <Pressable onPress={() => setDraft((prev) => ({ ...prev, [field]: '' }))}>
        <Text style={[theme.body, { color: colours.onSurface, marginLeft: 8, marginTop: 4 }]}>Clear</Text>
      </Pressable>
    )}

    {pickerField === field && (
      <>
        <DateTimePicker
          value={draft[field] ? parseApiDate(draft[field]) : new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'inline' : 'default'}
          minimumDate={
            field === 'stopped_on' && draft.started_on ? parseApiDate(draft.started_on) : undefined
          }
          onValueChange={(_event, date) => {
            setDraft((prev) => ({ ...prev, [field]: toApiDate(date) }));
            if (Platform.OS === 'android') setPickerField(null); // Android's dialog closes itself
            }}
          onDismiss={() => {
            if (Platform.OS === 'android') setPickerField(null); // cancelled without picking
          }}
        />
        {Platform.OS === 'ios' && (
          <Pressable onPress={() => setPickerField(null)}>
            <Text style={[theme.body, { color: colours.primary, textAlign: 'center' }]}>Done</Text>
          </Pressable>
        )}
      </>
    )}
  </View>
    );

    /**
     * runs on 'add prescription' button press
     * breaks input into key value pairs, trims spaces from every value and doesnt include empty fields
     * passed back to prescriptions.tsx as PrescriptionDetails
     */
    const handleConfirmation = () => {
      const trimmed = Object.fromEntries(
      Object.entries(draft).map(([k, v]) => [k, v.trim()])
      ) as PrescriptionDetails;
      if (initialValues) {
        onConfirm(trimmed); // editing: keep empty strings so cleared fields get cleared
      } else {
        const clean = Object.fromEntries(
        Object.entries(trimmed).filter(([, v]) => v !== '')
        ) as PrescriptionDetails;
        onConfirm(clean);
        }
    };  

    const handleCancel = () => {
      onCancel();
    };
  
    /**
    * Function to render a text input section (split into sections)
    */
    const renderField = (label: string, field: keyof PrescriptionDetails, keyboardType: 'default' | 'numeric'| 'decimal-pad' = 'default') => (
      
        <View style={theme.field}>
          <Text style={[theme.h6, theme.leftItems, {color: colours.onSurface}]}>{label}</Text>
          <Text> </Text>
          <TextInput
            value={draft[field]}
            onChangeText={updateHandler(field)}
            keyboardType={keyboardType}
            placeholder={label}
            placeholderTextColor={colours.onSurface}
            style={[theme.textInput, { color: colours.onSurface, borderColor: colours.onSurface }]}
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
    <View style={theme.modalBackgroundColour}/>             
    
    
    <Pressable style={theme.modalView} onPress={onCancel}> 
        <Pressable
          style={[theme.card, { backgroundColor: colours.surface}]}
          onPress={() => {}}
        >

        <Text style={[theme.h4, { color: colours.onSurface }, {margin: 5}]}>{title}</Text>

        <ScrollView>
          
          {/**
           * Contents of the Modal
           * 
           * !!!!To implement: need strength dropdown for dosage based on api strength input
           */}
          {renderField('Name','name')}
          {renderField('Dosage','dosage', 'decimal-pad')}
          {renderField('Frequency','frequency', 'numeric')} 
          {renderField('Strength','strength', 'decimal-pad')}
          {renderDateField('Started on', 'started_on')}
          {initialValues && renderDateField('Stopped on', 'stopped_on')}
          {renderField('Notes','notes')}
        
          </ScrollView>

          {/**
           * Buttons outside of scrollview so they're stuck to the bottom of the modal
           */}
          <View style={[theme.modalButtons, theme.centerItems, theme.row]}>
            <Pressable
              style={[theme.modalButton, { borderColor: colours.onSurface, borderWidth: 1 }]}
              onPress={handleCancel}
            >
              <Text style={[theme.body, { color: colours.onSurface }]}>Go Back</Text>
            </Pressable>

            <Pressable
              style={[theme.modalButton, { backgroundColor: colours.primary, opacity: canSubmit ? 1:0.4 }]}
              onPress={handleConfirmation}
              disabled={!canSubmit}
            >
              <Text style={[theme.body, { color: colours.onPrimary}]}>{submitLabel}</Text>
            </Pressable>
          </View>
        </Pressable>
    </Pressable>
    </Modal>
  );
}

export default AddPrescriptionModal;