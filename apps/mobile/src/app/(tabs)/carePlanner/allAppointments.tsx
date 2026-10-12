/**
 * Lists all of the patient's appointments, newest added first, opened from the see all
 * appointments button on the care planner.
 */
import { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TouchableOpacity } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useTheme, ColourSet } from '../../../../context/ThemeContext';
import { textLayout } from '../../../../constants/layout';
import { formatDateTime } from '../../../../constants/date';
import { ApiAppointment } from '../../../../context/AppointmentContext';
import { apiPatientAppointments } from '../../../api/care_planner_api_helpers';

// ways the appointments can be sorted, the first is the default
const SORT_OPTIONS = [
  { value: 'added', label: 'Recently added' },
  { value: 'date', label: 'Newest date' },
] as const;
type SortBy = (typeof SORT_OPTIONS)[number]['value'];

export default function Screen() {
  const { colours } = useTheme();
  const styles = createStyles(colours);
  const router = useRouter();
  // null while loading
  const [appointments, setAppointments] = useState<ApiAppointment[] | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const [sortBy, setSortBy] = useState<SortBy>('added');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // choose how to sort and close the dropdown
  const handleSelect = (value: SortBy) => {
    setSortBy(value);
    setDropdownOpen(false);
  };

  // reloads the appointments when the page is shown, so changes made on other pages appear
  useFocusEffect(
    useCallback(() => {
      const loadAppointments = async () => {
        try {
          const loaded: ApiAppointment[] = await apiPatientAppointments();
          // newest added first
          setAppointments(
            [...loaded].sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at)),
          );
          setLoadFailed(false);
        } catch (error) {
          console.error('Failed to load appointments', error);
          setLoadFailed(true);
        }
      };
      loadAppointments();
    }, []),
  );

  // message shown instead of the list
  const message = loadFailed
    ? 'Your appointments could not be loaded'
    : appointments === null
      ? 'Loading...'
      : appointments.length === 0
        ? 'You have no appointments'
        : null;

  // loaded newest added first, newest date puts the latest appointment time first
  const sorted =
    sortBy === 'date'
      ? [...(appointments ?? [])].sort(
          (a, b) => Date.parse(b.scheduled_date) - Date.parse(a.scheduled_date),
        )
      : (appointments ?? []);

  // appointments whose time hasn't passed yet, then the rest, each keeping the chosen order
  const now = Date.now();
  const upcoming = sorted.filter((appointment) => Date.parse(appointment.scheduled_date) >= now);
  const past = sorted.filter((appointment) => Date.parse(appointment.scheduled_date) < now);

  const renderAppointmentCard = (appointment: ApiAppointment) => (
    // opens a summary of the appointment, going back returns here
    <Pressable
      key={appointment.id}
      style={styles.appointmentCard}
      onPress={() =>
        router.push({
          pathname: '/carePlanner/appointmentDetails',
          params: { id: appointment.id },
        })
      }
      accessibilityRole="button"
    >
      <Text style={styles.appointmentDate}>{formatDateTime(appointment.scheduled_date)}</Text>
      {!!appointment.doctor && (
        <Text style={styles.appointmentDetails}>{appointment.doctor}</Text>
      )}
      {!!appointment.health_service && (
        <Text style={styles.appointmentDetails}>{appointment.health_service}</Text>
      )}
    </Pressable>
  );

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        {!!message && <Text style={styles.body}>{message}</Text>}
        {sorted.length > 0 && (
          // extra space separates the sort from the appointments
          <View style={styles.sort}>
            <Text style={styles.sortHeading}>Sort by</Text>
            <TouchableOpacity
              style={[styles.field, styles.dropdown]}
              onPress={() => setDropdownOpen(!dropdownOpen)}
            >
              <Text style={styles.input}>
                {SORT_OPTIONS.find((option) => option.value === sortBy)?.label}
              </Text>
              <Text style={styles.input}>{dropdownOpen ? '▲' : '▼'}</Text>
            </TouchableOpacity>
            {dropdownOpen && (
              <View style={styles.optionList}>
                {SORT_OPTIONS.map((option, index) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.optionRow,
                      index > 0 && styles.divider,
                      sortBy === option.value && styles.selectedRow, // highlights selected option
                    ]}
                    onPress={() => handleSelect(option.value)}
                  >
                    <Text style={[styles.input, sortBy === option.value && styles.selectedText]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}
        {/* a heading is only shown when it has appointments */}
        {upcoming.length > 0 && <Text style={styles.headline}>Upcoming</Text>}
        {upcoming.map(renderAppointmentCard)}
        {past.length > 0 && (
          <Text style={[styles.headline, upcoming.length > 0 && styles.laterHeadline]}>Past</Text>
        )}
        {past.map(renderAppointmentCard)}
      </ScrollView>
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
      paddingBottom: 60, // keeps the last card above the nav bar
      gap: 12,
    },

    body: {
      fontSize: 16,
      lineHeight: 24,
      letterSpacing: 0.5,
      color: colours.onBackground,
    },

    sort: {
      gap: 8,
      marginBottom: 12,
    },

    sortHeading: {
      fontSize: 14,
      color: colours.onBackground,
    },

    field: {
      backgroundColor: colours.surface,
      borderRadius: 8,
      padding: 12,
    },

    input: {
      fontSize: 16,
      color: colours.onSurface,
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

    headline: {
      fontSize: 22,
      lineHeight: 28,
      fontWeight: 'bold',
      color: colours.onBackground,
    },

    // more space above the past heading, separating it from the upcoming appointments
    laterHeadline: {
      marginTop: 12,
    },

    appointmentCard: {
      backgroundColor: colours.surface,
      borderRadius: 8,
      padding: 12,
      gap: 4,
    },

    appointmentDate: {
      ...textLayout,
      color: colours.onSurface,
    },

    appointmentDetails: {
      fontSize: 14,
      color: colours.onSurface,
    },
  });
}
