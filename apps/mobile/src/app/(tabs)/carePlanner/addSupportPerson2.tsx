/**
 * Patients choose their second support person for an appointment from this screen, opened from the
 * add a support person page.
 */
import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput } from 'react-native';
import { useNavigation, useRouter } from 'expo-router';
import Button from '../../../../components/atomicUI/Button';
import { useTheme, ColourSet } from '../../../../context/ThemeContext';
import { textLayout } from '../../../../constants/layout';
import { Checkbox, useTheme as usePaperTheme } from 'react-native-paper';

export default function Screen() {
  const { colours } = useTheme();
  const styles = createStyles(colours);
  const { colors: paperColours } = usePaperTheme();
  const router = useRouter();
  const navigation = useNavigation();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [canAddQuestions, setCanAddQuestions] = useState(false);
  const [canRecordAnswers, setCanRecordAnswers] = useState(false);

  useEffect(
    () =>
      navigation.addListener('beforeRemove', (event) => {
        const routes = navigation.getState()?.routes ?? [];
        const previous = routes[routes.length - 2];
        const isBack = event.data.action.type === 'GO_BACK' || event.data.action.type === 'POP';
        if (!isBack || previous?.name === 'addSupportPerson') return;

        event.preventDefault();
        router.replace('/carePlanner/addSupportPerson');
      }),
    [navigation, router],
  );

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <Button
          label="Choose from My Support Links"
          onPress={() => router.push('/carePlanner/mySupportLinks')}
          buttonType="primaryButton"
        />
        <Button
          label="Choose from my contacts"
          onPress={() => {}}
          buttonType="primaryButton"
        />

        <Text style={styles.headline}>Manual entry</Text>
        <View>
          <Text style={styles.heading}>Support person's Name</Text>
        </View>
        <TextInput
          style={[styles.field, styles.input]}
          value={name}
          onChangeText={setName}
          placeholder="name"
          placeholderTextColor={paperColours.onSurfaceVariant}
        />

        <View>
          <Text style={styles.heading}>Support person's phone number</Text>
        </View>
        <TextInput
          style={[styles.field, styles.input]}
          value={phone}
          onChangeText={setPhone}
          placeholder="phone number"
          keyboardType="phone-pad"
          placeholderTextColor={paperColours.onSurfaceVariant}
        />

        <View>
          <Text style={styles.heading}>Support person's email</Text>
          <Text style={styles.subheading}>Optional</Text>
        </View>
        <TextInput
          style={[styles.field, styles.input]}
          value={email}
          onChangeText={setEmail}
          placeholder="email"
          keyboardType="email-address"
          autoCapitalize="none"
          placeholderTextColor={paperColours.onSurfaceVariant}
        />

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
            status={canRecordAnswers ? 'checked' : 'unchecked'}
            onPress={() => setCanRecordAnswers(!canRecordAnswers)}
            labelStyle={styles.input}
            style={styles.divider}
          />
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <Button label="Save" onPress={() => router.back()} buttonType="primaryButton" />
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

    headline: {
      fontSize: 28,
      lineHeight: 36,
      fontWeight: '400',
      color: colours.onBackground,
      marginTop: 8,
    },

    heading: {
      ...textLayout,
      color: colours.onBackground,
      marginTop: 8,
    },

    subheading: {
      fontSize: 14,
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

    divider: {
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colours.ex3,
    },

  });
}
