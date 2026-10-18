/**
 * Patients choose a support person from their saved support links on this screen, opened from the
 * new support person page. Invites the support person hasn't accepted yet are shown too.
 */
import { Fragment, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { useTheme, ColourSet } from '../../../../context/ThemeContext';
import { Typography } from '../../../../constants/textSize';
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
  const { colours, theme } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = createStyles(colours, theme, insets.bottom);
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
      <ScrollView stickyHeaderIndices={[0]} contentContainerStyle={styles.content}>
        <View style={[theme.header, styles.title]}>
          <Text style={[theme.h4, theme.leftText, theme.fontOnSurface]}>My Support Links</Text>
        </View>
        <View style={[theme.sectionContainer, styles.card]}>
          {message ? (
            <Text style={styles.body}>{message}</Text>
          ) : (
            // wrapped so the card's gap isn't added between the rows & dividers
            <View>
              {links?.map((link, index) => (
                <Fragment key={link.id}>
                  {index > 0 && <View style={theme.line} />}
                  <Pressable
                    style={styles.linkRow}
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
                    <Ionicons name="add-outline" size={16} color={colours.onSurface} />
                  </Pressable>
                </Fragment>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
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
      paddingBottom: 120 + bottomInset,
      gap: 38,
    },

    title: {
      marginBottom: -19,
    },

    card: {
      gap: 4,
    },

    body: {
      ...text.body,
      color: colours.onBackground,
    },

    linkRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingBlock: 24,
      width: '85%',
      alignSelf: 'center',
    },

    linkInfo: {
      flex: 1,
      gap: 4,
    },

    linkName: {
      ...text.body,
      color: colours.onSurface,
    },

    linkDetails: {
      ...text.small,
      color: colours.onSurface,
    },
  });
}
