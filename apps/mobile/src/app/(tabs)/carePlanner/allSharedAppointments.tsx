/**
 * Lists all appointments shared with this user, newest shared first, opened from the see all
 * shared appointments button on the care planner. Can be filtered to one patient from the user's
 * active support links.
 */
import { useCallback, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useTheme as usePaperTheme } from 'react-native-paper';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { useTheme, ColourSet } from '../../../../context/ThemeContext';
import { textLayout } from '../../../../constants/layout';
import { formatDateTime } from '../../../../constants/date';
import { ApiAppointment, SupportLink } from '../../../../context/AppointmentContext';
import {
  apiSharedAppointments,
  apiSupportedPatients,
} from '../../../api/care_planner_api_helpers';

// shared appointment as the server lists it, with the patient's name
type ApiSharedAppointment = ApiAppointment & { patientName: string };

export default function Screen() {
  const { colours } = useTheme();
  const styles = createStyles(colours);
  const router = useRouter();
  const { colors: paperColours } = usePaperTheme();
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

  const filterOptions = [
    { id: null, label: 'All patients' },
    ...supportLinks.map((link) => ({ id: link.patientId, label: link.patientName })),
  ];

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* extra space separates the filter from the appointments */}
        <View style={styles.filter}>
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

        {shownAppointments.length === 0 && (
          <Text style={[styles.body, { color: paperColours.onSurfaceVariant }]}>
            {loadFailed
              ? 'Shared appointments could not be loaded'
              : sharedAppointments === null
                ? 'Loading...'
                : selectedLink
                  ? `${selectedLink.patientName} has not shared any appointments with you`
                  : 'No appointments have been shared with you'}
          </Text>
        )}
        {shownAppointments.map((appointment) => (
          // opens the shared appointment, going back returns here
          <Pressable
            key={appointment.id}
            style={styles.appointmentCard}
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
            <Ionicons name="chevron-forward" size={24} color={colours.onSurface} />
          </Pressable>
        ))}
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
      paddingBottom: 60,
      gap: 12,
    },

    filter: {
      gap: 12,
      marginBottom: 12,
    },

    heading: {
      ...textLayout,
      color: colours.onBackground,
    },

    body: {
      fontSize: 16,
      lineHeight: 24,
      letterSpacing: 0.5,
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

    appointmentCard: {
      backgroundColor: colours.surface,
      borderRadius: 8,
      padding: 12,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },

    // takes the card's width apart from the chevron
    appointmentInfo: {
      flex: 1,
      gap: 4,
    },

    patientName: {
      ...textLayout,
      fontWeight: 'bold',
      color: colours.onSurface,
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
