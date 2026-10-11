/**
 * Patients add a support person to an appointment from this screen, opened from the add a support
 * person page, or from an appointment's details to add them to that appointment. Pressing a person
 * on the add a support person page opens this screen again to edit them.
 */
import { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput } from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { Contact, requestPermissionsAsync } from 'expo-contacts';
import Button from '../../../../components/atomicUI/Button';
import { useTheme, ColourSet } from '../../../../context/ThemeContext';
import { textLayout } from '../../../../constants/layout';
import { Checkbox, useTheme as usePaperTheme } from 'react-native-paper';
import { useAppointment } from '../../../../context/AppointmentContext';
import { apiMySupportLinks, normalisePhoneNumber } from '../../../api/care_planner_api_helpers';

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
  const { colors: paperColours } = usePaperTheme();
  const router = useRouter();
  const {
    draft,
    updateDraft,
    appointments,
    updateAppointment,
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
      pickSupportLink(null);
    }, [pickedSupportLink, pickSupportLink]),
  );

  // typing a number replaces the chosen support link, it is matched to the links by number instead
  const changePhone = (text: string) => {
    setPhone(text);
    setSupportLinkId(undefined);
    setShowError(false);
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
  const save = () => {
    if (!link && !serverPhone) {
      setShowError(true);
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
    if (appointmentId) updateAppointment(appointmentId, { supportPeople });
    else updateDraft({ supportPeople });
    router.back();
  };

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.subheading}>
          Choose from My Support Links or invite someone with their phone number (you can choose from My Contacts or enter it manually). 
        </Text>
        <Button
          label="Choose from My Support Links"
          onPress={() => router.push('/carePlanner/mySupportLinks')}
          buttonType="primaryButton"
        />
        <Button
          label="Choose from My Contacts"
          onPress={chooseContact}
          buttonType="primaryButton"
        />
        {!!contactMessage && <Text style={styles.subheading}>{contactMessage}</Text>}

        <View>
          <Text style={styles.heading}>phone number</Text>
        </View>
        <TextInput
          style={[styles.field, styles.input]}
          value={phone}
          onChangeText={changePhone}
          placeholder="phone number"
          keyboardType="phone-pad"
          placeholderTextColor={paperColours.onSurfaceVariant}
        />
        {phoneInvalid ? (
          <Text style={[styles.subheading, { color: paperColours.error }]}>
            Please enter a valid phone number.
          </Text>
        ) : (
          !!phoneHint && <Text style={styles.subheading}>{phoneHint}</Text>
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
        {/* the suggested questions need the patient's assessment data, without it a support
            person only sees the suggestions that don't */}
        {!!link?.supporter_name && !link.can_view_assessments && (
          <Text style={styles.subheading}>
            {link.supporter_name} does not have access to your assessment data, so the questions they
            can add are limited. To change this, go to Shared With Me and update their permissions.
          </Text>
        )}
      </ScrollView>

      <View style={styles.bottomBar}>
        {showError && (
          <Text style={[styles.error, { color: paperColours.error }]}>
            Please fill in all mandatory fields
          </Text>
        )}
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

    error: {
      fontSize: 14,
      textAlign: 'center',
    },

    body: {
      ...textLayout,
      color: colours.onBackground,
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
