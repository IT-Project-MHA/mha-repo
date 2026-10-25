import {useEffect, useState} from "react";
import {Modal, View, Text, Pressable, TextInput, ScrollView, Platform} from 'react-native'
import { useTheme } from "../../context/ThemeContext";
import DateTimePicker from '@react-native-community/datetimepicker';
import { toApiDate, parseApiDate, formatDate } from '../../constants/date';
import { apiStrengthUnit, apiFrequencyUnit, apiFormUnit } from '@/api/django-API';

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
  frequency_unit: string;
  strength: string;
  strength_unit: string;
  form: string;
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
  frequency_unit: '',
  strength: '',
  strength_unit: '',
  form: '',
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
  const [units, setUnits] = useState<{ value: string; label: string }[]>([]); // from apiStrengthUnit
  const [unitOpen, setUnitOpen] = useState(false);
  const [forms, setForms] = useState<{ value: string; label: string }[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [freqUnits, setFreqUnits] = useState<{ value: string; label: string }[]>([]);
  const [freqOpen, setFreqOpen] = useState(false);

  useEffect(() => {
  apiStrengthUnit()
    .then(setUnits)
    .catch((e) => console.log('failed to load units', e?.message, e?.status));
  apiFrequencyUnit()
    .then(setFreqUnits)
    .catch((e) => console.log('failed to load frequency units', e?.message, e?.status));
  apiFormUnit()
    .then(setForms)
    .catch((e) => console.log('failed to load forms', e?.message, e?.status));
}, []);

  /**
   * clears form to emptyDraft whenever 'visible' changes (modal is closed)
   */
  useEffect(() => {
    setDraft(visible ? (initialValues ?? emptyDraft) : emptyDraft);
    setPickerField(null);
    // reset dropdowns when modal closes
    setUnitOpen(false);
    setFormOpen(false);
    setFreqOpen(false);
    // only on visibility change, so typing isn't wiped if the parent re-renders
  }, [visible]);


  /**
   * add button can only be pressed when the three required fields are filled
   */
  const canSubmit =
    draft.name.trim() !== '' &&
    draft.dosage.trim() !== '' &&
    draft.frequency.trim() !== '' &&
    draft.frequency_unit !== '' &&
      (draft.strength.trim() === '' || draft.strength_unit !== ''); // strength requires a unit

  /**
   *handler to update the field when the user types into it
   */
  const updateHandler = (field: keyof PrescriptionDetails) => (text: string) => setDraft((prev) => ({...prev, [field]: text}))

  /**
   * Function to render date input fields (started_on & stopped_on)
   */
  const renderDateField = (label: string, field: 'started_on' | 'stopped_on', note?: string) => (
    <View style={theme.field}>
      <Text style={[theme.body, {color: colours.onSurface, marginTop: 10}]}>{label}</Text>
      {note ? (
        <Text style={[theme.xSmall, { color: colours.onSurface, marginBottom: 20 }]}>{note}</Text>
      ) : null}
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
  const renderField = (
    label: string,
    field: keyof PrescriptionDetails,
    keyboardType: 'default' | 'numeric' | 'decimal-pad' = 'default',
    note?: string,
    trailing?: React.ReactNode, // element shown beside the input, e.g. a unit dropdown button
  ) => (
    <View style={theme.field}>
      <Text style={[theme.body, { color: colours.onSurface, marginTop: 10 }]}>{label}</Text>
      {note ? (
        <Text style={[theme.xSmall, { color: colours.onSurface, marginBottom: 20 }]}>{note}</Text>
      ) : null}

      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <TextInput
          value={draft[field]}
          onChangeText={updateHandler(field)}
          keyboardType={keyboardType}
          placeholder={label}
          placeholderTextColor={colours.onSurface}
          style={[theme.textInput, { flex: 1, color: colours.onSurface, borderColor: colours.onSurface }]}
        />
        {trailing}
      </View>
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
             * Renders contents of the Modal
             */}
            {renderField('Name','name','default','What is this medication called?')}

            {/* Form dropdown */}
            <View style={theme.field}>
              <Text style={[theme.body, { color: colours.onSurface, marginTop: 10 }]}>Form</Text>
              <Text style={[theme.xSmall, { color: colours.onSurface, marginBottom: 20 }]}>
                What type of medication is it?
              </Text>
              <Pressable
                style={[theme.textInput, { borderColor: colours.onSurface, justifyContent: 'center' }]}
                onPress={() => setFormOpen(!formOpen)}
              >
                <Text style={[theme.body, { color: colours.onSurface }]}>
                  {forms.find((f) => f.value === draft.form)?.label ?? (draft.form || 'Select form')} ▾
                </Text>
              </Pressable>
            </View>

            {formOpen && forms.map((f) => (
              <Pressable
                key={f.value}
                style={{ paddingVertical: 8, paddingHorizontal: 16 }}
                onPress={() => {
                  setDraft((prev) => ({ ...prev, form: f.value }));
                  setFormOpen(false);
                }}
              >
                <Text style={[theme.body, { color: colours.onSurface }]}>{f.label}</Text>
              </Pressable>
            ))}

            {/* Strength with its unit */}
            {renderField('Strength', 'strength', 'decimal-pad', 'What is the strength of a unit?',
            <Pressable
              style={[theme.textInput, { borderColor: colours.onSurface, justifyContent: 'center', minWidth: 80 }]}
              onPress={() => setUnitOpen(!unitOpen)}
              >
              <Text style={[theme.body, { color: colours.onSurface }]}>
                {units.find((u) => u.value === draft.strength_unit)?.label ?? 'Unit'} ▾
              </Text>
            </Pressable>
            )}

            {unitOpen && units.map((u) => (
              <Pressable
                key={u.value}
                style={{ paddingVertical: 8, paddingHorizontal: 16 }}
                onPress={() => {
                setDraft((prev) => ({ ...prev, strength_unit: u.value }));
                setUnitOpen(false);
                }}
              >
                <Text style={[theme.body, { color: colours.onSurface }]}>{u.label}</Text>
              </Pressable>
            ))}
            {renderField('Dosage','dosage', 'decimal-pad', 'How many you take each time?' )}
            {/* Frequency with its unit */}
            {renderField('Frequency', 'frequency', 'numeric', 'How often do you take this medication?',
              <Pressable
                style={[theme.textInput, { borderColor: colours.onSurface, justifyContent: 'center', minWidth: 110 }]}
                onPress={() => setFreqOpen(!freqOpen)}
                >
                <Text style={[theme.body, { color: colours.onSurface }]}>
                  {freqUnits.find((u) => u.value === draft.frequency_unit)?.label ?? 'Unit'} ▾
                </Text>
              </Pressable>
            )}

            {freqOpen && freqUnits.map((u) => (
              <Pressable
                key={u.value}
                style={{ paddingVertical: 8, paddingHorizontal: 16 }}
                onPress={() => {
                  setDraft((prev) => ({ ...prev, frequency_unit: u.value }));
                  setFreqOpen(false);
                }}
              >
                <Text style={[theme.body, { color: colours.onSurface }]}>{u.label}</Text>
              </Pressable>
            ))}

            {renderDateField('Started on', 'started_on', 'What date did you start this medication?')}
            {initialValues && renderDateField('Stopped on', 'stopped_on', 'What date did you finish this medication?')}
            {renderField('Notes','notes', 'default', 'Optional: side effects, what it helps with, or anything to tell your doctor.')}

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