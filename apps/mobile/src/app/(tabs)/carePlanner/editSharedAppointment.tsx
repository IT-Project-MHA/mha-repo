/**
 * Shows a summary of an appointment shared with this user, opened by pressing a shared appointment
 * on the care planner or the all shared appointments page. Questions can only be added or edited,
 * and answers added or edited, if the patient has given this user permission.
 */
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import Button from '../../../../components/atomicUI/Button';
import { useTheme, ColourSet } from '../../../../context/ThemeContext';
import { textLayout } from '../../../../constants/layout';
import { formatDate } from '../../../../constants/date';
import { useAppointment } from '../../../../context/AppointmentContext';

export default function Screen() {
  const { colours } = useTheme();
  const styles = createStyles(colours);
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { sharedAppointments } = useAppointment();
  const appointment = sharedAppointments.find((item) => item.id === id);

  if (!appointment) {
    return (
      <View style={styles.screen}>
        <View style={styles.content}>
          <Text style={styles.input}>This appointment could not be found.</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.headline, styles.firstHeadline]}>Overview</Text>
        <View style={styles.section}>
          <Text style={styles.heading}>Patient</Text>
          <View style={styles.field}>
            <Text style={styles.input}>{appointment.patientName}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.heading}>Appointment date</Text>
          <View style={styles.field}>
            <Text style={styles.input}>{formatDate(appointment.scheduled_date)}</Text>
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

        <Text style={styles.headline}>Questions to ask</Text>
        {appointment.questions.length > 0 ? (
          <View style={[styles.field, styles.list]}>
            {/* pressing a question opens the page to answer it, or to view the answer without
                permission to add answers */}
            {appointment.questions.map((question, index) => (
              <Pressable
                key={index}
                style={[styles.listItem, styles.questionRow, index > 0 && styles.divider]}
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
                <Ionicons name="chevron-forward" size={24} color={colours.onSurface} />
              </Pressable>
            ))}
          </View>
        ) : (
          // no card when there are no questions
          <Text style={styles.body}>No Questions Added</Text>
        )}
        {appointment.canAddQuestions && (
          <Button
            label="Edit questions"
            onPress={() =>
              router.push({
                pathname: '/carePlanner/addSharedQuestion',
                params: { appointmentId: appointment.id },
              })
            }
            buttonType="primaryButton"
          />
        )}
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
  });
}
