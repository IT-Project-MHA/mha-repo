/**
 * Patients change the access of a support person of an appointment, or remove them, from this
 * screen, opened by pressing their card on the appointment details page.
 */
import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Button from '../../../../components/atomicUI/Button';
import ConfirmModal from '../../../../components/atomicUI/ConfirmModal';
import { useTheme, ColourSet } from '../../../../context/ThemeContext';
import { Typography } from '../../../../constants/textSize';
import { lineThickness } from '../../../../constants/layout';
import { Checkbox, useTheme as usePaperTheme } from 'react-native-paper';
import { useAppointment } from '../../../../context/AppointmentContext';
import {
  apiErrorMessage,
  apiMySupportLinks,
  apiSaveSupportPeople,
} from '../../../api/care_planner_api_helpers';

// support link record returned by the API
type ApiSupportLink = {
  id: string;
  invited_phone_number: string;
  supporter_name: string | null; // null until the invited phone number has an account
  can_view_assessments: boolean;
};

export default function Screen() {
  const { colours, theme } = useTheme();
  const styles = createStyles(colours, theme);
  const router = useRouter();
  const { colors: paperColours } = usePaperTheme();
  // index is the person's position in the appointment's support people
  const { id, index } = useLocalSearchParams<{ id: string; index: string }>();
  const { appointments } = useAppointment();
  const supportPeople = appointments.find((item) => item.id === id)?.supportPeople ?? [];
  const person = supportPeople[Number(index)];

  // starts with the saved access, only saved to the appointment when save is pressed
  const [canAddQuestions, setCanAddQuestions] = useState(person?.canAddQuestions ?? false);
  const [canAddAnswers, setCanAddAnswers] = useState(person?.canAddAnswers ?? false);
  // the user's support links, for this person's name & what they can see
  const [links, setLinks] = useState<ApiSupportLink[]>([]);
  // message shown when saving fails, null otherwise
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  useEffect(() => {
    const loadLinks = async () => {
      try {
        setLinks(await apiMySupportLinks());
      } catch (error) {
        console.error('Failed to load support links', error);
      }
    };
    loadLinks();
  }, []);

  if (!person) {
    return (
      <View style={styles.screen}>
        <View style={styles.content}>
          <Text style={[styles.input, theme.leftText]}>This support person could not be found.</Text>
        </View>
      </View>
    );
  }

  // this person's support link, by its id or by their phone number
  const link =
    links.find((item) => item.id === person.supportLinkId) ??
    links.find((item) => item.invited_phone_number === person.phone);
  // the link has their latest name, e.g. once someone invited has made an account. Empty until
  // they have one
  const name = link?.supporter_name || person.name;

  // saves the appointment's support persons to the server, the appointment's page then reloads them
  const saveSupportPeople = async (changed: typeof supportPeople) => {
    // stops a second press saving twice
    if (saving) return;
    setSaving(true);
    setSaveError(null);
    try {
      await apiSaveSupportPeople(id, changed);
      router.back();
    } catch (error) {
      console.error('Failed to save support person', error);
      setSaveError(
        apiErrorMessage(error, 'Your support person could not be saved, please try again'),
      );
    } finally {
      setSaving(false);
    }
  };

  const save = () =>
    saveSupportPeople(
      supportPeople.map((item, itemIndex) =>
        itemIndex === Number(index) ? { ...person, canAddQuestions, canAddAnswers } : item,
      ),
    );

  // the removed person loses their access to the appointment
  const remove = () =>
    saveSupportPeople(supportPeople.filter((_, itemIndex) => itemIndex !== Number(index)));

  return (
    <View style={styles.screen}>
      <ScrollView stickyHeaderIndices={[0]} contentContainerStyle={styles.content}>
        <View style={[theme.header, styles.title]}>
          <Text style={[theme.h4, theme.leftText, theme.fontOnSurface]}>Edit Permissions</Text>
        </View>
        <View style={[theme.sectionContainer, styles.card]}>
          <View style={styles.cardContent}>
            {/* each detail as a label & value between dividers, as on the review page */}
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Name:</Text>
              {/* someone invited without an account yet has no name */}
              <Text style={styles.input}>{name || 'N/A (Pending invite)'}</Text>
            </View>
            <View style={theme.line} />
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Phone number:</Text>
              <Text style={styles.input}>{person.phone}</Text>
              <Text style={styles.note}>
                {name
                  ? `${name} has view access to this appointment.`
                  : 'When the support person signs up with this phone number, they will be able to accept your appointment invite.'}
              </Text>
            </View>
            <View style={theme.line} />

            <Text style={[styles.heading, styles.label]}>Access Type</Text>
            <View style={styles.checkboxList}>
              <Checkbox.Item
                label="Add questions"
                status={canAddQuestions ? 'checked' : 'unchecked'}
                onPress={() => setCanAddQuestions(!canAddQuestions)}
                labelStyle={styles.input}
                style={styles.checkboxItem}
              />
              <Checkbox.Item
                label="Add doctor's answer"
                status={canAddAnswers ? 'checked' : 'unchecked'}
                onPress={() => setCanAddAnswers(!canAddAnswers)}
                labelStyle={styles.input}
                style={[styles.checkboxItem, styles.divider]}
              />
            </View>
            {/* the suggested questions need the patient's assessment data, without it a support
                person only sees the suggestions that don't */}
            {!!name && !!link && !link.can_view_assessments && (
              <Text style={[styles.note, styles.accessNote]}>
                {name} does not have access to your assessment data, so the questions they can add
                are limited. To change this, go to My Support Links and update their permissions.
              </Text>
            )}
          </View>
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        {!!saveError && (
          <Text style={[styles.error, { color: paperColours.error, borderColor: paperColours.error }]}>{saveError}</Text>
        )}
        <Button
          label="Delete support person"
          onPress={() => setConfirmingDelete(true)}
          buttonType="secondaryButton"
        />
        <Button label={saving ? 'Saving...' : 'Save'} onPress={save} buttonType="primaryButton" />
      </View>

      <ConfirmModal
        visible={confirmingDelete}
        title="Are you sure you want to delete this support person?"
        message="They will no longer have access to this appointment."
        confirmLabel="Delete"
        cancelLabel="Go back"
        onConfirm={() => {
          setConfirmingDelete(false);
          remove();
        }}
        onCancel={() => setConfirmingDelete(false)}
      />
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
      paddingBottom: 260,
      gap: 38,
    },

    title: {
      marginBottom: -19,
    },

    card: {
      gap: 12,
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
      textAlign: 'center',
      borderWidth: 1,
      borderRadius: 8,
      paddingVertical: 6,
      paddingHorizontal: 12,
      backgroundColor: colours.background,
      overflow: 'hidden',
    },

    cardContent: {
      paddingHorizontal: '5%',
      paddingBottom: 5,
    },

    row: {
      paddingHorizontal: '5%',
      paddingBlock: 24,
      gap: 4,
    },

    rowLabel: {
      ...text.h6,
      color: colours.onSurface,
    },

    heading: {
      ...text.h6,
      color: colours.onSurface,
      paddingHorizontal: '5%',
    },

    label: {
      marginTop: 24,
      marginBottom: 19,
    },

    input: {
      ...text.body,
      color: colours.onSurface,
    },

    note: {
      ...text.small,
      color: colours.onSurface,
    },

    accessNote: {
      marginTop: 4,
      marginHorizontal: 8,
    },

    checkboxList: {
      marginHorizontal: 8,
      borderWidth: 1,
      borderColor: colours.onSurface,
      overflow: 'hidden',
    },

    divider: {
      borderTopWidth: lineThickness,
      borderTopColor: colours.ex3,
    },

    checkboxItem: {
      paddingLeft: 10,
      paddingRight: 4,
    },
  });
}
