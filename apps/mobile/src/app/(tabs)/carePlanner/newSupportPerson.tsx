/**
 * Patients add a support person to an appointment from this screen, opened from the add a support
 * person page, or from an appointment's details to add them to that appointment. Pressing a person
 * on the add a support person page opens this screen again to edit them.
 */
import { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { Contact, requestPermissionsAsync } from 'expo-contacts';
import Button from '../../../../components/atomicUI/Button';
import { useTheme, ColourSet } from '../../../../context/ThemeContext';
import { Typography } from '../../../../constants/textSize';
import { lineThickness } from '../../../../constants/layout';
import { Checkbox, useTheme as usePaperTheme } from 'react-native-paper';
import { useAppointment } from '../../../../context/AppointmentContext';
import {
  apiErrorMessage,
  apiMySupportLinks,
  apiSaveSupportPeople,
  normalisePhoneNumber,
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
  const insets = useSafeAreaInsets();
  const styles = createStyles(colours, theme, insets.bottom);
  const { colors: paperColours } = usePaperTheme();
  const router = useRouter();
  const {
    draft,
    updateDraft,
    appointments,
    pickedSupportLink,
    pickSupportLink,
  } = useAppointment();

  // appointmentId is set when opened from a submitted appointment's details, otherwise the draft
  // is changed. index is set when editing a person already added, otherwise a new one is added
  const { appointmentId, index } = useLocalSearchParams<{ appointmentId?: string; index?: string }>();
  const appointment = appointments.find((item) => item.id === appointmentId);
  const savedPeople = (appointmentId ? appointment?.supportPeople : draft.supportPeople) ?? [];
  const saved = index !== undefined ? savedPeople[Number(index)] : undefined;

  // starts with the saved details, so the person can be edited after saving
  const [phone, setPhone] = useState(saved?.phone ?? '');
  const [canAddQuestions, setCanAddQuestions] = useState(saved?.canAddQuestions ?? false);
  const [canAddAnswers, setCanAddAnswers] = useState(saved?.canAddAnswers ?? false);
  // set when the person was chosen from My Support Links
  const [supportLinkId, setSupportLinkId] = useState(saved?.supportLinkId);
  const [showError, setShowError] = useState(false);
  // message shown when saving to an appointment fails, null otherwise
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  // the user's support links, to tell whether the number entered is one of them
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

  // fills in the support link chosen on My Support Links when coming back from it
  useFocusEffect(
    useCallback(() => {
      if (!pickedSupportLink) return;
      setPhone(pickedSupportLink.phone);
      setSupportLinkId(pickedSupportLink.id);
      setShowError(false);
      setSaveError(null);
      pickSupportLink(null);
    }, [pickedSupportLink, pickSupportLink]),
  );

  // typing a number replaces the chosen support link, it is matched to the links by number instead
  const changePhone = (text: string) => {
    setPhone(text);
    setSupportLinkId(undefined);
    setShowError(false);
    setSaveError(null);
  };

  // shown under the contacts button when a contact's number can't be used, null otherwise
  const [contactMessage, setContactMessage] = useState<string | null>(null);

  // opens the phone's contacts, and puts the chosen contact's phone number in the field
  const chooseContact = async () => {
    setContactMessage(null);
    try {
      // reading the chosen contact's phone numbers needs permission
      const { granted } = await requestPermissionsAsync();
      if (!granted) {
        setContactMessage('Allow access to your contacts in your phone settings to choose from them.');
        return;
      }
      const contact = await Contact.presentPicker();
      // null when the user closed the contacts without choosing
      if (!contact) return;

      const numbers = (await contact.getPhones())
        .map((item) => item.number)
        .filter((number): number is string => !!number);
      // prefers an Australian mobile number, as only they can be invited
      const number = numbers.find((item) => normalisePhoneNumber(item)) ?? numbers[0];
      if (!number) {
        setContactMessage('This contact has no phone number.');
        return;
      }
      changePhone(number);
    } catch (error) {
      console.error('Failed to choose a contact', error);
      setContactMessage('Your contacts could not be opened.');
    }
  };

  // null when the number entered isn't an Australian mobile number
  const serverPhone = normalisePhoneNumber(phone);
  // the support link this person is, chosen from My Support Links or matched by the number entered
  const link =
    links.find((item) => item.id === supportLinkId) ??
    (serverPhone ? links.find((item) => item.invited_phone_number === serverPhone) : undefined);

  // shown under the phone number, says what happens with the number entered
  const phoneHint = link?.supporter_name
    ? `${link.supporter_name} will have view access to this appointment.`
    : serverPhone
      ? 'When the support person signs up with this phone number, they will be able to accept your appointment invite.'
      : null;
  const phoneInvalid = !link && !serverPhone && phone.trim() !== '';

  // a support link or a valid phone number is mandatory
  const save = async () => {
    // stops a second press saving twice
    if (saving) return;
    if (!link && !serverPhone) {
      setShowError(true);
      return;
    }
    // someone already added to the appointment can't be added again, they are edited instead
    const alreadyAdded = savedPeople.some(
      (item, itemIndex) =>
        itemIndex !== Number(index) &&
        ((!!link && item.supportLinkId === link.id) ||
          item.phone === (link?.invited_phone_number || serverPhone)),
    );
    if (alreadyAdded) {
      setSaveError('This support person has already been added to the appointment.');
      return;
    }
    const person = {
      // the server only knows the name of someone with an account
      name: link?.supporter_name ?? '',
      phone: link?.invited_phone_number || serverPhone || '',
      canAddQuestions,
      canAddAnswers,
      supportLinkId: link?.id,
    };
    // replaces the person being edited, or adds the new person to the end
    const supportPeople =
      index !== undefined
        ? savedPeople.map((item, itemIndex) => (itemIndex === Number(index) ? person : item))
        : [...savedPeople, person];
    // the create appointment flow saves its support persons together on the add support person
    // page
    if (!appointmentId) {
      updateDraft({ supportPeople });
      router.back();
      return;
    }

    // an existing appointment's support persons are saved to the server straight away, the
    // appointment's page then reloads them
    setSaving(true);
    setSaveError(null);
    try {
      await apiSaveSupportPeople(appointmentId, supportPeople);
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

  return (
    <View style={styles.screen}>
      <ScrollView stickyHeaderIndices={[0]} contentContainerStyle={styles.content}>
        <View style={[theme.header, styles.title]}>
          <Text style={[theme.h4, theme.leftText, theme.fontOnSurface, styles.titleText]}>
            Add Support Person
          </Text>
          <Text style={[styles.body, styles.intro, theme.leftText]}>
            Choose from My Support Links or invite someone with their phone number (you can choose
            from My Contacts or enter it manually).
          </Text>
        </View>
        <View style={[theme.sectionContainer, styles.card]}>
          <View style={styles.cardContent}>
            <View style={styles.buttons}>
              <Button
                label="Choose from My Support Links"
                onPress={() => router.push('/carePlanner/mySupportLinks')}
                buttonType="roundButton"
              />
              <Button
                label="Choose from My Contacts"
                onPress={chooseContact}
                buttonType="roundButton"
              />
            </View>
            {!!contactMessage && <Text style={styles.note}>{contactMessage}</Text>}

            <Text style={[styles.heading, styles.label]}>Phone number</Text>
            <TextInput
              style={[styles.field, styles.input]}
              value={phone}
              onChangeText={changePhone}
              placeholder="phone number"
              keyboardType="phone-pad"
              placeholderTextColor={colours.onSurface}
            />
            {phoneInvalid ? (
              <Text style={[styles.note, { color: paperColours.error }]}>
                Please enter a valid phone number.
              </Text>
            ) : (
              !!phoneHint && <Text style={styles.note}>{phoneHint}</Text>
            )}

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
            {!!link?.supporter_name && !link.can_view_assessments && (
              <Text style={styles.note}>
                {link.supporter_name} does not have access to your assessment data, so the questions
                they can add are limited. To change this, go to Shared With Me and update their
                permissions.
              </Text>
            )}
          </View>
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        {showError && (
          <Text style={[styles.error, { color: paperColours.error, borderColor: paperColours.error }]}>
            Please fill in all mandatory fields
          </Text>
        )}
        {!!saveError && (
          <Text style={[styles.error, { color: paperColours.error, borderColor: paperColours.error }]}>{saveError}</Text>
        )}
        <Button label={saving ? 'Saving...' : 'Save'} onPress={save} buttonType="roundButton" />
      </View>
    </View>
  );
}

function createStyles(colours: ColourSet, text: Typography, bottomInset: number) {
  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colours.background,
    },

    content: {
      paddingBottom: 200 + bottomInset,
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
      paddingHorizontal: '5%',
      paddingBottom: 5,
    },

    buttons: {
      gap: 12,
      marginHorizontal: 8,
    },

    bottomBar: {
      position: 'absolute',
      left: '7.5%',
      width: '85%',
      bottom: 120 + bottomInset,
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

    body: {
      ...text.body,
      color: colours.onBackground,
    },

    headline: {
      ...text.h4,
      color: colours.onBackground,
      marginTop: 8,
    },

    heading: {
      ...text.h6,
      color: colours.onSurface,
      paddingHorizontal: '5%',
    },

    label: {
      marginTop: 29,
      marginBottom: 19,
    },

    note: {
      ...text.small,
      color: colours.onSurface,
      marginTop: 4,
      marginHorizontal: 8,
    },

    input: {
      ...text.body,
      color: colours.onSurface,
    },

    field: {
      height: 40,
      paddingVertical: 5,
      paddingHorizontal: 10,
      marginHorizontal: 8,
      borderWidth: 1,
      borderColor: colours.onSurface,
    },

    checkboxList: {
      marginHorizontal: 8,
      borderWidth: 1,
      borderColor: colours.onSurface,
      overflow: 'hidden',
    },

    divider: {
      borderTopWidth: lineThickness,
      borderTopColor: colours.secondary2,
    },

    checkboxItem: {
      paddingLeft: 10,
      paddingRight: 4,
    },

  });
}
