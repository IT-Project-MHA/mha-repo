/**
 * Support persons allowed to add questions choose auto-generated questions or add, edit and remove
 * their own on an appointment shared with them, opened from the shared appointment page. The
 * patient's questions aren't shown as only the patient can change them.
 */
import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import Button from '../../../../components/atomicUI/Button';
import { useTheme, ColourSet } from '../../../../context/ThemeContext';
import { textLayout } from '../../../../constants/layout';
import { Checkbox, useTheme as usePaperTheme } from 'react-native-paper';
import { useAppointment } from '../../../../context/AppointmentContext';
import {
  fillSuggestedQuestions,
  NO_PAIN_DATA,
  PainSummary,
} from '../../../../constants/suggestedQuestions';
import {
  apiErrorMessage,
  apiPainSummary,
  apiSaveOwnQuestions,
} from '../../../api/care_planner_api_helpers';

// a question with a written or recorded answer can still be edited, but the backend refuses to
// delete it
const isAnswered = (question?: { answer?: string; recording?: string }) =>
  !!question?.answer || !!question?.recording;

export default function Screen() {
  const { colours } = useTheme();
  const styles = createStyles(colours);
  const router = useRouter();
  const { colors: paperColours } = usePaperTheme();
  const { findAppointment, sharedAppointments } = useAppointment();

  const { appointmentId } = useLocalSearchParams<{ appointmentId: string }>();
  const savedQuestions = findAppointment(appointmentId)?.questions ?? [];
  // the patient the appointment belongs to
  const patientId = sharedAppointments.find((item) => item.id === appointmentId)?.patientId;

  // the patient's pain values, filled into the suggested questions once loaded. Questions that
  // need a value are hidden until then
  const [pain, setPain] = useState<PainSummary>(NO_PAIN_DATA);
  useEffect(() => {
    const loadPain = async () => {
      try {
        setPain(await apiPainSummary(patientId));
      } catch (error) {
        console.error('Failed to load pain values', error);
      }
    };
    loadPain();
  }, [patientId]);

  // suggestions under each heading, with the patient's values filled in
  const suggestions = fillSuggestedQuestions(pain, savedQuestions);
  const savedSuggestion = (id: string) =>
    savedQuestions.find((question) => question.suggestedId === id);
  // suggestions the patient ticked are hidden and kept as they are when saving
  const patientSuggestion = (id: string) =>
    !!savedSuggestion(id) && savedSuggestion(id)?.addedBy !== 'support';

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

  // questions support persons have typed, starts with the saved ones and keeps their answers.
  // serverId is the saved question's id, left out for a new one
  const [ownQuestions, setOwnQuestions] = useState<
    {
      id: number;
      serverId?: string;
      text: string;
      savedText?: string;
      answer?: string;
      recording?: string;
    }[]
  >(() =>
    savedQuestions
      .filter((question) => question.source === 'support')
      .map((question, index) => ({
        id: index,
        serverId: question.id,
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

  // message shown above the save button, null when there is nothing wrong
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // saves the ticked suggestions & own questions (blank ones left out) to the server, keeping the
  // saved ones by their id so their answers & recordings stay. The patient's questions aren't
  // changed. The shared appointment page then reloads it from the server
  const save = async () => {
    // stops a second press saving twice
    if (saving) return;
    const suggested = suggestions.flatMap(({ questions }) =>
      questions
        // the ones this support person ticked, the patient's are kept as they are
        .filter(({ id }) => !patientSuggestion(id) && checked.has(id))
        .map(({ text, id }) => ({
          id: savedSuggestion(id)?.id,
          text,
          source: 'suggested' as const,
        })),
    );
    const own = ownQuestions
      // trim text, an answered question left blank keeps its saved text so it isn't removed
      .map((question) => ({
        id: question.serverId,
        text: question.text.trim() || (isAnswered(question) ? question.savedText ?? '' : ''),
        source: 'support' as const,
      }))
      .filter(({ text }) => text !== '');

    setSaving(true);
    setError(null);
    try {
      await apiSaveOwnQuestions(appointmentId, [...suggested, ...own]);
      router.back();
    } catch (saveError) {
      console.error('Failed to save questions', saveError);
      setError(apiErrorMessage(saveError, 'Your questions could not be saved, please try again'));
    } finally {
      setSaving(false);
    }
  };

  // only headings with a suggestion the patient hasn't ticked are shown
  const shownSuggestions = suggestions
    .map(({ key, heading, questions }) => ({
      key,
      heading,
      questions: questions.filter(({ id }) => !patientSuggestion(id)),
    }))
    .filter(({ questions }) => questions.length > 0);

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
        {!!error && (
          <Text style={[styles.error, { color: paperColours.error }]}>{error}</Text>
        )}
        <Button label={saving ? 'Saving...' : 'Save'} onPress={save} buttonType="primaryButton" />
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
      gap: 8,
    },

    error: {
      fontSize: 14,
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
