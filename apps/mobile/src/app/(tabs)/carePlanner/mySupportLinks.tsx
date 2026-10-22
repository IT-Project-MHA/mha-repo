/**
 * Patients choose a support person from their saved support links on this screen, opened from the
 * new support person page. Invites the support person hasn't accepted yet are shown too.
 */
import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { useTheme, ColourSet } from '../../../../context/ThemeContext';
import { textLayout } from '../../../../constants/layout';
import { useAppointment } from '../../../../context/AppointmentContext';
import { apiMySupportLinks } from '../../../api/care_planner_api_helpers';

// support link record returned by the API
type ApiSupportLink = {
  id: string;
  invited_phone_number: string;
  supporter_name: string | null; // null until the invited phone number has an account
  status: 'invited' | 'active';
};

export default function Screen() {
  const { colours } = useTheme();
  const styles = createStyles(colours);
  const router = useRouter();
  const { pickSupportLink } = useAppointment();
  // null while loading
  const [links, setLinks] = useState<ApiSupportLink[] | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    const loadLinks = async () => {
      try {
        setLinks(await apiMySupportLinks());
      } catch (error) {
        console.error('Failed to load support links', error);
        setLoadFailed(true);
      }
    };
    loadLinks();
  }, []);

  // gives the chosen link to the new support person page and goes back to it
  const choose = (link: ApiSupportLink) => {
    pickSupportLink({ id: link.id, phone: link.invited_phone_number });
    router.back();
  };

  // message shown instead of the list
  const message = loadFailed
    ? 'Your support links could not be loaded'
    : links === null
      ? 'Loading...'
      : links.length === 0
        ? 'You have no support links yet'
        : null;

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        {message ? (
          <Text style={styles.body}>{message}</Text>
        ) : (
          links?.map((link) => (
            <Pressable
              key={link.id}
              style={styles.linkCard}
              onPress={() => choose(link)}
              accessibilityRole="button"
            >
              {/* someone invited without an account yet has no name */}
              <View style={styles.linkInfo}>
                <Text style={styles.linkName}>{link.supporter_name || 'Pending invite'}</Text>
                {!!link.invited_phone_number && (
                  <Text style={styles.linkDetails}>{link.invited_phone_number}</Text>
                )}
                {/* someone with an account who hasn't accepted yet */}
                {!!link.supporter_name && link.status === 'invited' && (
                  <Text style={styles.linkDetails}>Invite not accepted yet</Text>
                )}
              </View>
              <Ionicons name="add" size={24} color={colours.onSurface} />
            </Pressable>
          ))
        )}
      </ScrollView>
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

    body: {
      ...textLayout,
      color: colours.onBackground,
    },

    linkCard: {
      backgroundColor: colours.surface,
      borderRadius: 8,
      padding: 12,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },

    // takes the card's width apart from the chevron
    linkInfo: {
      flex: 1,
      gap: 4,
    },

    linkName: {
      ...textLayout,
      color: colours.onSurface,
    },

    linkDetails: {
      fontSize: 14,
      color: colours.onSurface,
    },
  });
}
