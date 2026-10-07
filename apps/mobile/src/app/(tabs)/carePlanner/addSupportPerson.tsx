/**
 * Patients can add a support person to an appointment from this screen, opened after saving a new
 * appointment.
 */
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useRouter, Href } from 'expo-router';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import Button from '../../../../components/atomicUI/Button';
import { useTheme, ColourSet } from '../../../../context/ThemeContext';
import { textLayout } from '../../../../constants/layout';
import { useAppointment, SupportPerson } from '../../../../context/AppointmentContext';

export default function Screen() {
  const { colours } = useTheme();
  const styles = createStyles(colours);
  const router = useRouter();
  const { draft, updateDraft } = useAppointment();

  // shows a saved person's details, pressing it opens their page again to edit them and the
  // delete icon removes them
  const renderPerson = (person: SupportPerson, number: 1 | 2, page: Href) => {
    const access = [
      person.canAddQuestions && 'Add questions',
      person.canAddAnswers && "Add doctor's answer",
    ].filter(Boolean);

    return (
      <Pressable style={styles.personCard} onPress={() => router.push(page)}>
        <View style={styles.personInfo}>
          <Text style={styles.personName}>{person.name}</Text>
          <Text style={styles.personDetails}>{person.phone}</Text>
          {!!person.email && <Text style={styles.personDetails}>{person.email}</Text>}
          <Text style={styles.personDetails}>
            Access: {access.length > 0 ? access.join(', ') : 'None'}
          </Text>
        </View>
        <Pressable
          onPress={() => updateDraft(number === 1 ? { supportPerson1: null } : { supportPerson2: null })}
          accessibilityRole="button"
          accessibilityLabel={`Remove support person ${number}`}
          hitSlop={8}
        >
          <Ionicons name="trash-outline" size={24} color={colours.onSurface} />
        </Pressable>
      </Pressable>
    );
  };

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.body}>You can nominate someone to help you prepare for your appointment 
        or you can skip below.</Text>

        <View style={{ gap: 8, marginTop: 8 }}>
          <Text style={styles.heading}>Support Person 1</Text>
          {draft.supportPerson1 ? (
            renderPerson(draft.supportPerson1, 1, '/carePlanner/addSupportPerson1')
          ) : (
            <Button
              label="Add person 1"
              onPress={() => router.push('/carePlanner/addSupportPerson1')}
              buttonType="primaryButton"
            />
          )}
        </View>

        <View style={{ gap: 8, marginTop: 8 }}>
          <Text style={styles.heading}>Support Person 2</Text>
          {draft.supportPerson2 ? (
            renderPerson(draft.supportPerson2, 2, '/carePlanner/addSupportPerson2')
          ) : (
            <Button
              label="Add person 2"
              onPress={() => router.push('/carePlanner/addSupportPerson2')}
              buttonType="primaryButton"
            />
          )}
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <Button
          label="Save"
          onPress={() => router.push('/carePlanner/addQuestions')}
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

    content: {
      paddingHorizontal: 16,
      paddingTop: 24,
      gap: 12,
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

    personCard: {
      backgroundColor: colours.surface,
      borderRadius: 8,
      padding: 12,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },

    personInfo: {
      flex: 1,
      gap: 4,
    },

    personName: {
      ...textLayout,
      color: colours.onSurface,
    },

    personDetails: {
      fontSize: 14,
      color: colours.onSurface,
    },

    bottomBar: {
      paddingHorizontal: 16,
      marginBottom: 44, // nav bar: 28 + extra 16 gap
    },
  });
}
