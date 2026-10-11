/**
 * Patients choose a support person from their saved support links on this screen, opened from the
 * new support person page.
 */
import { View, StyleSheet, ScrollView } from 'react-native';
import { useTheme, ColourSet } from '../../../../context/ThemeContext';

export default function Screen() {
  const { colours } = useTheme();
  const styles = createStyles(colours);

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        {}
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
  });
}
