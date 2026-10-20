/**
 * Lists all appointments shared with this user, split into upcoming and past and newest shared
 * first, opened from the see all shared appointments button on the care planner index page. 
 * 
 * Filter: all patients (default), individual patients
 * Sort: recently added, newest date
 */ 
import { Fragment, useCallback, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { useTheme, ColourSet } from '../../../../context/ThemeContext';
import { Typography } from '../../../../constants/textSize';
import { lineThickness } from '../../../../constants/layout';
import { formatDateTime } from '../../../../constants/date';
import { ApiAppointment, SupportLink } from '../../../../context/AppointmentContext';
import {
  apiSharedAppointments,
  apiSupportedPatients,
} from '../../../api/care_planner_api_helpers';

// shared appointment as the server lists it, with the patient's name
type ApiSharedAppointment = ApiAppointment & { patientName: string };

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
  const [sharedAppointments, setSharedAppointments] = useState<ApiSharedAppointment[] | null>(
    null,
  );
  // patients the user supports, for the filter
  const [supportLinks, setSupportLinks] = useState<SupportLink[]>([]);
  const [loadFailed, setLoadFailed] = useState(false);

  // reloads the shared appointments when the page is shown, so changes made on other pages appear
  useFocusEffect(
    useCallback(() => {
      const loadAppointments = async () => {
        try {
          const [loaded, patients]: [ApiSharedAppointment[], SupportLink[]] = await Promise.all([
            apiSharedAppointments(),
            apiSupportedPatients(),
          ]);
          // newest shared first
          setSharedAppointments(
            [...loaded].sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at)),
          );
          setSupportLinks(patients);
          setLoadFailed(false);
        } catch (error) {
          console.error('Failed to load shared appointments', error);
          setLoadFailed(true);
        }
      };
      loadAppointments();
    }, []),
  );

  // null shows the appointments of all patients
  const [patientId, setPatientId] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const selectedLink = supportLinks.find((link) => link.patientId === patientId);
  const shownAppointments = patientId
    ? (sharedAppointments ?? []).filter((appointment) => appointment.patient_profile === patientId)
    : (sharedAppointments ?? []);

  // choose a patient and close the dropdown
  const handleSelect = (id: string | null) => {
    setPatientId(id);
    setDropdownOpen(false);
  };

  const [sortBy, setSortBy] = useState<SortBy>('added');
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);

  // choose how to sort and close the dropdown
  const handleSortSelect = (value: SortBy) => {
    setSortBy(value);
    setSortDropdownOpen(false);
  };

  // loaded newest shared first, newest date puts the latest appointment time first
  const sorted =
    sortBy === 'date'
      ? [...shownAppointments].sort(
          (a, b) => Date.parse(b.scheduled_date) - Date.parse(a.scheduled_date),
        )
      : shownAppointments;

  // appointments whose time hasn't passed yet, then the rest, each keeping the chosen order
  const now = Date.now();
  const upcoming = sorted.filter((appointment) => Date.parse(appointment.scheduled_date) >= now);
  const past = sorted.filter((appointment) => Date.parse(appointment.scheduled_date) < now);

  const renderAppointmentRow = (appointment: ApiSharedAppointment, index: number) => (
    <Fragment key={appointment.id}>
      {index > 0 && <View style={theme.line} />}
      {/* opens the shared appointment, going back returns here */}
      <Pressable
        style={styles.appointmentRow}
        onPress={() =>
          router.push({
            pathname: '/carePlanner/editSharedAppointment',
            params: { id: appointment.id },
          })
        }
        accessibilityRole="button"
      >
        <View style={styles.appointmentInfo}>
          <Text style={styles.patientName}>{appointment.patientName}</Text>
          <Text style={styles.appointmentDate}>{formatDateTime(appointment.scheduled_date)}</Text>
          {/* optional fields that are empty are left out */}
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

  const filterOptions = [
    { id: null, label: 'All patients' },
    ...supportLinks.map((link) => ({ id: link.patientId, label: link.patientName })),
  ];

  return (
    <View style={styles.screen}>
      <ScrollView stickyHeaderIndices={[0]} contentContainerStyle={styles.content}>
        <View style={[theme.header, styles.title]}>
          <Text style={[theme.h4, theme.leftText, theme.fontOnSurface, styles.titleText]}>
            All shared appointments
          </Text>
          <View style={[styles.filter, theme.leftText]}>
            <Text style={styles.heading}>Filter by patient</Text>
            <TouchableOpacity
              style={[styles.field, styles.dropdown]}
              onPress={() => setDropdownOpen(!dropdownOpen)}
            >
              <Text style={styles.input}>{selectedLink?.patientName ?? 'All patients'}</Text>
              <Text style={styles.input}>{dropdownOpen ? '▲' : '▼'}</Text>
            </TouchableOpacity>
            {dropdownOpen && (
              <View style={styles.optionList}>
                {filterOptions.map((option, index) => (
                  <TouchableOpacity
                    key={option.id ?? 'all'}
                    style={[
                      styles.optionRow,
                      index > 0 && styles.divider,
                      patientId === option.id && styles.selectedRow, // highlights selected option
                    ]}
                    onPress={() => handleSelect(option.id)}
                  >
                    <Text style={[styles.input, patientId === option.id && styles.selectedText]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
          {sorted.length > 0 && (
            <View style={[styles.filter, theme.leftText]}>
              <Text style={styles.heading}>Sort by</Text>
              <TouchableOpacity
                style={[styles.field, styles.dropdown]}
                onPress={() => setSortDropdownOpen(!sortDropdownOpen)}
              >
                <Text style={styles.input}>
                  {SORT_OPTIONS.find((option) => option.value === sortBy)?.label}
                </Text>
                <Text style={styles.input}>{sortDropdownOpen ? '▲' : '▼'}</Text>
              </TouchableOpacity>
              {sortDropdownOpen && (
                <View style={styles.optionList}>
                  {SORT_OPTIONS.map((option, index) => (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        styles.optionRow,
                        index > 0 && styles.divider,
                        sortBy === option.value && styles.selectedRow, // highlights selected option
                      ]}
                      onPress={() => handleSortSelect(option.value)}
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
        {shownAppointments.length === 0 && (
          <Text style={[styles.body, theme.leftText]}>
            {loadFailed
              ? 'Shared appointments could not be loaded'
              : sharedAppointments === null
                ? 'Loading...'
                : selectedLink
                  ? `${selectedLink.patientName} has not shared any appointments with you`
                  : 'No appointments have been shared with you'}
          </Text>
        )}
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

    filter: {
      gap: 8,
      marginTop: 12,
    },

    heading: {
      ...text.small,
      color: colours.onBackground,
    },

    body: {
      ...text.body,
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
      borderTopColor: colours.ex3,
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

    patientName: {
      ...text.body,
      color: colours.onSurface,
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
