/**
 * Patients check the details of their new appointment plan before submitting it.
 * Opened after addQuestions screen.
 */
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import Button from '../../../../components/atomicUI/Button';
import { useTheme, ColourSet } from '../../../../context/ThemeContext';
import { textLayout } from '../../../../constants/layout';
import { formatDateTime } from '../../../../constants/date';
import { useAppointment } from '../../../../context/AppointmentContext';

export default function Screen() {
  const { colours } = useTheme();
  const styles = createStyles(colours);
  const router = useRouter();
  const { draft, resetDraft } = useAppointment();

  // each page of the create appointment flow has already saved its part to the server, so this
  // clears the draft, so the next new appointment doesn't change this one, and goes back to the
  // care planner, which loads the appointments from the server
  const handleSubmit = () => {
    resetDraft();
    router.dismissTo('/carePlanner');
  };

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.headline, styles.firstHeadline]}>Overview</Text>
        <View style={styles.section}>
          <Text style={styles.heading}>Appointment date and time</Text>
          <View style={styles.field}>
            <Text style={styles.input}>
              {draft.scheduledDate && formatDateTime(draft.scheduledDate.toISOString())}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.heading}>Doctor's name</Text>
          <View style={styles.field}>
            <Text style={styles.input}>{draft.doctor || 'Not given'}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.heading}>Health service</Text>
          <View style={styles.field}>
            <Text style={styles.input}>{draft.healthService ?? 'Not given'}</Text>
          </View>
        </View>

        <Text style={styles.headline}>Support Persons</Text>
        <View style={[styles.field, styles.list]}>
          {draft.supportPeople.length > 0 ? (
            draft.supportPeople.map((person, index) => (
              <Text
                key={index}
                style={[styles.input, styles.listItem, index > 0 && styles.divider]}
              >
                {/* someone invited without an account yet has no name, their number tells
                    them apart */}
                {person.name || `Pending invite (${person.phone})`}
              </Text>
            ))
          ) : (
            <Text style={[styles.input, styles.listItem]}>No support persons added</Text>
          )}
        </View>

        <Text style={styles.headline}>Questions to ask</Text>
        {draft.questions.length > 0 ? (
          <View style={[styles.field, styles.list]}>
            {draft.questions.map((question, index) => (
              <Text
                key={index}
                style={[styles.input, styles.listItem, index > 0 && styles.divider]}
              >
                {question.text}
              </Text>
            ))}
          </View>
        ) : (
          // no card when there are no questions
          <Text style={styles.body}>No Questions Added</Text>
        )}
      </ScrollView>

      <View style={styles.bottomBar}>
        <Button
          label="Submit"
          onPress={handleSubmit}
          buttonType="primaryButton"
        />
      </View>
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
      paddingBottom: 16,
      gap: 12,
    },

    bottomBar: {
      paddingHorizontal: 16,
      marginBottom: 120,
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

    divider: {
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colours.ex3,
    },
  });
}
