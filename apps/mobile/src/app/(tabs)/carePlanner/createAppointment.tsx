/**
 * Patients create a new appointment from this screen, opened from the care planner.
 */
import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme as usePaperTheme } from 'react-native-paper';
import { DatePickerInput } from 'react-native-paper-dates';
import Button from '../../../../components/atomicUI/Button';
import { useTheme, ColourSet } from '../../../../context/ThemeContext';
import { textLayout } from '../../../../constants/layout';

const HEALTH_SERVICES = [
  'General Practitioner',
  'Other',
];

// start of today, appointments cannot be scheduled in the past
const startOfToday = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
};

export default function Screen() {
  const { colours } = useTheme();
  const styles = createStyles(colours);
  const router = useRouter();
  // error red and placeholder colour from the Paper theme, which change for dark mode
  const { colors: paperColours } = usePaperTheme();

  const [date, setDate] = useState<Date | undefined>(undefined);
  const [doctor, setDoctor] = useState('');
  // null until a service is chosen
  const [service, setService] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showError, setShowError] = useState(false);

  // choose a health service and close the dropdown, choosing it again clears it
  const handleSelect = (option: string) => {
    setService((prev) => (prev === option ? null : option));
    setDropdownOpen(false);
  };

  // closes this page, returning to the care planner underneath it, if mandatory fields are filled
  const handleSubmit = () => {
    if (!date) {
      setShowError(true);
      return;
    }
    router.back();
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>Appointment date</Text>
      <DatePickerInput
        locale="en-GB"
        inputMode="start"
        value={date}
        onChange={(newDate) => {
          setDate(newDate);
          if (newDate) setShowError(false);
        }}
        validRange={{ startDate: startOfToday() }}
        placeholder="Pick appointment date"
        withDateFormatInLabel={false}
        style={styles.dateInput}
        // hides the M3 underline so the field matches the other rounded boxes
        underlineColor="transparent"
        activeUnderlineColor="transparent"
      />

      <View>
        <Text style={styles.heading}>Doctor's name</Text>
        <Text style={styles.subheading}>Optional</Text>
      </View>
      <TextInput
        style={[styles.field, styles.input]}
        value={doctor}
        onChangeText={setDoctor}
        placeholder="Doctor's name"
        placeholderTextColor={paperColours.onSurfaceVariant}
      />

      <View>
        <Text style={styles.heading}>Health services</Text>
        <Text style={styles.subheading}>Optional</Text>
      </View>
      <TouchableOpacity
        style={[styles.field, styles.dropdown]}
        onPress={() => setDropdownOpen(!dropdownOpen)}
      >
        <Text
          style={
            service ? styles.input : [styles.placeholder, { color: paperColours.onSurfaceVariant }]
          }
        >
          {service ?? 'Select a health service'}
        </Text>
        <Text style={styles.input}>{dropdownOpen ? '▲' : '▼'}</Text>
      </TouchableOpacity>
      {dropdownOpen && (
        // all options in one box, separated by dividers
        <View style={styles.optionList}>
          {HEALTH_SERVICES.map((option, index) => (
            <TouchableOpacity
              key={option}
              style={[
                styles.optionRow,
                index > 0 && styles.divider,
                service === option && styles.selectedRow, // highlights selected option
              ]}
              onPress={() => handleSelect(option)}
            >
              <Text style={[styles.input, service === option && styles.selectedText]}>
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {showError && (
        <Text style={[styles.error, { color: paperColours.error }]}>
          Please fill in all mandatory fields
        </Text>
      )}
      <Button label="submit" onPress={handleSubmit} buttonType="primaryButton" />
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

    heading: {
      ...textLayout,
      color: colours.onBackground,
    },

    subheading: {
      fontSize: 14,
      color: colours.onBackground,
    },

    field: {
      backgroundColor: colours.surface,
      borderRadius: 8,
      padding: 12,
    },

    // overflow hidden rounds the bottom corners, which Paper leaves square for the underline
    dateInput: {
      backgroundColor: colours.surface,
      borderRadius: 8,
      overflow: 'hidden',
    },

    input: {
      fontSize: 16,
      color: colours.onSurface,
    },

    error: {
      fontSize: 14,
    },

    placeholder: {
      fontSize: 16,
    },

    dropdown: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },

    // overflow hidden keeps the highlighted row inside the rounded corners
    optionList: {
      backgroundColor: colours.surface,
      borderRadius: 8,
      overflow: 'hidden',
    },

    optionRow: {
      paddingVertical: 10,
      paddingHorizontal: 12,
    },

    divider: {
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colours.ex3,
    },

    selectedRow: {
      backgroundColor: colours.secondary,
    },

    selectedText: {
      color: colours.onSecondary,
      fontWeight: 'bold',
    },
  });
}
