/**
 * Shows a summary of the details of an appointment, opened by pressing an appointment on the
 * care planner.
 */
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useTheme, ColourSet } from '../../../../context/ThemeContext';
import { textLayout } from '../../../../constants/layout';
import { formatDate } from '../../../../constants/date';
import { useAppointment } from '../../../../context/AppointmentContext';

export default function Screen() {
  const { colours } = useTheme();
  const styles = createStyles(colours);
  const { id } = useLocalSearchParams<{ id: string }>();
  const { appointments } = useAppointment();
  const appointment = appointments.find((item) => item.id === id);

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

        <Text style={styles.headline}>Support Persons</Text>
        {appointment.supportPerson1 || appointment.supportPerson2 ? (
          [appointment.supportPerson1, appointment.supportPerson2].map((person, index) => {
            if (!person) return null;
            const access = [
              person.canAddQuestions && 'Add questions',
              person.canAddAnswers && "Add doctor's answer",
            ].filter(Boolean);

            return (
              <View key={index} style={styles.section}>
                <Text style={styles.heading}>Support Person {index + 1}</Text>
                <View style={[styles.field, styles.personCard]}>
                  <Text style={styles.personName}>{person.name}</Text>
                  <Text style={styles.personDetails}>{person.phone}</Text>
                  {!!person.email && <Text style={styles.personDetails}>{person.email}</Text>}
                  <Text style={styles.personDetails}>
                    Access: {access.length > 0 ? access.join(', ') : 'None'}
                  </Text>
                </View>
              </View>
            );
          })
        ) : (
          <View style={styles.field}>
            <Text style={styles.input}>No support persons added</Text>
          </View>
        )}

        <Text style={styles.headline}>Questions to ask</Text>
        <View style={[styles.field, styles.list]}>
          {appointment.questions.length > 0 ? (
            appointment.questions.map((question, index) => (
              <Text
                key={index}
                style={[styles.input, styles.listItem, index > 0 && styles.divider]}
              >
                {question.text}
              </Text>
            ))
          ) : (
            <Text style={[styles.input, styles.listItem]}>No questions added</Text>
          )}
        </View>
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
      gap: 4,
    },

    list: {
      padding: 0,
      overflow: 'hidden',
    },

    listItem: {
      padding: 12,
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
