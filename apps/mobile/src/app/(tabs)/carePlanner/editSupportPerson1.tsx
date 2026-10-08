/**
 * Patients change the access of the first support person of an appointment, or remove them, from
 * this screen, opened by pressing their card on the appointment details page.
 */
import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Button from '../../../../components/atomicUI/Button';
import { useTheme, ColourSet } from '../../../../context/ThemeContext';
import { textLayout } from '../../../../constants/layout';
import { Checkbox } from 'react-native-paper';
import { useAppointment } from '../../../../context/AppointmentContext';

export default function Screen() {
  const { colours } = useTheme();
  const styles = createStyles(colours);
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { appointments, updateAppointment } = useAppointment();
  const person = appointments.find((item) => item.id === id)?.supportPerson1;

  // starts with the saved access, only saved to the appointment when save is pressed
  const [canAddQuestions, setCanAddQuestions] = useState(person?.canAddQuestions ?? false);
  const [canAddAnswers, setCanAddAnswers] = useState(person?.canAddAnswers ?? false);

  if (!person) {
    return (
      <View style={styles.screen}>
        <View style={styles.content}>
          <Text style={styles.input}>This support person could not be found.</Text>
        </View>
      </View>
    );
  }

  const save = () => {
    updateAppointment(id, { supportPerson1: { ...person, canAddQuestions, canAddAnswers } });
    router.back();
  };

  const remove = () => {
    updateAppointment(id, { supportPerson1: null });
    router.back();
  };

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <Text style={styles.heading}>Name</Text>
          <Text style={styles.body}>{person.name}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.heading}>Phone number</Text>
          <Text style={styles.body}>{person.phone}</Text>
        </View>

        {!!person.email && (
          <View style={styles.section}>
            <Text style={styles.heading}>Email</Text>
            <Text style={styles.body}>{person.email}</Text>
          </View>
        )}

        <View>
          <Text style={styles.heading}>Access Type</Text>
        </View>
        <View style={[styles.field, styles.checkboxList]}>
          <Checkbox.Item
            label="Add questions"
            status={canAddQuestions ? 'checked' : 'unchecked'}
            onPress={() => setCanAddQuestions(!canAddQuestions)}
            labelStyle={styles.input}
          />
          <Checkbox.Item
            label="Add doctor's answer"
            status={canAddAnswers ? 'checked' : 'unchecked'}
            onPress={() => setCanAddAnswers(!canAddAnswers)}
            labelStyle={styles.input}
            style={styles.divider}
          />
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <Button label="Delete support person" onPress={remove} buttonType="secondaryButton" />
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
      gap: 8,
    },

    heading: {
      ...textLayout,
      color: colours.onBackground,
      marginTop: 8,
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

    section: {
      gap: 4,
    },

    body: {
      fontSize: 16,
      lineHeight: 24,
      letterSpacing: 0.5,
      color: colours.onBackground,
    },

    checkboxList: {
      padding: 0,
      overflow: 'hidden',
    },

    divider: {
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colours.ex3,
    },
  });
}
