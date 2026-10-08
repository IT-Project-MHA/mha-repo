/**
 * Patients can choose auto-generated questions to ask their doctor in the appointment
 * or add their own.
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

// suggested questions shown under each heading, a checkbox is made for each question
const SUGGESTED_QUESTIONS: { key: string; heading: string; questions: string[] }[] = [
  {
    key: 'location',
    heading: 'Pain location',
    questions: [
      'What could be causing pain in my lower back, neck, and knee?',
      'Are these areas related, or are they likely separate issues?',
    ],
  },
  {
    key: 'intensity',
    heading: 'Pain intensity',
    questions: [
      'My average pain over the past two weeks has been around 7 — what does this indicate?',
      'Even though I don’t have pain right now, I’ve had severe pain at times (up to 9). What could explain these flare-ups?',
      'Is it normal for pain to vary between mild (2) and very severe (9)?',
      'What can I do to better manage days when the pain is high?',
    ],
  },
  {
    key: 'impact',
    heading: 'Pain impact',
    questions: [
      'What treatments or therapies could help improve my mobility?',
      'Would physiotherapy or a specific exercise program be appropriate for me?',
      'Are there movements or activities I should avoid right now?',
      'My pain is making it hard to take care of myself independently — what can we do to improve this?',
      'Are there strategies, aids, or supports that could help with daily tasks?',
      'Should we adjust my treatment plan given how much this is affecting my independence?',
      'Is this level of impact typical for my condition?',
      'What options are available to improve my quality of life?'
    ],
  },
  {
    key: 'management',
    heading: 'Management',
    questions: [
      'Are there additional investigations or referrals that might help?',
      'How can I prevent the pain from becoming severe again?',
      'What are realistic goals for improving my function and independence?'
    ],
  },
];

//  a suggested question's checkbox id is its category key and number, e.g. 'location1'
const suggestedId = (key: string, index: number) => `${key}${index + 1}`;

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
  const save = () => {
    const savedSuggestion = (id: string) =>
      savedQuestions.find((question) => question.suggestedId === id);

    const suggested: AppointmentQuestion[] = SUGGESTED_QUESTIONS.flatMap(({ key, questions }) =>
      questions
        // converts SUGGESTED_QUESTIONS into [{text, suggestedId}]
        .map((text, index) => ({ text, id: suggestedId(key, index) }))
        // remove non-checked items
        .filter(({ id }) => checked.has(id))
        // map to AppointmentQuestion object
        .map(({ text, id }) => ({
          text,
          source: 'suggested' as const,
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
      updateAppointment(appointmentId, { questions: [...suggested, ...own] });
      router.back();
    } else {
      updateDraft({ questions: [...suggested, ...own] });
      router.push('/carePlanner/reviewAppointment');
    }
  };

  return (
    <View style={styles.screen}>
        <Text style={[styles.body, styles.intro]}>Based on your answers to the four impact sections, 
            we have provided some suggested questions to ask your healthcare professional/s.
            </Text>
      <ScrollView contentContainerStyle={styles.content}>
        {SUGGESTED_QUESTIONS.map(({ key, heading, questions }) => (
          <View key={key} style={{ gap: 8, marginTop: 8 }}>
            <Text style={styles.heading}>{heading}</Text>
            <View style={[styles.field, styles.checkboxList]}>
              {questions.map((text, index) => {
                const id = suggestedId(key, index);
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

    bottomBar: {
      paddingHorizontal: 16,
      marginBottom: 44,
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
