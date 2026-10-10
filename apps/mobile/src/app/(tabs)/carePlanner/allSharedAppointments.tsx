/**
 * Lists all appointments shared with this user, newest shared first, opened from the see all
 * shared appointments button on the care planner. Can be filtered to one patient from the user's
 * active support links.
 */
import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme as usePaperTheme } from 'react-native-paper';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { useTheme, ColourSet } from '../../../../context/ThemeContext';
import { textLayout } from '../../../../constants/layout';
import { formatDate } from '../../../../constants/date';
import { useAppointment } from '../../../../context/AppointmentContext';

export default function Screen() {
  const { colours } = useTheme();
  const styles = createStyles(colours);
  const router = useRouter();
  const { colors: paperColours } = usePaperTheme();
  const { sharedAppointments, supportLinks } = useAppointment();

  // null shows the appointments of all patients
  const [patientId, setPatientId] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const selectedLink = supportLinks.find((link) => link.patientId === patientId);
  const shownAppointments = patientId
    ? sharedAppointments.filter((appointment) => appointment.patientId === patientId)
    : sharedAppointments;

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
            {selectedLink
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
              <Text style={styles.appointmentDate}>{formatDate(appointment.scheduled_date)}</Text>
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
