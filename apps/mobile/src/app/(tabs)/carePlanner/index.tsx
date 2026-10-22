/**
 * All user types have access to this screen
 */
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCallback, useState } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import Button from '../../../../components/atomicUI/Button';
import { useTheme, ColourSet } from '../../../../context/ThemeContext';
import { textLayout } from '../../../../constants/layout';
import { formatDateTime } from '../../../../constants/date';
import { ApiAppointment, useAppointment } from '../../../../context/AppointmentContext';
import { apiPatientAppointments, apiSharedAppointments } from '../../../api/care_planner_api_helpers';

// shared appointment as the server lists it, with the patient's name
type ApiSharedAppointment = ApiAppointment & { patientName: string };

// the 3 most recently added appointments, newest first
const mostRecent = <T extends ApiAppointment>(list: T[]) =>
  [...list].sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at)).slice(0, 3);

export default function Screen() {
  const { colours } = useTheme();
  const styles = createStyles(colours);
  const router = useRouter();
  const { resetDraft } = useAppointment();
  const [appointments, setAppointments] = useState<ApiAppointment[]>([]);
  const [sharedAppointments, setSharedAppointments] = useState<ApiSharedAppointment[]>([]);

  // reloads every appointment where the user is the patient or support person when the screen is
  // shown, so ones added or changed on other screens appear
  useFocusEffect(
    useCallback(() => {
      const loadAppointments = async () => {
        try {
          const [own, shared] = await Promise.all([
            apiPatientAppointments(),
            apiSharedAppointments(),
          ]);
          setAppointments(own);
          setSharedAppointments(shared);
        } catch (error) {
          console.error('Failed to load appointments', error);
        }
      };
      loadAppointments();
    }, []),
  );

  // a pressable appointment summary, patientName is shown first on appointments shared with you
  const renderAppointmentCard = (
    appointment: ApiAppointment,
    onPress: () => void,
    patientName?: string,
  ) => (
    <Pressable
      key={appointment.id}
      style={styles.appointmentCard}
      onPress={onPress}
      accessibilityRole="button"
    >
      <View style={styles.appointmentInfo}>
        {!!patientName && <Text style={styles.patientName}>{patientName}</Text>}
        <Text style={styles.appointmentDate}>{formatDateTime(appointment.scheduled_date)}</Text>
        {/* optional fields that are empty are left out */}
        {!!appointment.doctor && (
          <Text style={styles.appointmentDetails}>{appointment.doctor}</Text>
        )}
        {!!appointment.health_service && (
          <Text style={styles.appointmentDetails}>{appointment.health_service}</Text>
        )}
      </View>
      <Ionicons name="chevron-forward" size={24} color={colours.onBackground} />
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.headline}>Your Care Planner</Text>
        <Text style={styles.body}>Prepare for your appointments with confidence.</Text>

        <View style={styles.filledCard}>
          <Text style={styles.cardTitle}>My Appointments</Text>
          <Button
            label="Create new appointment"
            onPress={() => {
              // starts a new appointment without details left from a previous one
              resetDraft();
              router.push('/carePlanner/createAppointment');
            }}
            buttonType="primaryButton"
          />
          <Button
            label="See all appointments"
            onPress={() => router.push('/carePlanner/allAppointments')}
            buttonType="primaryButton"
          />
          <Text style={styles.sectionHeading}>
            {appointments.length > 0 ? 'Recently added appointments' : 'You have no appointments'}
          </Text>
          {mostRecent(appointments).map((appointment) =>
            renderAppointmentCard(appointment, () =>
              router.push({
                pathname: '/carePlanner/appointmentDetails',
                params: { id: appointment.id },
              }),
            ),
          )}
        </View>

        <View style={styles.filledCard}>
          <Text style={styles.cardTitle}>Shared With You</Text>
          <Button
            label="See all shared appointments"
            onPress={() => router.push('/carePlanner/allSharedAppointments')}
            buttonType="primaryButton"
          />
          <Text style={styles.sectionHeading}>
            {sharedAppointments.length > 0
              ? 'Recently added appointments'
              : 'No appointments have been shared with you'}
          </Text>
          {mostRecent(sharedAppointments).map((appointment) =>
            renderAppointmentCard(
              appointment,
              () =>
                router.push({
                  pathname: '/carePlanner/editSharedAppointment',
                  params: { id: appointment.id },
                }),
              appointment.patientName,
            ),
          )}
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
      color: colours.onBackground,
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
