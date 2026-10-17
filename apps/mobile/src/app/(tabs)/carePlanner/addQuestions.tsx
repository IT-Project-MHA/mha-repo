/**
 * Patients can choose auto-generated questions to ask their doctor in the appointment
 * or add their own.
 */
import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import Button from '../../../../components/atomicUI/Button';
import ConfirmModal from '../../../../components/atomicUI/ConfirmModal';
import { useTheme, ColourSet } from '../../../../context/ThemeContext';
import { Typography } from '../../../../constants/textSize';
import { lineThickness } from '../../../../constants/layout';
import { Checkbox, useTheme as usePaperTheme } from 'react-native-paper';
import { AppointmentQuestion, useAppointment } from '../../../../context/AppointmentContext';
import {
  fillSuggestedQuestions,
  isSuggestedText,
  NO_PAIN_DATA,
  PainSummary,
} from '../../../../constants/suggestedQuestions';
import {
  apiErrorMessage,
  apiPainSummary,
  apiSaveOwnQuestions,
} from '../../../api/care_planner_api_helpers';

export default function Screen() {
  const { colours, theme } = useTheme();
  const styles = createStyles(colours, theme);
  const router = useRouter();
  const { colors: paperColours } = usePaperTheme();
  const { draft, updateDraft, appointments } = useAppointment();

  // set when opened from a submitted appointment's details, otherwise the draft is changed
  const { appointmentId } = useLocalSearchParams<{ appointmentId?: string }>();
  const savedQuestions = appointmentId
    ? (appointments.find((item) => item.id === appointmentId)?.questions ?? [])
    : draft.questions;

  // the patient's pain values, filled into the suggested questions once loaded. Questions that
  // need a value are hidden until then
  const [pain, setPain] = useState<PainSummary>(NO_PAIN_DATA);
  useEffect(() => {
    const loadPain = async () => {
      try {
        setPain(await apiPainSummary());
      } catch (error) {
        console.error('Failed to load pain values', error);
      }
    };
    loadPain();
  }, []);

  // suggestions under each heading, with the patient's values filled in. A saved question whose
  // text matches a suggestion is ticked
  const suggestions = fillSuggestedQuestions(pain, savedQuestions);

  // set of checkboxIds of the questions the patient has ticked, starts with the saved suggestions
  const [checked, setChecked] = useState<Set<string>>(
    () =>
      new Set(
        suggestions
          .flatMap(({ questions }) => questions)
          .filter(({ saved }) => !!saved)
          .map(({ checkboxId }) => checkboxId),
      ),
  );

  const toggle = (checkboxId: string) => // toggle checkbox
    setChecked((previous) => {
      // make a new copy of the set of ticked ids and add/delete
      const next = new Set(previous);
      if (next.has(checkboxId)) next.delete(checkboxId);
      else next.add(checkboxId);
      return next;
    });

  // questions the patient has typed themselves, starts with the patient's saved questions that
  // don't match a suggestion, including suggestions whose wording has since changed. serverId is the
  // saved question's id, so saving keeps it & its answer, left out for a new one
  const [ownQuestions, setOwnQuestions] = useState<
    { id: number; serverId?: string; text: string }[]
  >(() =>
    savedQuestions
      .filter((question) => question.addedBy !== 'support' && !isSuggestedText(question.text))
      .map((question, index) => ({ id: index, serverId: question.id, text: question.text })),
  );
  const [nextId, setNextId] = useState(ownQuestions.length);
  // message shown above the save button, null when there is nothing wrong
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  // the questions waiting to be saved while the patient confirms removing answered ones
  const [confirmingRemove, setConfirmingRemove] = useState<AppointmentQuestion[] | null>(null);

  const addOwnQuestion = () => {
    setOwnQuestions((previous) => [...previous, { id: nextId, text: '' }]);
    setNextId(nextId + 1);
  };

  // builds a new list
  const updateOwnQuestion = (id: number, text: string) =>
    setOwnQuestions((previous) =>
      previous.map((question) => (question.id === id ? { ...question, text } : question)),
    );

  // filter out the id
  const removeOwnQuestion = (id: number) =>
    setOwnQuestions((previous) => previous.filter((question) => question.id !== id));

  // saves the ticked suggestions & own questions (blank ones left out) to the appointment,
  // keeping the answers & recordings already saved for them. Asks first when a saved question
  // with a typed or recorded answer is removed, as its answer is deleted with it
  const save = () => {
    // stops a second press saving twice
    if (saving) return;
    const suggested = suggestions.flatMap(({ questions }) =>
      questions
        // the ticked ones, a suggestion a support person ticked stays theirs and isn't sent
        .filter(({ checkboxId, saved }) => checked.has(checkboxId) && saved?.addedBy !== 'support')
        .map(({ text, saved }) => ({
          id: saved?.id,
          text,
          source: 'suggested' as const,
        })),
    );
    const own = ownQuestions
      // trim text, blank ones are left out
      .map((question) => ({
        id: question.serverId,
        text: question.text.trim(),
        source: 'patient' as const,
      }))
      .filter(({ text }) => text !== '');
    const questions: AppointmentQuestion[] = [...suggested, ...own];

    // a list of question id's after the user has edited & pressed submit button
    const keptIds = new Set(questions.map((question) => question.id));
    // if there exists a question about to be deleted that has an answer, show a warning
    const removedWithAnswer = savedQuestions.some(
      (question) =>
        !!question.id &&
        question.addedBy !== 'support' &&
        !keptIds.has(question.id) && // question has been removed in current session
        (!!question.answer || !!question.recording),
    );
    if (removedWithAnswer) {
      setConfirmingRemove(questions);
    } else {
      saveQuestions(questions);
    }
  };

  const saveQuestions = async (questions: AppointmentQuestion[]) => {
    setConfirmingRemove(null);
    // the appointment being changed, or the one being created
    const saveTo = appointmentId ?? draft.appointmentId;
    if (!saveTo) return;
    setSaving(true);
    setError(null);
    try {
      await apiSaveOwnQuestions(saveTo, questions);
      if (appointmentId) {
        // the appointment's page reloads it from the server
        router.back();
      } else {
        updateDraft({ questions });
        router.push('/carePlanner/reviewAppointment');
      }
    } catch (saveError) {
      console.error('Failed to save questions', saveError);
      setError(apiErrorMessage(saveError, 'Your questions could not be saved, please try again'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.screen}>
      <ScrollView stickyHeaderIndices={[0]} contentContainerStyle={styles.content}>
        <View style={[theme.header, styles.title]}>
          <Text style={[theme.h4, theme.leftText, theme.fontOnSurface, styles.titleText]}>
            Add Questions to Your Appointment
          </Text>
          <Text style={[styles.body, styles.intro, theme.leftText]}>
            Based on your answers to the four impact sections, we have provided some suggested
            questions to ask your healthcare professional/s.
          </Text>
        </View>

        {/* suggested questions card */}
        {suggestions.length > 0 && (
          <View style={[theme.sectionContainer, styles.card]}>
            <View style={[styles.cardContent, styles.suggestionSections]}>
              {suggestions.map(({ key, heading, questions }) => (
                <View key={key}>
                  <Text style={[styles.heading, styles.label]}>{heading}</Text>
                  <View style={styles.checkboxList}>
                    {questions.map(({ checkboxId, text }, index) => (
                      <Checkbox.Item
                        key={checkboxId}
                        label={text}
                        status={checked.has(checkboxId) ? 'checked' : 'unchecked'}
                        onPress={() => toggle(checkboxId)}
                        labelStyle={styles.input}
                        style={[styles.checkboxItem, index > 0 && styles.divider]}
                      />
                    ))}
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* own questions card */}
        <View style={[theme.sectionContainer, styles.card]}>
          <View style={styles.cardContent}>
            <Text style={[styles.heading, styles.label]}>Add your own questions</Text>
            <View style={styles.ownQuestions}>
              {ownQuestions.map((question) => (
                <View key={question.id} style={[styles.field, styles.ownQuestion]}>
                  <TextInput
                    style={[styles.input, styles.ownQuestionInput]}
                    value={question.text}
                    onChangeText={(text) => updateOwnQuestion(question.id, text)}
                    placeholder="enter question here"
                    placeholderTextColor={colours.onSurface}
                    multiline
                  />
                  <Pressable
                    onPress={() => removeOwnQuestion(question.id)}
                    accessibilityRole="button"
                    accessibilityLabel="Delete question"
                    hitSlop={8}
                  >
                    <Ionicons name="trash-outline" size={20} color={colours.onSurface} />
                  </Pressable>
                </View>
              ))}
              {/* a new box is only offered once every box has a question in it */}
              {ownQuestions.every((question) => question.text.trim() !== '') && (
                <View style={styles.addButton}>
                  <Button
                    label="Add new question"
                    onPress={addOwnQuestion}
                    buttonType="primaryButton"
                  />
                </View>
              )}
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        {!!error && (
          <Text style={[styles.error, { color: paperColours.error, borderColor: paperColours.error }]}>{error}</Text>
        )}
        <Button label={saving ? 'Saving...' : 'Save'} onPress={save} buttonType="primaryButton" />
      </View>

      <ConfirmModal
        visible={!!confirmingRemove}
        title="Are you sure you want to remove questions?"
        message="All answers for the removed questions will be permanently deleted."
        confirmLabel="Remove"
        cancelLabel="Go back"
        onConfirm={() => confirmingRemove && saveQuestions(confirmingRemove)}
        onCancel={() => setConfirmingRemove(null)}
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
      paddingBottom: 200,
      gap: 38,
    },

    title: {
      marginBottom: -32,
    },

    titleText: {
      marginBottom: 8,
    },

    intro: {
      marginTop: 8,
    },

    card: {
      gap: 12,
    },

    bottomBar: {
      position: 'absolute',
      left: '7.5%',
      width: '85%',
      bottom: 120,
      gap: 8,
    },

    error: {
      ...text.small,
      borderWidth: 1,
      borderRadius: 8,
      paddingVertical: 6,
      paddingHorizontal: 12,
      backgroundColor: colours.background,
      overflow: 'hidden',
    },

    headline: {
      ...text.h4,
      color: colours.onBackground,
    },

    body: {
      ...text.body,
      color: colours.onBackground,
    },

    cardContent: {
      paddingHorizontal: '5%',
      paddingBottom: 5,
    },

    heading: {
      ...text.h6,
      color: colours.onSurface,
      paddingHorizontal: '5%',
    },

    label: {
      marginTop: 5,
      marginBottom: 19,
    },

    input: {
      ...text.body,
      color: colours.onSurface,
    },

    field: {
      minHeight: 40,
      paddingVertical: 5,
      paddingHorizontal: 10,
      marginHorizontal: 8,
      borderWidth: 1,
      borderColor: colours.onSurface,
    },

    suggestionSections: {
      gap: 19,
    },

    checkboxList: {
      marginHorizontal: 8,
      borderWidth: 1,
      borderColor: colours.onSurface,
      overflow: 'hidden',
    },

    ownQuestions: {
      gap: 12,
    },

    ownQuestion: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },

    addButton: {
      marginHorizontal: 8,
    },

    ownQuestionInput: {
      flex: 1,
    },

    divider: {
      borderTopWidth: lineThickness,
      borderTopColor: colours.ex3,
    },

    checkboxItem: {
      paddingLeft: 10,
      paddingRight: 4,
    },
  });
}
