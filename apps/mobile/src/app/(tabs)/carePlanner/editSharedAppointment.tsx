/**
 * Shows a summary of an appointment shared with this user, opened by pressing a shared appointment
 * on the care planner or the all shared appointments page. Questions can only be added or edited,
 * and answers added or edited, if the patient has given this user permission.
 */
import { Fragment, useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import TextButton from '../../../../components/atomicUI/TextButton';
import { useTheme, ColourSet } from '../../../../context/ThemeContext';
import { Typography } from '../../../../constants/textSize';
import { formatDateTime } from '../../../../constants/date';
import { SharedAppointment, useAppointment } from '../../../../context/AppointmentContext';
import { apiAppointmentDetails } from '../../../api/care_planner_api_helpers';

export default function Screen() {
  const { colours, theme } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = createStyles(colours, theme, insets.bottom);
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { sharedAppointments, rememberSharedAppointment } = useAppointment();
  const appointment = sharedAppointments.find((item) => item.id === id);
  const [loading, setLoading] = useState(true);

  // loads the appointment with its questions & what the patient allows this user to do, and keeps
  // it so the pages opened from here can find it. Reloads when the page is shown, so changes saved
  // on those pages appear. A copy kept from before is shown while it loads
  useFocusEffect(
    useCallback(() => {
      const loadAppointment = async () => {
        try {
          const loaded = (await apiAppointmentDetails(id)) as SharedAppointment;
          rememberSharedAppointment(loaded);
        } catch (error) {
          console.error('Failed to load shared appointment', error);
        } finally {
          setLoading(false);
        }
      };
      loadAppointment();
      // loads again only for a different appointment, rememberSharedAppointment changes every
      // render
    }, [id]),
  );

  if (!appointment) {
    return (
      <View style={styles.screen}>
        <View style={styles.content}>
          <Text style={[styles.input, theme.leftText]}>
            {loading ? 'Loading...' : 'This appointment could not be loaded.'}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScrollView stickyHeaderIndices={[0]} contentContainerStyle={styles.content}>
        <View style={[theme.header, styles.title]}>
          <Text style={[theme.h4, theme.leftText, theme.fontOnSurface]}>Shared Appointment</Text>
        </View>
        <View style={[theme.sectionContainer, styles.card]}>
          <Text style={[styles.headline, styles.cardItem]}>Overview</Text>
          <View>
            {/* each field as a label & value between dividers, as on the review page */}
            {[
              { label: 'Patient', value: appointment.patientName },
              {
                label: 'Appointment date and time',
                value: formatDateTime(appointment.scheduled_date),
              },
              { label: "Doctor's name", value: appointment.doctor || 'Not given' },
              { label: 'Health service', value: appointment.health_service || 'Not given' },
            ].map(({ label, value }, index) => (
              <Fragment key={label}>
                {index > 0 && <View style={theme.line} />}
                <View style={styles.row}>
                  <Text style={styles.label}>{label}:</Text>
                  <Text style={styles.input}>{value}</Text>
                </View>
              </Fragment>
            ))}
          </View>
        </View>

        <View style={[theme.sectionContainer, styles.card]}>
          <Text style={[styles.headline, styles.cardItem]}>Questions to ask</Text>
          {appointment.questions.length > 0 ? (
            <View>
              {/* pressing a question opens the page to answer it, or to view the answer without
                  permission to add answers */}
              {appointment.questions.map((question, index) => (
                <Fragment key={index}>
                  {index > 0 && <View style={theme.line} />}
                  <Pressable
                    style={styles.listRow}
                    onPress={() =>
                      router.push({
                        pathname: appointment.canAddAnswers
                          ? '/carePlanner/answerQuestion'
                          : '/carePlanner/viewAnswer',
                        params: { id: appointment.id, index },
                      })
                    }
                    accessibilityRole="button"
                  >
                    <Text style={[styles.input, styles.questionText]}>{question.text}</Text>
                    <Ionicons name="chevron-forward-outline" size={16} color={colours.onSurface} />
                  </Pressable>
                </Fragment>
              ))}
            </View>
          ) : (
            <Text style={[styles.body, styles.cardItem]}>No questions added</Text>
          )}
          {appointment.canAddQuestions && (
            <View style={styles.linkRow}>
              <TextButton
                label="Edit questions"
                onPress={() =>
                  router.push({
                    pathname: '/carePlanner/addSharedQuestion',
                    params: { appointmentId: appointment.id },
                  })
                }
              />
            </View>
          )}
        </View>
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

    card: {
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

    headline: {
      ...text.h4,
      color: colours.onBackground,
    },

    row: {
      paddingBlock: 24,
      gap: 4,
      width: '85%',
      alignSelf: 'center',
    },

    label: {
      ...text.h6,
      color: colours.onSurface,
    },

    body: {
      ...text.body,
      color: colours.onBackground,
    },

    input: {
      ...text.body,
      color: colours.onSurface,
    },

    listRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingBlock: 24,
      width: '85%',
      alignSelf: 'center',
    },

    questionText: {
      flex: 1,
    },
  });
}
