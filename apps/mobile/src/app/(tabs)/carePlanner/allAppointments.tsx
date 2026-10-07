/**
 * Lists all of the patient's appointments, newest added first, opened from the see all
 * appointments button on the care planner.
 */
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme, ColourSet } from '../../../../context/ThemeContext';
import { textLayout } from '../../../../constants/layout';
import { formatDate } from '../../../../constants/date';
import { useAppointment } from '../../../../context/AppointmentContext';

export default function Screen() {
  const { colours } = useTheme();
  const styles = createStyles(colours);
  const router = useRouter();
  const { appointments } = useAppointment();

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        {appointments.length === 0 && (
          <Text style={styles.body}>You have no appointments</Text>
        )}
        {appointments.map((appointment) => (
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
            <Text style={styles.appointmentDate}>{formatDate(appointment.scheduled_date)}</Text>
            {!!appointment.doctor && (
              <Text style={styles.appointmentDetails}>{appointment.doctor}</Text>
            )}
            {!!appointment.health_service && (
              <Text style={styles.appointmentDetails}>{appointment.health_service}</Text>
            )}
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
      paddingBottom: 60, // keeps the last card above the nav bar
      gap: 12,
    },

    body: {
      fontSize: 16,
      lineHeight: 24,
      letterSpacing: 0.5,
      color: colours.onBackground,
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
