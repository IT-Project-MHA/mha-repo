/**
 * All user types have access to this screen
 */
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Fragment, useCallback, useState } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import Button from '../../../../components/atomicUI/Button';
import TextButton from '../../../../components/atomicUI/TextButton';
import { useTheme, ColourSet } from '../../../../context/ThemeContext';
import { Typography } from '../../../../constants/textSize';
import { formatDateTime } from '../../../../constants/date';
import { ApiAppointment, useAppointment } from '../../../../context/AppointmentContext';
import { apiPatientAppointments, apiSharedAppointments } from '../../../api/care_planner_api_helpers';

// shared appointment as the server lists it, with the patient's name
type ApiSharedAppointment = ApiAppointment & { patientName: string };

// the 3 most recently added appointments, newest first
const mostRecent = <T extends ApiAppointment>(list: T[]) =>
  [...list].sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at)).slice(0, 3);

export default function Screen() {
  const { colours, theme } = useTheme();
  const styles = createStyles(colours, theme);
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
  const renderAppointmentRow = (
    appointment: ApiAppointment,
    index: number,
    onPress: () => void,
    patientName?: string,
  ) => (
    <Fragment key={appointment.id}>
      {index > 0 && <View style={theme.line} />}
      <Pressable style={styles.appointmentRow} onPress={onPress} accessibilityRole="button">
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
        <Ionicons name="chevron-forward-outline" size={16} color={colours.onSurface} />
      </Pressable>
    </Fragment>
  );

  return (
    <View style={styles.screen}>
      <ScrollView stickyHeaderIndices={[0]} contentContainerStyle={styles.content}>
        <View style={[theme.header, styles.title]}>
          <Text style={[theme.h4, theme.leftText, theme.fontOnSurface, styles.titleText]}>
            Your Care Planner
          </Text>
          <Text style={[styles.body, theme.leftText]}>
            Prepare for your appointments with confidence.
          </Text>
        </View>

        <View style={[theme.sectionContainer, styles.filledCard]}>
          <Text style={[styles.cardTitle, styles.cardItem]}>My Appointments</Text>
          <View style={theme.line} />
          <View style={[styles.cardItem, styles.createButton]}>
            <Button
              label="Create new appointment"
              onPress={() => {
                // starts a new appointment without details left from a previous one
                resetDraft();
                router.push('/carePlanner/createAppointment');
              }}
              buttonType="primaryButton"
            />
          </View>
          <Text style={[styles.sectionHeading, styles.cardItem]}>
            {appointments.length > 0 ? 'Recently added:' : 'You have no appointments'}
          </Text>
          {/* wrapped so the card's gap isn't added between the rows & dividers */}
          {appointments.length > 0 && (
            <View>
              {mostRecent(appointments).map((appointment, index) =>
                renderAppointmentRow(appointment, index, () =>
                  router.push({
                    pathname: '/carePlanner/appointmentDetails',
                    params: { id: appointment.id },
                  }),
                ),
              )}
            </View>
          )}
          <View style={styles.linkRow}>
            <TextButton
              label="See all appointments"
              onPress={() => router.push('/carePlanner/allAppointments')}
            />
          </View>
        </View>

        <View style={[theme.sectionContainer, styles.filledCard]}>
          <Text style={[styles.cardTitle, styles.cardItem]}>Shared With You</Text>
          <View style={theme.line} />
          <Text style={[styles.sectionHeading, styles.cardItem]}>
            {sharedAppointments.length > 0
              ? 'Recently added:'
              : 'No appointments have been shared with you'}
          </Text>
          {sharedAppointments.length > 0 && (
            <View>
              {mostRecent(sharedAppointments).map((appointment, index) =>
                renderAppointmentRow(
                  appointment,
                  index,
                  () =>
                    router.push({
                      pathname: '/carePlanner/editSharedAppointment',
                      params: { id: appointment.id },
                    }),
                  appointment.patientName,
                ),
              )}
            </View>
          )}
          <View style={styles.linkRow}>
            <TextButton
              label="See all shared appointments"
              onPress={() => router.push('/carePlanner/allSharedAppointments')}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function createStyles(colours: ColourSet, text: Typography) {
  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colours.background,
    },

    content: {
      paddingBottom: 120,
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
      marginTop: 8,
    },

    filledCard: {
      gap: 12,
    },

    cardItem: {
      width: '85%',
      alignSelf: 'center',
    },

    linkRow: {
      width: '85%',
      alignSelf: 'center',
      alignItems: 'flex-end',
    },

    cardTitle: {
      ...text.h5,
      color: colours.onSurface,
    },

    createButton: {
      marginTop: 4,
    },

    sectionHeading: {
      ...text.body,
      color: colours.onSurface,
      marginTop: 4,
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
