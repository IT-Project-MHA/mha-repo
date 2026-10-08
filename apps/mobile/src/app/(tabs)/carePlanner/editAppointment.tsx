/**
 * Patients change the details of a submitted appointment from this screen, opened from the
 * appointment details page.
 */
import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme as usePaperTheme } from 'react-native-paper';
import { DatePickerInput } from 'react-native-paper-dates';
import Button from '../../../../components/atomicUI/Button';
import { useTheme, ColourSet } from '../../../../context/ThemeContext';
import { textLayout } from '../../../../constants/layout';
import { parseDate, toDateString } from '../../../../constants/date';
import { useAppointment } from '../../../../context/AppointmentContext';

const HEALTH_SERVICES = [
  'General Practitioner',
  'Other',
];

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
  const { id } = useLocalSearchParams<{ id: string }>();
  const { appointments, updateAppointment } = useAppointment();
  const appointment = appointments.find((item) => item.id === id);

  // starts with the appointment's saved details
  const [date, setDate] = useState<Date | undefined>(
    appointment ? parseDate(appointment.scheduled_date) : undefined,
  );
  const [doctor, setDoctor] = useState(appointment?.doctor ?? '');
  // null when no service is chosen
  const [service, setService] = useState<string | null>(appointment?.health_service || null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showError, setShowError] = useState(false);

  // choose a health service and close the dropdown, choosing it again clears it
  const handleSelect = (option: string) => {
    setService((prev) => (prev === option ? null : option));
    setDropdownOpen(false);
  };

  // saves the changes to the appointment and goes back to its details, if mandatory fields are filled
  const handleSubmit = () => {
    if (!date) {
      setShowError(true);
      return;
    }
    updateAppointment(id, {
      scheduled_date: toDateString(date),
      doctor: doctor.trim(),
      health_service: service ?? '',
    });
    router.back();
  };

  if (!appointment) {
    return (
      <View style={styles.screen}>
        <View style={styles.content}>
          <Text style={styles.input}>This appointment could not be found.</Text>
        </View>
      </View>
    );
  }

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
            if (newDate) setShowError(false);
          }}
          validRange={{ startDate: startOfToday() }}
          placeholder="Pick appointment date"
          withDateFormatInLabel={false}
          style={styles.dateInput}
          underlineColor="transparent"
          activeUnderlineColor="transparent"
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

        <View>
          <Text style={styles.heading}>Health services</Text>
          <Text style={styles.subheading}>Optional</Text>
        </View>
        <TouchableOpacity
          style={[styles.field, styles.dropdown]}
          onPress={() => setDropdownOpen(!dropdownOpen)}
        >
          <Text
            style={
              service
                ? styles.input
                : [styles.placeholder, { color: paperColours.onSurfaceVariant }]
            }
          >
            {service ?? 'Select a health service'}
          </Text>
          <Text style={styles.input}>{dropdownOpen ? '▲' : '▼'}</Text>
        </TouchableOpacity>
        {dropdownOpen && (
          <View style={styles.optionList}>
            {HEALTH_SERVICES.map((option, index) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.optionRow,
                  index > 0 && styles.divider,
                  service === option && styles.selectedRow, // highlights selected option
                ]}
                onPress={() => handleSelect(option)}
              >
                <Text style={[styles.input, service === option && styles.selectedText]}>
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      <View style={styles.bottomBar}>
        {showError && (
          <Text style={[styles.error, { color: paperColours.error }]}>
            Please fill in all mandatory fields
          </Text>
        )}
        <Button label="Save" onPress={handleSubmit} buttonType="primaryButton" />
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
      marginBottom: 44,
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

    placeholder: {
      fontSize: 16,
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
