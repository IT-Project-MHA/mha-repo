/**
 * Patients create a new appointment from this screen, opened from the care planner.
 */
import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme as usePaperTheme } from 'react-native-paper';
import { DatePickerInput } from 'react-native-paper-dates';
import Button from '../../../../components/atomicUI/Button';
import TimeInput from '../../../../components/atomicUI/TimeInput';
import { useTheme, ColourSet } from '../../../../context/ThemeContext';
import { textLayout } from '../../../../constants/layout';
import {
  APPOINTMENT_EARLIEST,
  APPOINTMENT_LATEST,
  TimeOfDay,
  timeOf,
  withTime,
} from '../../../../constants/date';
import { useAppointment } from '../../../../context/AppointmentContext';
import { DEFAULT_HEALTH_SERVICE, useHealthServices } from '../../../../constants/dropdownOptions';
import { apiErrorMessage, apiSaveAppointment } from '../../../api/care_planner_api_helpers';

// start of today, appointments cannot be scheduled in the past
const startOfToday = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
};

export default function Screen() {
  const { colours } = useTheme();
  const styles = createStyles(colours);
  const router = useRouter();
  const { colors: paperColours } = usePaperTheme();
  const { draft, updateDraft } = useAppointment();

  // starts with the details already entered for this appointment
  const [date, setDate] = useState<Date | undefined>(draft.scheduledDate ?? undefined);
  const [time, setTime] = useState<TimeOfDay | undefined>(
    draft.scheduledDate ? timeOf(draft.scheduledDate) : undefined,
  );
  const [doctor, setDoctor] = useState(draft.doctor);
  const [service, setService] = useState(draft.healthService ?? DEFAULT_HEALTH_SERVICE);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const healthServices = useHealthServices();
  // message shown above the save button, null when there is nothing wrong
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // label of the chosen health service
  const serviceLabel =
    healthServices.find((option) => option.value === service)?.label ?? service;

  // choose a health service and close the dropdown
  const handleSelect = (option: string) => {
    setService(option);
    setDropdownOpen(false);
  };

  // opens the add a support person page on top of this one, if mandatory fields are filled
  const handleSubmit = async () => {
    // stops a second press creating the appointment twice
    if (saving) return;
    if (!date || !time) {
      setError('Please fill in all mandatory fields');
      return;
    }
    // the server rejects appointments in the past
    if (withTime(date, time) < new Date()) {
      setError('Appointment cannot be in the past');
      return;
    }
    const details = {
      scheduledDate: withTime(date, time),
      doctor: doctor.trim(),
      healthService: service,
    };

    // creates the appointment on the server, or updates it when coming back to this page
    setSaving(true);
    setError(null);
    try {
      const saved = await apiSaveAppointment(draft.appointmentId, details);
      // the server's health service, its default is used when none was chosen
      updateDraft({ ...details, appointmentId: saved.id, healthService: saved.health_service });
      router.push('/carePlanner/addSupportPerson');
    } catch (saveError) {
      console.error('Failed to save appointment', saveError);
      setError(apiErrorMessage(saveError, 'Your appointment could not be saved, please try again'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.heading}>Appointment date</Text>
        <DatePickerInput
          locale="en-GB"
          inputMode="start"
          value={date}
          onChange={(newDate) => {
            setDate(newDate);
            if (newDate && time) setError(null);
          }}
          validRange={{ startDate: startOfToday() }}
          placeholder="Pick appointment date"
          withDateFormatInLabel={false}
          style={styles.dateInput}
          underlineColor="transparent"
          activeUnderlineColor="transparent"
        />

        <Text style={styles.heading}>Appointment time</Text>
        <TimeInput
          value={time}
          onChange={(newTime) => {
            setTime(newTime);
            if (date) setError(null);
          }}
          placeholder="Pick appointment time"
          earliest={APPOINTMENT_EARLIEST}
          latest={APPOINTMENT_LATEST}
        />

        <View>
          <Text style={styles.heading}>Doctor's name</Text>
          <Text style={styles.subheading}>Optional</Text>
        </View>
        <TextInput
          style={[styles.field, styles.input]}
          value={doctor}
          onChangeText={setDoctor}
          placeholder="Doctor's name"
          placeholderTextColor={paperColours.onSurfaceVariant}
        />

        <Text style={styles.heading}>Health services</Text>
        <TouchableOpacity
          style={[styles.field, styles.dropdown]}
          onPress={() => setDropdownOpen(!dropdownOpen)}
        >
          <Text style={styles.input}>{serviceLabel}</Text>
          <Text style={styles.input}>{dropdownOpen ? '▲' : '▼'}</Text>
        </TouchableOpacity>
        {dropdownOpen && (
          <View style={styles.optionList}>
            {healthServices.map(({ value, label }, index) => (
              <TouchableOpacity
                key={value}
                style={[
                  styles.optionRow,
                  index > 0 && styles.divider,
                  service === value && styles.selectedRow, // highlights selected option
                ]}
                onPress={() => handleSelect(value)}
              >
                <Text style={[styles.input, service === value && styles.selectedText]}>
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      <View style={styles.bottomBar}>
        {!!error && (
          <Text style={[styles.error, { color: paperColours.error }]}>
            {error}
          </Text>
        )}
        <Button
          label={saving ? 'Saving...' : 'Save'}
          onPress={handleSubmit}
          buttonType="primaryButton"
        />
      </View>
    </View>
  );
}

function createStyles(colours: ColourSet) {
  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colours.background,
    },

    content: {
      paddingHorizontal: 16,
      paddingTop: 24,
      paddingBottom: 16,
      gap: 12,
    },

    bottomBar: {
      paddingHorizontal: 16,
      marginBottom: 120,
      gap: 8,
    },

    heading: {
      ...textLayout,
      color: colours.onBackground,
    },

    subheading: {
      fontSize: 14,
      color: colours.onBackground,
    },

    field: {
      backgroundColor: colours.surface,
      borderRadius: 8,
      padding: 12,
    },

    dateInput: {
      backgroundColor: colours.surface,
      borderRadius: 8,
      overflow: 'hidden',
    },

    input: {
      fontSize: 16,
      color: colours.onSurface,
    },

    error: {
      fontSize: 14,
    },

    dropdown: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },

    optionList: {
      backgroundColor: colours.surface,
      borderRadius: 8,
      overflow: 'hidden',
    },

    optionRow: {
      paddingVertical: 10,
      paddingHorizontal: 12,
    },

    divider: {
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colours.ex3,
    },

    selectedRow: {
      backgroundColor: colours.secondary,
    },

    selectedText: {
      color: colours.onSecondary,
      fontWeight: 'bold',
    },
  });
}
