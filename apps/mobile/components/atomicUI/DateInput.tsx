import { useState } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { useTheme as usePaperTheme } from 'react-native-paper';
import { DatePickerModal } from 'react-native-paper-dates';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { useTheme, ColourSet } from '../../context/ThemeContext';
import { Typography } from '../../constants/textSize';
import { formatDate } from '../../constants/date';

type DateInputProps = {
  value?: Date; // left out until a date is picked
  onChange: (date: Date) => void;
  placeholder: string;
  earliest?: Date; // days before this can't be picked
};

/**
 * Themed field that shows the picked date, e.g. '12 Oct 2026', and opens a calendar when pressed.
 * Matches TimeInput, so the two can be used together.
 *
 * for example:
 *
 * <DateInput
 *   value={date}
 *   onChange={setDate}
 *   placeholder="Pick appointment date"
 *   earliest={new Date()}
 * />
 */
const DateInput = ({ value, onChange, placeholder, earliest }: DateInputProps) => {
  const { colours, theme } = useTheme();
  const styles = createStyles(colours, theme);
  const { colors: paperColours } = usePaperTheme();
  const [pickerOpen, setPickerOpen] = useState(false);

  return (
    <>
      <Pressable
        style={styles.field}
        onPress={() => setPickerOpen(true)}
        accessibilityRole="button"
      >
        <Text style={[styles.input, !value && { color: paperColours.onSurfaceVariant }]}>
          {value ? formatDate(value) : placeholder}
        </Text>
        <Ionicons name="calendar-outline" size={20} color={colours.onSurface} />
      </Pressable>
      <DatePickerModal
        locale="en-GB"
        mode="single"
        visible={pickerOpen}
        date={value}
        validRange={earliest ? { startDate: earliest } : undefined}
        onDismiss={() => setPickerOpen(false)}
        onConfirm={({ date }) => {
          setPickerOpen(false);
          if (date) onChange(date);
        }}
      />
    </>
  );
};

export default DateInput;

function createStyles(colours: ColourSet, text: Typography) {
  return StyleSheet.create({
    field: {
      height: 40,
      paddingVertical: 5,
      paddingHorizontal: 10,
      marginHorizontal: 8,
      borderWidth: 1,
      borderColor: colours.onSurface,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    input: {
      ...text.body,
      color: colours.onSurface,
    },
  });
}
