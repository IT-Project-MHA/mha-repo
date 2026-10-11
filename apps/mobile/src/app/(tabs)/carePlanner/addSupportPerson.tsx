/**
 * Patients can add a support person to an appointment from this screen, opened after saving a new
 * appointment.
 */
import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme as usePaperTheme } from 'react-native-paper';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import Button from '../../../../components/atomicUI/Button';
import { useTheme, ColourSet } from '../../../../context/ThemeContext';
import { textLayout } from '../../../../constants/layout';
import { useAppointment, SupportPerson } from '../../../../context/AppointmentContext';
import { apiErrorMessage, apiSaveSupportPeople } from '../../../api/care_planner_api_helpers';

export default function Screen() {
  const { colours } = useTheme();
  const styles = createStyles(colours);
  const router = useRouter();
  const { colors: paperColours } = usePaperTheme();
  const { draft, updateDraft } = useAppointment();
  // message shown above the save button, null when there is nothing wrong
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // invites the support persons & gives them access to the appointment on the server, then opens
  // the add questions page. Persons removed from this page lose their access
  const handleSave = async () => {
    // stops a second press saving twice
    if (saving || !draft.appointmentId) return;
    setSaving(true);
    setError(null);
    try {
      const supportLinkIds = await apiSaveSupportPeople(draft.appointmentId, draft.supportPeople);
      // keeps each person's link, so saving again doesn't invite them twice
      updateDraft({
        supportPeople: draft.supportPeople.map((person, index) => ({
          ...person,
          supportLinkId: supportLinkIds[index],
        })),
      });
      router.push('/carePlanner/addQuestions');
    } catch (saveError) {
      console.error('Failed to save support persons', saveError);
      setError(
        apiErrorMessage(saveError, 'Your support persons could not be saved, please try again'),
      );
    } finally {
      setSaving(false);
    }
  };

  // shows a saved person's details, pressing it opens their page again to edit them and the
  // delete icon removes them
  const renderPerson = (person: SupportPerson, index: number) => {
    const access = [
      person.canAddQuestions && 'Add questions',
      person.canAddAnswers && "Add doctor's answer",
    ].filter(Boolean);

    return (
      <Pressable
        style={styles.personCard}
        onPress={() =>
          router.push({ pathname: '/carePlanner/newSupportPerson', params: { index } })
        }
      >
        <View style={styles.personInfo}>
          <Text style={styles.personName}>{person.name}</Text>
          <Text style={styles.personDetails}>{person.phone}</Text>
          {!!person.email && <Text style={styles.personDetails}>{person.email}</Text>}
          <Text style={styles.personDetails}>
            Access: {access.length > 0 ? access.join(', ') : 'None'}
          </Text>
        </View>
        <Pressable
          onPress={() =>
            updateDraft({
              supportPeople: draft.supportPeople.filter((_, itemIndex) => itemIndex !== index),
            })
          }
          accessibilityRole="button"
          accessibilityLabel={`Remove support person ${index + 1}`}
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

        {draft.supportPeople.map((person, index) => (
          <View key={index} style={styles.section}>
            <Text style={styles.heading}>Support Person {index + 1}</Text>
            {renderPerson(person, index)}
          </View>
        ))}

        <Text style={styles.body}>
          We recommend to assign a maximum of 2 support people to ensure the conduciveness of the
          appointment.
        </Text>
        <Button
          label="Add support person"
          onPress={() => router.push('/carePlanner/newSupportPerson')}
          buttonType="primaryButton"
        />
      </ScrollView>

      <View style={styles.bottomBar}>
        {!!error && (
          <Text style={[styles.error, { color: paperColours.error }]}>{error}</Text>
        )}
        <Button
          label={saving ? 'Saving...' : 'Save'}
          onPress={handleSave}
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

    section: {
      gap: 8,
      marginTop: 8,
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
      gap: 8,
    },

    error: {
      fontSize: 14,
    },
  });
}
