/**
 * Patients change the details of a submitted appointment from this screen, opened from the
 * appointment details page.
 */
import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme as usePaperTheme } from 'react-native-paper';
import Button from '../../../../components/atomicUI/Button';
import DateInput from '../../../../components/atomicUI/DateInput';
import TimeInput from '../../../../components/atomicUI/TimeInput';
import { useTheme, ColourSet } from '../../../../context/ThemeContext';
import { Typography } from '../../../../constants/textSize';
import { lineThickness } from '../../../../constants/layout';
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
  const { colours, theme } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = createStyles(colours, theme, insets.bottom);
  const router = useRouter();
  const { colors: paperColours } = usePaperTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { appointments } = useAppointment();
  const appointment = appointments.find((item) => item.id === id);

  // starts with the appointment's saved details
  const [date, setDate] = useState<Date | undefined>(
    appointment ? new Date(appointment.scheduled_date) : undefined,
  );
  const [time, setTime] = useState<TimeOfDay | undefined>(
    appointment ? timeOf(new Date(appointment.scheduled_date)) : undefined,
  );
  const [doctor, setDoctor] = useState(appointment?.doctor ?? '');
  const [service, setService] = useState(appointment?.health_service || DEFAULT_HEALTH_SERVICE);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const healthServices = useHealthServices();

  // label of the chosen health service
  const serviceLabel =
    healthServices.find((option) => option.value === service)?.label ?? service;
  // message shown above the save button, null when there is nothing wrong
  const [error, setError] = useState<string | null>(null);

  // choose a health service and close the dropdown
  const handleSelect = (option: string) => {
    setService(option);
    setDropdownOpen(false);
  };

  // saves the changes to the appointment and goes back to its details, if mandatory fields are filled
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    // stops a second press saving twice
    if (saving) return;
    if (!date || !time) {
      setError('Please fill in all mandatory fields');
      return;
    }
    // the date & time are only saved when they changed, so a past appointment can still have its
    // other details changed. The server rejects a new time in the past
    const scheduledDate = withTime(date, time);
    const dateChanged =
      !appointment || scheduledDate.getTime() !== Date.parse(appointment.scheduled_date);
    if (dateChanged && scheduledDate < new Date()) {
      setError('Appointment cannot be in the past');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await apiSaveAppointment(id, {
        scheduledDate: dateChanged ? scheduledDate : undefined,
        doctor: doctor.trim(),
        healthService: service,
      });
      // the appointment's page reloads it from the server
      router.back();
    } catch (saveError) {
      console.error('Failed to save appointment', saveError);
      setError(apiErrorMessage(saveError, 'Your appointment could not be saved, please try again'));
    } finally {
      setSaving(false);
    }
  };

  if (!appointment) {
    return (
      <View style={styles.screen}>
        <View style={styles.content}>
          <Text style={[styles.input, theme.leftText]}>This appointment could not be found.</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScrollView stickyHeaderIndices={[0]} contentContainerStyle={styles.content}>
        <View style={[theme.header, styles.title]}>
          <Text style={[theme.h4, theme.leftText, theme.fontOnSurface]}>Edit Appointment</Text>
        </View>
        <View style={[theme.sectionContainer, styles.card]}>
          <View style={styles.cardContent}>
            <Text style={[styles.heading, styles.label, styles.firstLabel]}>Appointment date</Text>
            <DateInput
              value={date}
              onChange={(newDate) => {
                setDate(newDate);
                if (newDate && time) setError(null);
              }}
              placeholder="Pick appointment date"
              earliest={startOfToday()}
            />

            <Text style={[styles.heading, styles.label]}>Appointment time</Text>
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

            <View style={styles.label}>
              <Text style={styles.heading}>Doctor's name</Text>
              <Text style={styles.subheading}>Optional</Text>
            </View>
            <TextInput
              style={[styles.field, styles.input]}
              value={doctor}
              onChangeText={setDoctor}
              placeholder="Doctor's name"
              placeholderTextColor={colours.onSurface}
            />

            <Text style={[styles.heading, styles.label]}>Health services</Text>
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
          </View>
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        {!!error && (
          <Text style={[styles.error, { color: paperColours.error, borderColor: paperColours.error }]}>
            {error}
          </Text>
        )}
        <Button
          label={saving ? 'Saving...' : 'Save'}
          onPress={handleSubmit}
          buttonType="roundButton"
        />
      </View>
    </View>
  );
}

function createStyles(colours: ColourSet, text: Typography, bottomInset: number) {
  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colours.background,
    },

    content: {
      paddingBottom: 200 + bottomInset,
      gap: 38,
    },

    title: {
      marginBottom: -19,
    },

    card: {
      gap: 12,
    },

    cardContent: {
      paddingHorizontal: '5%',
      paddingBottom: 5,
    },

    bottomBar: {
      position: 'absolute',
      left: '7.5%',
      width: '85%',
      bottom: 120 + bottomInset,
      gap: 8,
    },

    heading: {
      ...text.h6,
      color: colours.onSurface,
      paddingHorizontal: '5%',
    },

    subheading: {
      ...text.small,
      color: colours.onBackground,
      paddingHorizontal: '5%',
      marginTop: 4,
    },

    label: {
      marginTop: 29,
      marginBottom: 19,
    },

    firstLabel: {
      marginTop: 5,
    },

    field: {
      height: 40,
      paddingVertical: 5,
      paddingHorizontal: 10,
      marginHorizontal: 8,
      borderWidth: 1,
      borderColor: colours.onSurface,
      justifyContent: 'center',
    },

    input: {
      ...text.body,
      color: colours.onSurface,
    },

    error: {
      ...text.small,
      borderWidth: 1,
      borderRadius: 8,
      paddingVertical: 6,
      paddingHorizontal: 12,
      backgroundColor: colours.background,
      overflow: 'hidden',
    },

    dropdown: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },

    optionList: {
      marginTop: 8,
      marginHorizontal: 8,
      borderWidth: 1,
      borderColor: colours.onSurface,
      overflow: 'hidden',
    },

    optionRow: {
      paddingVertical: 10,
      paddingHorizontal: 12,
    },

    divider: {
      borderTopWidth: lineThickness,
      borderTopColor: colours.secondary2,
    },

    selectedRow: {
      backgroundColor: colours.secondary,
    },

    selectedText: {
      color: colours.onSecondary,
    },
  });
}
