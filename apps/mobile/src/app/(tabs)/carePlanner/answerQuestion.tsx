/**
 * Patients type or record the doctor's answer to a question from this screen, opened by pressing
 * a question on the appointment details page.
 */
import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Button from '../../../../components/atomicUI/Button';
import { useTheme, ColourSet } from '../../../../context/ThemeContext';
import { textLayout } from '../../../../constants/layout';
import { useTheme as usePaperTheme } from 'react-native-paper';
import { useAppointment } from '../../../../context/AppointmentContext';

export default function Screen() {
  const { colours } = useTheme();
  const styles = createStyles(colours);
  const { colors: paperColours } = usePaperTheme();
  const { id, index } = useLocalSearchParams<{ id: string; index: string }>();
  const router = useRouter();
  const { appointments, updateAppointment } = useAppointment();
  const appointment = appointments.find((item) => item.id === id);
  const question = appointment?.questions[Number(index)];

  // starts with the saved answer, only saved to the appointment when save is pressed
  const [answer, setAnswer] = useState(question?.answer ?? '');

  // replaces the answer of this question only, a blank answer is removed
  const save = () => {
    if (!appointment) return;
    const text = answer.trim();
    updateAppointment(id, {
      questions: appointment.questions.map((item, itemIndex) =>
        itemIndex === Number(index) ? { ...item, answer: text || undefined } : item,
      ),
    });
    router.back();
  };

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        {!!question && <Text style={styles.question}>{question.text}</Text>}

        <Text style={styles.heading}>Type answer</Text>
        <TextInput
          style={[styles.field, styles.input, styles.answerInput]}
          value={answer}
          onChangeText={setAnswer}
          placeholder="answer"
          placeholderTextColor={paperColours.onSurfaceVariant}
          multiline
          numberOfLines={3}
        />

        <Text style={styles.heading}>Record answer</Text>
        <Button label="Get doctor's permission" onPress={() => {}} buttonType="primaryButton" />
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

    content: {
      paddingHorizontal: 16,
      paddingTop: 24,
      paddingBottom: 16,
      gap: 12,
    },

    bottomBar: {
      paddingHorizontal: 16,
      marginBottom: 44,
    },

    question: {
      ...textLayout,
      fontSize: 22,
      lineHeight: 28,
      color: colours.onBackground,
    },

    heading: {
      ...textLayout,
      color: colours.onBackground,
      marginTop: 8,
    },

    input: {
      fontSize: 16,
      lineHeight: 24,
      color: colours.onSurface,
    },

    field: {
      backgroundColor: colours.surface,
      borderRadius: 8,
      padding: 12,
    },

    // three lines of text plus the field's padding, typing starts at the top
    answerInput: {
      minHeight: 3 * 24 + 2 * 12,
      textAlignVertical: 'top',
    },
  });
}
