/**
 * All user types have access to this screen
 */
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Button from '../../../../components/atomicUI/Button';
import { useTheme, ColourSet } from '../../../../context/ThemeContext';
import { textLayout } from '../../../../constants/layout';

// placeholder appointments
const APPOINTMENTS = [
  { id: '1', scheduled_date: '2026-10-12', doctor: 'John Doe', health_service: 'General Practitioner' },
  { id: '2', scheduled_date: '2026-10-20', doctor: 'John Doe', health_service: '' },
  { id: '3', scheduled_date: '2026-11-03', doctor: '', health_service: '' },
];

// formats a YYYY-MM-DD date as e.g. 'Mon, 12 Oct 2026'
const formatDate = (date: string) => {
  const [year, month, day] = date.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('en-AU', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

export default function Screen() {
  const { colours } = useTheme();
  const styles = createStyles(colours);
  const router = useRouter();

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.headline}>Your Care Planner</Text>
        <Text style={styles.body}>Prepare for your appointments with confidence.</Text>

        <View style={styles.filledCard}>
          <Text style={styles.cardTitle}>My Appointments</Text>
          <Button
            label="Create new appointment"
            onPress={() => router.push('/carePlanner/createAppointment')}
            buttonType="primaryButton"
          />
          <Button
            label="See all appointments"
            onPress={() => {}}
            buttonType="primaryButton"
          />
          <Text style={styles.sectionHeading}>
            {APPOINTMENTS.length > 0 ? 'Recent appointments' : 'You have no appointments'}
          </Text>
          {APPOINTMENTS.map((appointment) => (
            <View key={appointment.id} style={styles.appointmentCard}>
              <Text style={styles.appointmentDate}>{formatDate(appointment.scheduled_date)}</Text>
              {/* optional fields that are empty are left out */}
              {!!appointment.doctor && (
                <Text style={styles.appointmentDetails}>{appointment.doctor}</Text>
              )}
              {!!appointment.health_service && (
                <Text style={styles.appointmentDetails}>{appointment.health_service}</Text>
              )}
            </View>
          ))}
        </View>

        <View style={styles.filledCard}>
          <Text style={styles.cardTitle}>Shared With You</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
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
      paddingBottom: 120,
      gap: 12,
    },

    headline: {
      fontSize: 28,
      lineHeight: 36,
      fontWeight: '400',
      color: colours.onBackground,
    },

    body: {
      fontSize: 16,
      lineHeight: 24,
      letterSpacing: 0.5,
      color: colours.onBackground,
      marginBottom: 12,
    },

    filledCard: {
      backgroundColor: colours.surface,
      borderRadius: 8,
      padding: 16,
      gap: 12,
    },

    cardTitle: {
      fontSize: 22,
      lineHeight: 28,
      fontWeight: 'bold',
      color: colours.onSurface,
    },

    sectionHeading: {
      ...textLayout,
      color: colours.onSurface,
      marginTop: 4,
    },

    appointmentCard: {
      backgroundColor: colours.background,
      borderRadius: 8,
      padding: 12,
      gap: 4,
    },

    appointmentDate: {
      ...textLayout,
      color: colours.onBackground,
    },

    appointmentDetails: {
      fontSize: 14,
      color: colours.onBackground,
    },
  });
}
