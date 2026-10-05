/**
 * Patients can add a support person to an appointment from this screen, opened after saving a new
 * appointment.
 */
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import Button from '../../../../components/atomicUI/Button';
import { useTheme, ColourSet } from '../../../../context/ThemeContext';
import { textLayout } from '../../../../constants/layout';

export default function Screen() {
  const { colours } = useTheme();
  const styles = createStyles(colours);
  const router = useRouter();

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.body}>You can nominate someone to help you prepare for your appointment 
        or you can skip below.</Text>

        <View style={{ gap: 8, marginTop: 8 }}>
          <Text style={styles.heading}>Support Person 1</Text>
          <Button
            label="Add person 1"
            onPress={() => router.push('/carePlanner/addSupportPerson1')}
            buttonType="primaryButton"
          />
        </View>

        <View style={{ gap: 8, marginTop: 8 }}>
          <Text style={styles.heading}>Support Person 2</Text>
          <Button
            label="Add person 2"
            onPress={() => router.push('/carePlanner/addSupportPerson2')}
            buttonType="primaryButton"
          />
        </View>
      </ScrollView>

      <View style={styles.buttonRow}>
        <Button
          label="Skip"
          onPress={() => router.dismissTo('/carePlanner')}
          buttonType="secondaryButton"
          style={styles.rowButton}
        />
        <Button
          label="Save"
          onPress={() => {}}
          buttonType="primaryButton"
          style={styles.rowButton}
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

    buttonRow: {
      flexDirection: 'row',
      gap: 12,
      paddingHorizontal: 16,
      marginBottom: 44, // nav bar: 28 + extra 16 gap
    },

    rowButton: {
      flex: 1,
      paddingHorizontal: 16,
    },
  });
}
