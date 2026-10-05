/**
 * Patients check the details of their new appointment plan before submitting it.
 * Opened after addQuestions screen.
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
        <Text style={[styles.headline, styles.firstHeadline]}>Overview</Text>
        <View style={styles.section}>
          <Text style={styles.heading}>Appointment date</Text>
          <View style={styles.field}>
            <Text style={styles.input}>Mon, 12 Oct 2026</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.heading}>Doctor's name</Text>
          <View style={styles.field}>
            <Text style={styles.input}>John Doe</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.heading}>Health service</Text>
          <View style={styles.field}>
            <Text style={styles.input}>General Practitioner</Text>
          </View>
        </View>

        <Text style={styles.headline}>Support Persons</Text>
        <View style={[styles.field, styles.list]}>
          <Text style={[styles.input, styles.listItem]}>Jane Doe</Text>
          <Text style={[styles.input, styles.listItem, styles.divider]}>Evil John Doe</Text>
        </View>

        <Text style={styles.headline}>Questions to ask</Text>
        <View style={styles.section}>
          <Text style={styles.heading}>Pain location</Text>
          <View style={[styles.field, styles.list]}>
            <Text style={[styles.input, styles.listItem]}>x</Text>
            <Text style={[styles.input, styles.listItem, styles.divider]}>x</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.heading}>Pain intensity</Text>
          <View style={[styles.field, styles.list]}>
            <Text style={[styles.input, styles.listItem]}>x</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.heading}>Pain impact</Text>
          <View style={[styles.field, styles.list]}>
            <Text style={[styles.input, styles.listItem]}>x</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.heading}>Management</Text>
          <View style={[styles.field, styles.list]}>
            <Text style={[styles.input, styles.listItem]}>x</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.heading}>Your own questions</Text>
          <View style={[styles.field, styles.list]}>
            <Text style={[styles.input, styles.listItem]}>x</Text>
            <Text style={[styles.input, styles.listItem, styles.divider]}>x</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <Button
          label="Submit"
          onPress={() => router.dismissTo('/carePlanner')}
          buttonType="primaryButton"
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
      paddingBottom: 16,
      gap: 12,
    },

    bottomBar: {
      paddingHorizontal: 16,
      marginBottom: 44,
    },

    headline: {
      fontSize: 28,
      lineHeight: 36,
      fontWeight: '400',
      color: colours.onBackground,
      marginTop: 16,
    },

    firstHeadline: {
      marginTop: 0,
    },

    section: {
      gap: 8,
    },

    heading: {
      ...textLayout,
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

    list: {
      padding: 0,
      overflow: 'hidden',
    },

    listItem: {
      padding: 12,
    },

    divider: {
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colours.ex3,
    },
  });
}
