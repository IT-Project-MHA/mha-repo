/**
 * Shows a summary of the details of an appointment, opened by pressing an appointment on the
 * care planner.
 */
import { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import Button from '../../../../components/atomicUI/Button';
import { useTheme, ColourSet } from '../../../../context/ThemeContext';
import { textLayout } from '../../../../constants/layout';
import { formatDateTime } from '../../../../constants/date';
import { Appointment, useAppointment } from '../../../../context/AppointmentContext';
import { apiAppointmentDetails } from '../../../api/care_planner_api_helpers';

export default function Screen() {
  const { colours } = useTheme();
  const styles = createStyles(colours);
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { appointments, rememberAppointment } = useAppointment();
  const appointment = appointments.find((item) => item.id === id);
  const [loading, setLoading] = useState(true);

  // loads the appointment with its questions & support persons, and keeps it so the pages opened
  // from here can find it. Reloads when the page is shown, so changes saved on those pages appear.
  // A copy kept from before is shown while it loads
  useFocusEffect(
    useCallback(() => {
      const loadAppointment = async () => {
        try {
          const loaded = (await apiAppointmentDetails(id)) as Appointment;
          rememberAppointment(loaded);
        } catch (error) {
          console.error('Failed to load appointment', error);
        } finally {
          setLoading(false);
        }
      };
      loadAppointment();
      // loads again only for a different appointment, rememberAppointment changes every render
    }, [id]),
  );

  if (!appointment) {
    return (
      <View style={styles.screen}>
        <View style={styles.content}>
          <Text style={styles.input}>
            {loading ? 'Loading...' : 'This appointment could not be loaded.'}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.headline, styles.firstHeadline]}>Overview</Text>
        <View style={styles.section}>
          <Text style={styles.heading}>Appointment date</Text>
          <View style={styles.field}>
            <Text style={styles.input}>{formatDateTime(appointment.scheduled_date)}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.heading}>Doctor's name</Text>
          <View style={styles.field}>
            <Text style={styles.input}>{appointment.doctor || 'Not given'}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.heading}>Health service</Text>
          <View style={styles.field}>
            <Text style={styles.input}>{appointment.health_service || 'Not given'}</Text>
          </View>
        </View>

        <Button
          label="Edit"
          onPress={() =>
            router.push({ pathname: '/carePlanner/editAppointment', params: { id: appointment.id } })
          }
          buttonType="primaryButton"
        />

        <Text style={styles.headline}>Support Persons</Text>
        {appointment.supportPeople.map((person, index) => {
          // get list of access strings
          const access = [
            person.canAddQuestions && 'Add questions',
            person.canAddAnswers && "Add doctor's answer",
          ].filter(Boolean);

          // pressing the card opens the page to change their access or delete them
          return (
            <Pressable
              key={index}
              style={[styles.field, styles.personCard]}
              onPress={() =>
                router.push({
                  pathname: '/carePlanner/editSupportPerson',
                  params: { id: appointment.id, index },
                })
              }
              accessibilityRole="button"
              accessibilityLabel={`Edit support person ${person.name || person.phone}`}
            >
              <View style={styles.personInfo}>
                {/* someone invited without an account yet has no name */}
                <Text style={styles.personName}>{person.name || 'Pending invite'}</Text>
                <Text style={styles.personDetails}>{person.phone}</Text>
                <Text style={styles.personDetails}>
                  Access: {access.length > 0 ? access.join(', ') : 'None'}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color={colours.onSurface} />
            </Pressable>
          );
        })}
        <Text style={styles.body}>
          We recommend to assign a maximum of 2 support people to ensure the conduciveness of the
          appointment.
        </Text>
        <Button
          label="Add support person"
          onPress={() =>
            router.push({
              pathname: '/carePlanner/newSupportPerson',
              params: { appointmentId: appointment.id },
            })
          }
          buttonType="primaryButton"
        />

        <Text style={styles.headline}>Questions to ask</Text>
        {appointment.questions.length > 0 ? (
          <View style={[styles.field, styles.list]}>
            {/* pressing a question opens the page to answer it */}
            {appointment.questions.map((question, index) => (
              <Pressable
                key={index}
                style={[styles.listItem, styles.questionRow, index > 0 && styles.divider]}
                onPress={() =>
                  router.push({
                    pathname: '/carePlanner/answerQuestion',
                    params: { id: appointment.id, index },
                  })
                }
                accessibilityRole="button"
              >
                <Text style={[styles.input, styles.questionText]}>{question.text}</Text>
                <Ionicons name="chevron-forward" size={24} color={colours.onSurface} />
              </Pressable>
            ))}
          </View>
        ) : (
          // no card when there are no questions
          <Text style={styles.body}>No Questions Added</Text>
        )}
        <Button
          label="Edit questions"
          onPress={() =>
            router.push({
              pathname: '/carePlanner/addQuestions',
              params: { appointmentId: appointment.id },
            })
          }
          buttonType="primaryButton"
        />
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

    headline: {
      fontSize: 28,
      lineHeight: 36,
      fontWeight: '400',
      color: colours.onBackground,
      marginTop: 16,
    },

    firstHeadline: {
      marginTop: 0,
    },

    section: {
      gap: 8,
    },

    heading: {
      ...textLayout,
      color: colours.onBackground,
    },

    body: {
      fontSize: 16,
      lineHeight: 24,
      letterSpacing: 0.5,
      color: colours.onBackground,
    },

    input: {
      fontSize: 16,
      color: colours.onSurface,
    },

    field: {
      backgroundColor: colours.surface,
      borderRadius: 8,
      padding: 12,
    },

    personCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },

    personInfo: {
      flex: 1,
      gap: 4,
    },

    list: {
      padding: 0,
      overflow: 'hidden',
    },

    listItem: {
      padding: 12,
    },

    questionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },

    questionText: {
      flex: 1,
    },

    divider: {
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colours.ex3,
    },

    personName: {
      ...textLayout,
      color: colours.onSurface,
    },

    personDetails: {
      fontSize: 14,
      color: colours.onSurface,
    },
  });
}
