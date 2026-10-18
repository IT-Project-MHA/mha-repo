/**
 * Patients check the details of their new appointment plan before submitting it.
 * Opened after addQuestions screen.
 */
import { Fragment } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Button from '../../../../components/atomicUI/Button';
import { useTheme, ColourSet } from '../../../../context/ThemeContext';
import { Typography } from '../../../../constants/textSize';
import { formatDateTime } from '../../../../constants/date';
import { useAppointment } from '../../../../context/AppointmentContext';

export default function Screen() {
  const { colours, theme } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = createStyles(colours, theme, insets.bottom);
  const router = useRouter();
  const { draft, resetDraft } = useAppointment();

  const overview = [
    {
      label: 'Appointment date and time',
      value: draft.scheduledDate ? formatDateTime(draft.scheduledDate.toISOString()) : '',
    },
    { label: "Doctor's name", value: draft.doctor || 'Not given' },
    { label: 'Health service', value: draft.healthService ?? 'Not given' },
  ];

  // each page of the create appointment flow has already saved its part to the server, so this
  // clears the draft, so the next new appointment doesn't change this one, and goes back to the
  // care planner, which loads the appointments from the server
  const handleSubmit = () => {
    resetDraft();
    router.dismissTo('/carePlanner');
  };

  return (
    <View style={styles.screen}>
      <ScrollView stickyHeaderIndices={[0]} contentContainerStyle={styles.content}>
        <View style={[theme.header, styles.title]}>
          <Text style={[theme.h4, theme.leftText, theme.fontOnSurface]}>Review my Appointment Plan</Text>
        </View>
        <View style={[theme.sectionContainer, styles.card]}>
          <View style={styles.cardContent}>
            <Text style={styles.headline}>Overview</Text>
            {overview.map(({ label, value }, index) => (
              <Fragment key={label}>
                {index > 0 && <View style={theme.line} />}
                <View style={styles.row}>
                  <Text style={styles.label}>{label}:</Text>
                  <Text style={styles.value}>{value}</Text>
                </View>
              </Fragment>
            ))}
          </View>
        </View>

        <View style={[theme.sectionContainer, styles.card]}>
          <View style={styles.cardContent}>
            <Text style={styles.headline}>Support Persons</Text>
            {draft.supportPeople.length > 0 ? (
              draft.supportPeople.map((person, index) => {
                // get list of access strings
                const access = [
                  person.canAddQuestions && 'Add questions',
                  person.canAddAnswers && "Add doctor's answer",
                ].filter(Boolean);

                return (
                  <Fragment key={index}>
                    {index > 0 && <View style={theme.line} />}
                    <View style={styles.row}>
                      {/* someone invited without an account yet has no name */}
                      <Text style={styles.label}>{person.name || 'Pending invite'}</Text>
                      <Text style={styles.value}>{person.phone}</Text>
                      <Text style={styles.value}>
                        Access: {access.length > 0 ? access.join(', ') : 'None'}
                      </Text>
                    </View>
                  </Fragment>
                );
              })
            ) : (
              <Text style={[styles.value, styles.row]}>No support persons added</Text>
            )}
          </View>
        </View>

        <View style={[theme.sectionContainer, styles.card]}>
          <View style={styles.cardContent}>
            <Text style={styles.headline}>Questions to ask</Text>
            {draft.questions.length > 0 ? (
              draft.questions.map((question, index) => (
                <Fragment key={index}>
                  {index > 0 && <View style={theme.line} />}
                  <Text style={[styles.value, styles.row]}>{question.text}</Text>
                </Fragment>
              ))
            ) : (
              <Text style={[styles.value, styles.row]}>No questions added</Text>
            )}
          </View>
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <Button
          label="Finish"
          onPress={handleSubmit}
          buttonType="roundButton"
        />
      </View>
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
      paddingBottom: 200 + bottomInset,
      gap: 38,
    },

    title: {
      marginBottom: -19,
    },

    card: {
      gap: 12,
    },

    bottomBar: {
      position: 'absolute',
      left: '7.5%',
      width: '85%',
      bottom: 120 + bottomInset,
    },

    cardContent: {
      paddingHorizontal: '5%',
      paddingBottom: 5,
    },

    headline: {
      ...text.h4,
      color: colours.onSurface,
      paddingHorizontal: '5%',
      marginTop: 5,
      marginBottom: 7,
    },

    row: {
      paddingHorizontal: '5%',
      paddingBlock: 24,
      gap: 4,
    },

    label: {
      ...text.h6,
      color: colours.onSurface,
    },

    value: {
      ...text.body,
      color: colours.onSurface,
    },
  });
}
