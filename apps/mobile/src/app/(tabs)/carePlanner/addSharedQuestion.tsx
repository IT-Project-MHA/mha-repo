/**
 * Support persons allowed to add questions choose auto-generated questions or add, edit and remove
 * their own on an appointment shared with them, opened from the shared appointment page. The
 * patient's questions aren't shown as only the patient can change them.
 */
import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import Button from '../../../../components/atomicUI/Button';
import { useTheme, ColourSet } from '../../../../context/ThemeContext';
import { textLayout } from '../../../../constants/layout';
import { Checkbox, useTheme as usePaperTheme } from 'react-native-paper';
import { useAppointment, AppointmentQuestion } from '../../../../context/AppointmentContext';
import { SUGGESTED_QUESTIONS, suggestedId } from '../../../../constants/suggestedQuestions';

// a question with a written or recorded answer can still be edited, but the backend refuses to
// delete it
const isAnswered = (question?: { answer?: string; recording?: string }) =>
  !!question?.answer || !!question?.recording;

export default function Screen() {
  const { colours } = useTheme();
  const styles = createStyles(colours);
  const router = useRouter();
  const { colors: paperColours } = usePaperTheme();
  const { findAppointment, updateAppointment } = useAppointment();

  const { appointmentId } = useLocalSearchParams<{ appointmentId: string }>();
  const savedQuestions = findAppointment(appointmentId)?.questions ?? [];
  const savedSuggestion = (id: string) =>
    savedQuestions.find((question) => question.suggestedId === id);
  // suggestions the patient ticked are hidden and kept as they are when saving
  const patientSuggestion = (id: string) =>
    !!savedSuggestion(id) && savedSuggestion(id)?.addedBy !== 'support';
  // questions the patient typed are hidden and kept as they are when saving
  const patientTyped = savedQuestions.filter(
    (question) => question.source === 'patient',
  );

  // set of ids of the suggested questions support persons have ticked
  const [checked, setChecked] = useState<Set<string>>(
    () =>
      new Set(
        savedQuestions
          .filter((question) => question.addedBy === 'support')
          // get array of suggestedIds
          .map((question) => question.suggestedId)
          // filter out questions that don't have a suggestedId
          .filter((id): id is string => !!id),
      ),
  );

  const toggle = (id: string) => // toggle checkbox
    setChecked((previous) => {
      // make a new copy of the set of ticked ids and add/delete
      const next = new Set(previous);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  // questions support persons have typed, starts with the saved ones and keeps their answers
  const [ownQuestions, setOwnQuestions] = useState<
    { id: number; text: string; savedText?: string; answer?: string; recording?: string }[]
  >(() =>
    savedQuestions
      .filter((question) => question.source === 'support')
      .map((question, index) => ({
        id: index,
        text: question.text,
        savedText: question.text,
        answer: question.answer,
        recording: question.recording,
      })),
  );
  const [nextId, setNextId] = useState(ownQuestions.length);

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

  // saves the patient's questions as they are, with the ticked suggestions & own questions (blank
  // ones left out), keeping the answers & recordings already saved for them
  const save = () => {
    const suggested: AppointmentQuestion[] = SUGGESTED_QUESTIONS.flatMap(({ key, questions }) =>
      questions
        // converts SUGGESTED_QUESTIONS into [{text, suggestedId}]
        .map((text, index) => ({ text, id: suggestedId(key, index) }))
        // keep the patient's and the ticked ones
        .filter(({ id }) => patientSuggestion(id) || checked.has(id))
        // map to AppointmentQuestion object
        .map(({ text, id }) => ({
          text,
          source: 'suggested' as const,
          // a suggestion the patient ticked stays theirs
          addedBy: patientSuggestion(id) ? undefined : ('support' as const),
          suggestedId: id,
          answer: savedSuggestion(id)?.answer,
          recording: savedSuggestion(id)?.recording,
        })),
    );
    const own: AppointmentQuestion[] = ownQuestions
      // copy each question attribute but trim text, an answered question left blank keeps its
      // saved text so it isn't removed
      .map((question) => ({
        ...question,
        text: question.text.trim() || (isAnswered(question) ? question.savedText ?? '' : ''),
      }))
      .filter(({ text }) => text !== '')
      .map(({ text, answer, recording }) => ({
        text,
        source: 'support',
        addedBy: 'support',
        answer,
        recording,
      }));
    updateAppointment(appointmentId, { questions: [...suggested, ...patientTyped, ...own] });
    router.back();
  };

  // only headings with a suggestion the patient hasn't ticked are shown
  const shownSuggestions = SUGGESTED_QUESTIONS.map(({ key, heading, questions }) => ({
    key,
    heading,
    questions: questions
      .map((text, index) => ({ text, id: suggestedId(key, index) }))
      .filter(({ id }) => !patientSuggestion(id)),
  })).filter(({ questions }) => questions.length > 0);

  return (
    <View style={styles.screen}>
      <Text style={[styles.body, styles.intro]}>
        Based on the patient's answers to the four impact sections, we have provided some suggested
        questions to ask their healthcare professional/s.
      </Text>
      <ScrollView contentContainerStyle={styles.content}>
        {shownSuggestions.map(({ key, heading, questions }) => (
          <View key={key} style={styles.section}>
            <Text style={styles.heading}>{heading}</Text>
            <View style={[styles.field, styles.checkboxList]}>
              {questions.map(({ text, id }, index) => (
                <Checkbox.Item
                  key={id}
                  label={text}
                  status={checked.has(id) ? 'checked' : 'unchecked'}
                  onPress={() => toggle(id)}
                  // an answered suggestion can't be unticked as that removes it
                  disabled={isAnswered(savedSuggestion(id))}
                  labelStyle={styles.input}
                  style={index > 0 ? styles.divider : undefined}
                />
              ))}
            </View>
          </View>
        ))}

        <View style={styles.section}>
          <Text style={styles.heading}>Add your own questions</Text>
          {ownQuestions.map((question) => (
            <View key={question.id} style={[styles.field, styles.ownQuestion]}>
              <TextInput
                style={[styles.input, styles.ownQuestionInput]}
                value={question.text}
                onChangeText={(text) => updateOwnQuestion(question.id, text)}
                placeholder="question"
                placeholderTextColor={paperColours.onSurfaceVariant}
                multiline
              />
              {/* an answered question has no delete button */}
              {!isAnswered(question) && (
                <Pressable
                  onPress={() => removeOwnQuestion(question.id)}
                  accessibilityRole="button"
                  accessibilityLabel="Delete question"
                  hitSlop={8}
                >
                  <Ionicons name="trash-outline" size={24} color={colours.onSurface} />
                </Pressable>
              )}
            </View>
          ))}
          <Button label="Add new question" onPress={addOwnQuestion} buttonType="primaryButton" />
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <Button label="Save" onPress={save} buttonType="primaryButton" />
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

    intro: {
      paddingHorizontal: 16,
      paddingTop: 20,
      paddingBottom: 20,
    },

    content: {
      paddingHorizontal: 16,
      paddingTop: 12,
      paddingBottom: 16,
      gap: 12,
    },

    section: {
      gap: 8,
      marginTop: 8,
    },

    bottomBar: {
      paddingHorizontal: 16,
      marginBottom: 44,
    },

    body: {
      fontSize: 16,
      lineHeight: 24,
      letterSpacing: 0.5,
      color: colours.onBackground,
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

    checkboxList: {
      padding: 0,
      overflow: 'hidden',
    },

    ownQuestion: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },

    ownQuestionInput: {
      flex: 1,
    },

    divider: {
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colours.ex3,
    },
  });
}
