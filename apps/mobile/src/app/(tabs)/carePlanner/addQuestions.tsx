/**
 * Patients can choose auto-generated questions to ask their doctor in the appointment
 * or add their own.
 */
import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import Button from '../../../../components/atomicUI/Button';
import { useTheme, ColourSet } from '../../../../context/ThemeContext';
import { textLayout } from '../../../../constants/layout';
import { Checkbox, useTheme as usePaperTheme } from 'react-native-paper';

export default function Screen() {
  const { colours } = useTheme();
  const styles = createStyles(colours);
  const router = useRouter();
  const { colors: paperColours } = usePaperTheme();

  // ids of the questions the patient has ticked
  const [checked, setChecked] = useState<Set<string>>(new Set());

  const toggle = (id: string) => // toggle checkbox
    setChecked((previous) => {
      const next = new Set(previous);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  // questions the patient has typed themselves
  const [ownQuestions, setOwnQuestions] = useState<{ id: number; text: string }[]>([]);
  const [nextId, setNextId] = useState(0);

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

  return (
    <View style={styles.screen}>
        <Text style={[styles.body, styles.intro]}>Based on your answers to the four impact sections, 
            we have provided some suggested questions to ask your healthcare professional/s.
            </Text>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={{ gap: 8, marginTop: 8 }}>
          <Text style={styles.heading}>Pain location</Text>
          <View style={[styles.field, styles.checkboxList]}>
            <Checkbox.Item
              label="x"
              status={checked.has('location1') ? 'checked' : 'unchecked'}
              onPress={() => toggle('location1')}
              labelStyle={styles.input}
            />
            <Checkbox.Item
              label="x"
              status={checked.has('location2') ? 'checked' : 'unchecked'}
              onPress={() => toggle('location2')}
              labelStyle={styles.input}
              style={styles.divider}
            />
            <Checkbox.Item
              label="x"
              status={checked.has('location3') ? 'checked' : 'unchecked'}
              onPress={() => toggle('location3')}
              labelStyle={styles.input}
              style={styles.divider}
            />
          </View>
        </View>

        <View style={{ gap: 8, marginTop: 8 }}>
          <Text style={styles.heading}>Pain intensity</Text>
          <View style={[styles.field, styles.checkboxList]}>
            <Checkbox.Item
              label="x"
              status={checked.has('intensity1') ? 'checked' : 'unchecked'}
              onPress={() => toggle('intensity1')}
              labelStyle={styles.input}
            />
            <Checkbox.Item
              label="x"
              status={checked.has('intensity2') ? 'checked' : 'unchecked'}
              onPress={() => toggle('intensity2')}
              labelStyle={styles.input}
              style={styles.divider}
            />
            <Checkbox.Item
              label="x"
              status={checked.has('intensity3') ? 'checked' : 'unchecked'}
              onPress={() => toggle('intensity3')}
              labelStyle={styles.input}
              style={styles.divider}
            />
          </View>
        </View>

        <View style={{ gap: 8, marginTop: 8 }}>
          <Text style={styles.heading}>Pain impact</Text>
          <View style={[styles.field, styles.checkboxList]}>
            <Checkbox.Item
              label="x"
              status={checked.has('impact1') ? 'checked' : 'unchecked'}
              onPress={() => toggle('impact1')}
              labelStyle={styles.input}
            />
            <Checkbox.Item
              label="x"
              status={checked.has('impact2') ? 'checked' : 'unchecked'}
              onPress={() => toggle('impact2')}
              labelStyle={styles.input}
              style={styles.divider}
            />
            <Checkbox.Item
              label="x"
              status={checked.has('impact3') ? 'checked' : 'unchecked'}
              onPress={() => toggle('impact3')}
              labelStyle={styles.input}
              style={styles.divider}
            />
          </View>
        </View>

        <View style={{ gap: 8, marginTop: 8 }}>
          <Text style={styles.heading}>Management</Text>
          <View style={[styles.field, styles.checkboxList]}>
            <Checkbox.Item
              label="x"
              status={checked.has('management1') ? 'checked' : 'unchecked'}
              onPress={() => toggle('management1')}
              labelStyle={styles.input}
            />
            <Checkbox.Item
              label="x"
              status={checked.has('management2') ? 'checked' : 'unchecked'}
              onPress={() => toggle('management2')}
              labelStyle={styles.input}
              style={styles.divider}
            />
            <Checkbox.Item
              label="x"
              status={checked.has('management3') ? 'checked' : 'unchecked'}
              onPress={() => toggle('management3')}
              labelStyle={styles.input}
              style={styles.divider}
            />
          </View>
        </View>

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
        <Button
          label="Save"
          onPress={() => router.push('/carePlanner/reviewAppointment')}
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
