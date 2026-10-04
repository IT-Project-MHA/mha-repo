/**
 * All user types have access to this scree
 */
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme, ColourSet } from '../../../context/ThemeContext';
import { textLayout } from '../../../constants/layout';

const CARDS = ['My Appointments', 'Shared With You'];

export default function Tab() {
  const { colours } = useTheme();
  const styles = createStyles(colours);

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.headline}>Your Care Planner</Text>
        <Text style={styles.body}>Prepare for your appointments with confidence.</Text>

        {CARDS.map((title) => (
          <View key={title} style={styles.filledCard}>
            <Text style={styles.cardTitle}>{title}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
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
      paddingBottom: 120,
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
      marginBottom: 12,
    },

    filledCard: {
      backgroundColor: colours.surface,
      borderRadius: 8,
      padding: 16,
    },

    cardTitle: {
      ...textLayout,
      color: colours.onSurface,
    },
  });
}