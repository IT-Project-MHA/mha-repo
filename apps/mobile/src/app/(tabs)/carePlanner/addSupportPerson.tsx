/**
 * Patients can add a support person to an appointment from this screen, opened after saving a new
 * appointment.
 */
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import Button from '../../../../components/atomicUI/Button';
import { useTheme, ColourSet } from '../../../../context/ThemeContext';

export default function Screen() {
  const { colours } = useTheme();
  const styles = createStyles(colours);
  const router = useRouter();

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.body}>You can nominate someone to help you prepare for your appointment 
        or you can skip below.</Text>

      <View style={styles.buttonRow}>
        <Button
          label="Skip"
          // returns to the care planner, closing this page
          onPress={() => router.dismissTo('/carePlanner')}
          buttonType="secondaryButton"
          style={styles.rowButton}
        />
        <Button
          label="Save"
          onPress={() => {
            // no support person selection yet
          }}
          buttonType="primaryButton"
          style={styles.rowButton}
        />
      </View>
    </ScrollView>
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

    buttonRow: {
      flexDirection: 'row',
      gap: 12,
    },

    rowButton: {
      flex: 1,
      paddingHorizontal: 16,
    },
  });
}
