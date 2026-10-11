/**
 * Patients can choose auto-generated questions to ask their doctor in the appointment
 * or add their own.
 */
import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import Button from '../../../../components/atomicUI/Button';
import { useTheme, ColourSet } from '../../../../context/ThemeContext';
import { textLayout } from '../../../../constants/layout';
import { Checkbox, useTheme as usePaperTheme } from 'react-native-paper';
import { useAppointment, AppointmentQuestion } from '../../../../context/AppointmentContext';
import {
  fillSuggestedQuestions,
  NO_PAIN_DATA,
  PainSummary,
} from '../../../../constants/suggestedQuestions';
import {
  apiErrorMessage,
  apiPainSummary,
  apiSaveQuestions,
} from '../../../api/care_planner_api_helpers';

export default function Screen() {
  const { colours } = useTheme();
  const styles = createStyles(colours);
  const router = useRouter();
  const { colors: paperColours } = usePaperTheme();
  const { draft, updateDraft, appointments, updateAppointment } = useAppointment();

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

  // suggestions under each heading, with the patient's values filled in
  const suggestions = fillSuggestedQuestions(pain, savedQuestions);

  // set of ids of the questions the patient has ticked
  const [checked, setChecked] = useState<Set<string>>(
    () =>
      new Set(
        savedQuestions
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

  // questions the patient has typed themselves, starts with the saved ones and keeps their answers
  const [ownQuestions, setOwnQuestions] = useState<
    { id: number; text: string; answer?: string; recording?: string }[]
  >(() =>
    savedQuestions
      .filter((question) => question.source === 'patient')
      .map((question, index) => ({
        id: index,
        text: question.text,
        answer: question.answer,
        recording: question.recording,
      })),
  );
  const [nextId, setNextId] = useState(ownQuestions.length);
  // message shown above the save button, null when there is nothing wrong
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

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
  // keeping the answers & recordings already saved for them
  const save = async () => {
    // stops a second press saving twice
    if (saving) return;
    const savedSuggestion = (id: string) =>
      savedQuestions.find((question) => question.suggestedId === id);

    const suggested: AppointmentQuestion[] = suggestions.flatMap(({ questions }) =>
      questions
        // remove non-checked items
        .filter(({ id }) => checked.has(id))
        // map to AppointmentQuestion object
        .map(({ text, id }) => ({
          text,
          source: 'suggested' as const,
          // a suggestion a support person ticked stays theirs
          addedBy: savedSuggestion(id)?.addedBy,
          suggestedId: id,
          answer: savedSuggestion(id)?.answer,
          recording: savedSuggestion(id)?.recording,
        })),
    );
    const own: AppointmentQuestion[] = ownQuestions
      // copy each question attribute but trim text
      .map((question) => ({ ...question, text: question.text.trim() }))
      .filter(({ text }) => text !== '')
      .map(({ text, answer, recording }) => ({ text, source: 'patient', answer, recording }));
    if (appointmentId) {
      // keeps the questions support persons typed, they aren't shown on this page
      const supportQuestions = savedQuestions.filter((question) => question.source === 'support');
      updateAppointment(appointmentId, { questions: [...suggested, ...own, ...supportQuestions] });
      router.back();
    } else if (draft.appointmentId) {
      // replaces the new appointment's questions on the server, then opens the review page
      const questions = [...suggested, ...own];
      setSaving(true);
      setError(null);
      try {
        await apiSaveQuestions(draft.appointmentId, questions);
        updateDraft({ questions });
        router.push('/carePlanner/reviewAppointment');
      } catch (saveError) {
        console.error('Failed to save questions', saveError);
        setError(apiErrorMessage(saveError, 'Your questions could not be saved, please try again'));
      } finally {
        setSaving(false);
      }
    }
  };

  return (
    <View style={styles.screen}>
        <Text style={[styles.body, styles.intro]}>Based on your answers to the four impact sections, 
            we have provided some suggested questions to ask your healthcare professional/s.
            </Text>
      <ScrollView contentContainerStyle={styles.content}>
        {suggestions.map(({ key, heading, questions }) => (
          <View key={key} style={{ gap: 8, marginTop: 8 }}>
            <Text style={styles.heading}>{heading}</Text>
            <View style={[styles.field, styles.checkboxList]}>
              {questions.map(({ id, text }, index) => {
                return (
                  <Checkbox.Item
                    key={id}
                    label={text}
                    status={checked.has(id) ? 'checked' : 'unchecked'}
                    onPress={() => toggle(id)}
                    labelStyle={styles.input}
                    style={index > 0 ? styles.divider : undefined}
                  />
                );
              })}
            </View>
          </View>
        ))}

        <View style={{ gap: 8, marginTop: 8 }}>
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
              <Pressable
                onPress={() => removeOwnQuestion(question.id)}
                accessibilityRole="button"
                accessibilityLabel="Delete question"
                hitSlop={8}
              >
                <Ionicons name="trash-outline" size={24} color={colours.onSurface} />
              </Pressable>
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

    bottomBar: {
      paddingHorizontal: 16,
      marginBottom: 44,
      gap: 8,
    },

    error: {
      fontSize: 14,
    },

    headline: {
      fontSize: 28,
      lineHeight: 36,
      fontWeight: '400',
      color: colours.onBackground,
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
