/**
 * Lists all of the patient's appointments, newest added first, opened from the see all
 * appointments button on the care planner.
 */
import { Fragment, useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { useTheme, ColourSet } from '../../../../context/ThemeContext';
import { Typography } from '../../../../constants/textSize';
import { lineThickness } from '../../../../constants/layout';
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
  const { colours, theme } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = createStyles(colours, theme, insets.bottom);
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

  const renderAppointmentRow = (appointment: ApiAppointment, index: number) => (
    <Fragment key={appointment.id}>
      {index > 0 && <View style={theme.line} />}
      {/* opens a summary of the appointment, going back returns here */}
      <Pressable
        style={styles.appointmentRow}
        onPress={() =>
          router.push({
            pathname: '/carePlanner/appointmentDetails',
            params: { id: appointment.id },
          })
        }
        accessibilityRole="button"
      >
        <View style={styles.appointmentInfo}>
          <Text style={styles.appointmentDate}>{formatDateTime(appointment.scheduled_date)}</Text>
          {!!appointment.doctor && (
            <Text style={styles.appointmentDetails}>{appointment.doctor}</Text>
          )}
          {!!appointment.health_service && (
            <Text style={styles.appointmentDetails}>{appointment.health_service}</Text>
          )}
        </View>
        <Ionicons name="chevron-forward-outline" size={16} color={colours.onSurface} />
      </Pressable>
    </Fragment>
  );

  return (
    <View style={styles.screen}>
      <ScrollView stickyHeaderIndices={[0]} contentContainerStyle={styles.content}>
        <View style={[theme.header, styles.title]}>
          <Text style={[theme.h4, theme.leftText, theme.fontOnSurface, styles.titleText]}>
            All Appointments
          </Text>
          {sorted.length > 0 && (
            <View style={[styles.sort, theme.leftText]}>
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
        </View>
        {!!message && <Text style={[styles.body, theme.leftText]}>{message}</Text>}
        {/* a card is only shown when it has appointments */}
        {upcoming.length > 0 && (
          <View style={[theme.sectionContainer, styles.sectionCard]}>
            <Text style={styles.headline}>Upcoming</Text>
            <View>{upcoming.map(renderAppointmentRow)}</View>
          </View>
        )}
        {past.length > 0 && (
          <View style={[theme.sectionContainer, styles.sectionCard]}>
            <Text style={styles.headline}>Past</Text>
            <View>{past.map(renderAppointmentRow)}</View>
          </View>
        )}
      </ScrollView>
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
      paddingBottom: 120 + bottomInset,
      gap: 38,
    },

    title: {
      marginBottom: -19,
    },

    titleText: {
      marginBottom: 8,
    },

    body: {
      ...text.body,
      color: colours.onBackground,
    },

    sort: {
      gap: 8,
      marginTop: 12,
    },

    sortHeading: {
      ...text.small,
      color: colours.onBackground,
    },

    field: {
      height: 40,
      paddingVertical: 5,
      paddingHorizontal: 10,
      borderWidth: 1,
      borderColor: colours.onSurface,
    },

    input: {
      ...text.body,
      color: colours.onSurface,
    },

    dropdown: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },

    optionList: {
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

    headline: {
      ...text.h5,
      color: colours.onBackground,
      width: '85%',
      alignSelf: 'center',
    },

    sectionCard: {
      gap: 4,
    },

    appointmentRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingBlock: 24,
      width: '85%',
      alignSelf: 'center',
    },

    appointmentInfo: {
      flex: 1,
      gap: 4,
    },

    appointmentDate: {
      ...text.body,
      color: colours.onSurface,
    },

    appointmentDetails: {
      ...text.small,
      color: colours.onSurface,
    },
  });
}
