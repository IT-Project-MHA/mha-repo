/**
 * Patients can add a support person to an appointment from this screen, opened after saving a new
 * appointment.
 */
import { Fragment, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme as usePaperTheme } from 'react-native-paper';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import Button from '../../../../components/atomicUI/Button';
import { useTheme, ColourSet } from '../../../../context/ThemeContext';
import { Typography } from '../../../../constants/textSize';
import { useAppointment, SupportPerson } from '../../../../context/AppointmentContext';
import { apiErrorMessage, apiSaveSupportPeople } from '../../../api/care_planner_api_helpers';

export default function Screen() {
  const { colours, theme } = useTheme();
  const styles = createStyles(colours, theme);
  const router = useRouter();
  const { colors: paperColours } = usePaperTheme();
  const { draft, updateDraft } = useAppointment();
  // message shown above the save button, null when there is nothing wrong
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // invites the support persons & gives them access to the appointment on the server, then opens
  // the add questions page
  const handleSave = async () => {
    // stops a second press saving twice
    if (saving || !draft.appointmentId) return;
    setSaving(true);
    setError(null);
    try {
      const supportLinkIds = await apiSaveSupportPeople(draft.appointmentId, draft.supportPeople);
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
      <Fragment key={index}>
        {index > 0 && <View style={theme.line} />}
        <Pressable
          style={styles.personRow}
          onPress={() =>
            router.push({ pathname: '/carePlanner/newSupportPerson', params: { index } })
          }
        >
          <View style={styles.personInfo}>
            <Text style={styles.personName}>{person.name || 'Pending invite'}</Text>
            <Text style={styles.personDetails}>{person.phone}</Text>
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
            accessibilityLabel={`Remove support person ${person.name || person.phone}`}
            hitSlop={8}
          >
            <Ionicons name="trash-outline" size={20} color={colours.onSurface} />
          </Pressable>
        </Pressable>
      </Fragment>
    );
  };

  return (
    <View style={styles.screen}>
      <ScrollView stickyHeaderIndices={[0]} contentContainerStyle={styles.content}>
        <View style={[theme.header, styles.title]}>
          <Text style={[theme.h4, theme.leftText, theme.fontOnSurface, styles.titleText]}>
            Add a Support Person
          </Text>
          <Text style={[styles.body, styles.intro, theme.leftText]}>
            You can nominate someone to help you prepare for your appointment or you can skip below.
          </Text>
        </View>
        <View style={[theme.sectionContainer, styles.card]}>
          <View style={styles.cardContent}>
            {draft.supportPeople.length > 0 && <View>{draft.supportPeople.map(renderPerson)}</View>}

            <View style={styles.cardItem}>
              <Button
                label="Add support person"
                onPress={() => router.push('/carePlanner/newSupportPerson')}
                buttonType="primaryButton"
              />
            </View>
            <Text style={[styles.body, styles.cardItem]}>
              We recommend to assign a maximum of 2 support people to ensure the conduciveness of the
              appointment.
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        {!!error && (
          <Text style={[styles.error, { color: paperColours.error, borderColor: paperColours.error }]}>{error}</Text>
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

function createStyles(colours: ColourSet, text: Typography) {
  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colours.background,
    },

    content: {
      paddingBottom: 200,
      gap: 38,
    },

    title: {
      marginBottom: -19,
    },

    titleText: {
      marginBottom: 8,
    },

    intro: {
      marginTop: 8,
    },

    card: {
      gap: 12,
    },

    cardContent: {
      paddingBottom: 5,
      gap: 12,
    },

    cardItem: {
      width: '85%',
      alignSelf: 'center',
    },

    headline: {
      ...text.h4,
      color: colours.onBackground,
    },

    body: {
      ...text.body,
      color: colours.onBackground,
    },

    personRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingBlock: 24,
      width: '85%',
      alignSelf: 'center',
    },

    personInfo: {
      flex: 1,
      gap: 4,
    },

    personName: {
      ...text.h6,
      color: colours.onSurface,
    },

    personDetails: {
      ...text.small,
      color: colours.onSurface,
    },

    bottomBar: {
      position: 'absolute',
      left: '7.5%',
      width: '85%',
      bottom: 120,
      gap: 8,
    },

    error: {
      ...text.small,
      borderWidth: 1,
      borderRadius: 8,
      paddingVertical: 6,
      paddingHorizontal: 12,
      backgroundColor: colours.background,
      overflow: 'hidden',
    },
  });
}
