/**
 * Patients change the access of a support person of an appointment, or remove them, from this
 * screen, opened by pressing their card on the appointment details page.
 */
import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Button from '../../../../components/atomicUI/Button';
import { useTheme, ColourSet } from '../../../../context/ThemeContext';
import { textLayout } from '../../../../constants/layout';
import { Checkbox } from 'react-native-paper';
import { useAppointment } from '../../../../context/AppointmentContext';
import { apiMySupportLinks } from '../../../api/care_planner_api_helpers';

// support link record returned by the API
type ApiSupportLink = {
  id: string;
  invited_phone_number: string;
  supporter_name: string | null; // null until the invited phone number has an account
  can_view_assessments: boolean;
};

export default function Screen() {
  const { colours } = useTheme();
  const styles = createStyles(colours);
  const router = useRouter();
  // index is the person's position in the appointment's support people
  const { id, index } = useLocalSearchParams<{ id: string; index: string }>();
  const { appointments, updateAppointment } = useAppointment();
  const supportPeople = appointments.find((item) => item.id === id)?.supportPeople ?? [];
  const person = supportPeople[Number(index)];

  // starts with the saved access, only saved to the appointment when save is pressed
  const [canAddQuestions, setCanAddQuestions] = useState(person?.canAddQuestions ?? false);
  const [canAddAnswers, setCanAddAnswers] = useState(person?.canAddAnswers ?? false);
  // the user's support links, for this person's name & what they can see
  const [links, setLinks] = useState<ApiSupportLink[]>([]);

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
          <Text style={styles.input}>This support person could not be found.</Text>
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

  const save = () => {
    updateAppointment(id, {
      supportPeople: supportPeople.map((item, itemIndex) =>
        itemIndex === Number(index) ? { ...person, canAddQuestions, canAddAnswers } : item,
      ),
    });
    router.back();
  };

  const remove = () => {
    updateAppointment(id, {
      supportPeople: supportPeople.filter((_, itemIndex) => itemIndex !== Number(index)),
    });
    router.back();
  };

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* someone invited without an account yet has no name */}
        {!!name && (
          <View style={styles.section}>
            <Text style={styles.heading}>Name</Text>
            <Text style={styles.body}>{name}</Text>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.heading}>Phone number</Text>
          <Text style={styles.body}>
            {person.phone}
            {!name && ' (pending invite)'}
          </Text>
          <Text style={styles.subheading}>
            {name
              ? `${name} has view access to this appointment.`
              : 'When the support person signs up with this phone number, they will be able to accept your appointment invite.'}
          </Text>
        </View>

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
        {/* the suggested questions need the patient's assessment data, without it a support
            person only sees the suggestions that don't */}
        {!!name && !!link && !link.can_view_assessments && (
          <Text style={styles.subheading}>
            {name} does not have access to your assessment data, so the questions they can add
            are limited. To change this, go to Shared With Me and update their permissions.
          </Text>
        )}
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

    subheading: {
      fontSize: 14,
      color: colours.onBackground,
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
