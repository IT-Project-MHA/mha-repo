/**
 * Lists all of the patient's appointments, newest added first, opened from the see all
 * appointments button on the care planner.
 */
import { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useTheme, ColourSet } from '../../../../context/ThemeContext';
import { textLayout } from '../../../../constants/layout';
import { formatDateTime } from '../../../../constants/date';
import { ApiAppointment } from '../../../../context/AppointmentContext';
import { apiPatientAppointments } from '../../../api/care_planner_api_helpers';

export default function Screen() {
  const { colours } = useTheme();
  const styles = createStyles(colours);
  const router = useRouter();
  // null while loading
  const [appointments, setAppointments] = useState<ApiAppointment[] | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);

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

  // appointments whose time hasn't passed yet, then the rest, each keeping the newest added first
  const now = Date.now();
  const upcoming = (appointments ?? []).filter(
    (appointment) => Date.parse(appointment.scheduled_date) >= now,
  );
  const past = (appointments ?? []).filter(
    (appointment) => Date.parse(appointment.scheduled_date) < now,
  );

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
