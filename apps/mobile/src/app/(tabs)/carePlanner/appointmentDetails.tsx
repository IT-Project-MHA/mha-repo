/**
 * Shows a summary of the details of an appointment, opened by pressing an appointment on the
 * care planner.
 */
import { Fragment, useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { useTheme as usePaperTheme } from 'react-native-paper';
import Button from '../../../../components/atomicUI/Button';
import ConfirmModal from '../../../../components/atomicUI/ConfirmModal';
import TextButton from '../../../../components/atomicUI/TextButton';
import { useTheme, ColourSet } from '../../../../context/ThemeContext';
import { Typography } from '../../../../constants/textSize';
import { formatDateTime } from '../../../../constants/date';
import { Appointment, useAppointment } from '../../../../context/AppointmentContext';
import { apiAppointmentDetails, apiErrorMessage } from '../../../api/care_planner_api_helpers';
import { apiAppointment } from '../../../api/django-API';

export default function Screen() {
  const { colours, theme } = useTheme();
  const { colors: paperColours } = usePaperTheme();
  const styles = createStyles(colours, theme);
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { appointments, rememberAppointment } = useAppointment();
  const appointment = appointments.find((item) => item.id === id);
  const [loading, setLoading] = useState(true);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  // deletes the appointment, then returns to the page it was opened from
  const deleteAppointment = async () => {
    setConfirmingDelete(false);
    setDeleting(true);
    setDeleteError('');
    try {
      await apiAppointment('delete', { id });
      router.back();
    } catch (error) {
      setDeleteError(
        apiErrorMessage(error, 'Your appointment could not be deleted, please try again'),
      );
      setDeleting(false);
    }
  };

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
          <Text style={[theme.h4, theme.leftText, theme.fontOnSurface]}>Appointment Details</Text>
        </View>
        <View style={[theme.sectionContainer, styles.card]}>
          <Text style={[styles.headline, styles.cardItem]}>Overview</Text>
          <View>
            {/* each field as a label & value between dividers, as on the review page */}
            {[
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
          <View style={styles.linkRow}>
            <TextButton
              label="Edit details"
              onPress={() =>
                router.push({
                  pathname: '/carePlanner/editAppointment',
                  params: { id: appointment.id },
                })
              }
            />
          </View>
        </View>

        <View style={[theme.sectionContainer, styles.card]}>
          <Text style={[styles.headline, styles.cardItem]}>Support Persons</Text>
          {appointment.supportPeople.length === 0 && (
            <Text style={[styles.body, styles.cardItem]}>No support persons added</Text>
          )}
          <View>
            {appointment.supportPeople.map((person, index) => {
              // get list of access strings
              const access = [
                person.canAddQuestions && 'Add questions',
                person.canAddAnswers && "Add doctor's answer",
              ].filter(Boolean);

              // pressing the row opens the page to change their access or delete them
              return (
                <Fragment key={index}>
                  {index > 0 && <View style={theme.line} />}
                  <Pressable
                    style={styles.listRow}
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
                    <Ionicons name="chevron-forward-outline" size={16} color={colours.onSurface} />
                  </Pressable>
                </Fragment>
              );
            })}
          </View>
          {/* only shown once there are more support persons than recommended */}
          {appointment.supportPeople.length > 2 && (
            <Text style={[styles.body, styles.actions]}>
              We recommend to assign a maximum of 2 support people to ensure the conduciveness of
              the appointment.
            </Text>
          )}
          <View style={styles.actions}>
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
          </View>
        </View>

        <View style={[theme.sectionContainer, styles.card]}>
          <Text style={[styles.headline, styles.cardItem]}>Questions to ask</Text>
          {appointment.questions.length > 0 ? (
            <View>
              {/* pressing a question opens the page to answer it */}
              {appointment.questions.map((question, index) => (
                <Fragment key={index}>
                  {index > 0 && <View style={theme.line} />}
                  <Pressable
                    style={styles.listRow}
                    onPress={() =>
                      router.push({
                        pathname: '/carePlanner/answerQuestion',
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
          <View style={styles.linkRow}>
            <TextButton
              label="Edit questions"
              onPress={() =>
                router.push({
                  pathname: '/carePlanner/addQuestions',
                  params: { appointmentId: appointment.id },
                })
              }
            />
          </View>
        </View>

        <View style={styles.actions}>
          {!!deleteError && (
            <Text style={[styles.error, { color: paperColours.error, borderColor: paperColours.error }]}>{deleteError}</Text>
          )}
          <Button
            label={deleting ? 'Deleting...' : 'Delete appointment'}
            onPress={() => setConfirmingDelete(true)}
            buttonType="secondaryButton"
          />
        </View>
      </ScrollView>

      <ConfirmModal
        visible={confirmingDelete}
        title="Are you sure you want to delete this appointment?"
        message="It will be removed from your care planner and from the support persons it is shared with."
        confirmLabel="Delete"
        cancelLabel="Go back"
        onConfirm={deleteAppointment}
        onCancel={() => setConfirmingDelete(false)}
      />
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

    error: {
      ...text.small,
      textAlign: 'center',
      borderWidth: 1,
      borderRadius: 8,
      paddingVertical: 6,
      paddingHorizontal: 12,
      backgroundColor: colours.background,
      overflow: 'hidden',
    },

    listRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingBlock: 24,
      width: '85%',
      alignSelf: 'center',
    },

    actions: {
      width: '85%',
      alignSelf: 'center',
      gap: 12,
    },

    personInfo: {
      flex: 1,
      gap: 4,
    },

    questionText: {
      flex: 1,
    },

    personName: {
      ...text.h6,
      color: colours.onSurface,
    },

    personDetails: {
      ...text.small,
      color: colours.onSurface,
    },
  });
}
