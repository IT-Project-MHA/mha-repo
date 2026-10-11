import { useState } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { useTheme as usePaperTheme } from 'react-native-paper';
import { TimePickerModal } from 'react-native-paper-dates';
import { useTheme, ColourSet } from '../../context/ThemeContext';
import { formatTime, isTimeBetween, TimeOfDay } from '../../constants/date';

type TimeInputProps = {
  value?: TimeOfDay; // left out until a time is picked
  onChange: (time: TimeOfDay) => void;
  placeholder: string;
  earliest: TimeOfDay; // times before this can't be picked
  latest: TimeOfDay; // times after this can't be picked
};

/**
 * Themed field that shows the picked time, e.g. '2:30 pm', and opens a time picker when pressed.
 * The time picker can't limit its range itself, so a time outside earliest to latest is not kept
 * and an error is shown instead.
 *
 * for example:
 *
 * <TimeInput
 *   value={time}
 *   onChange={setTime}
 *   placeholder="Pick appointment time"
 *   earliest={{ hours: 6, minutes: 0 }}
 *   latest={{ hours: 22, minutes: 0 }}
 * />
 */
const TimeInput = ({ value, onChange, placeholder, earliest, latest }: TimeInputProps) => {
  const { colours } = useTheme();
  const styles = createStyles(colours);
  const { colors: paperColours } = usePaperTheme();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [outOfRange, setOutOfRange] = useState(false);

  const label = value && formatTime(value);

  return (
    <>
      <Pressable
        style={styles.field}
        onPress={() => setPickerOpen(true)}
        accessibilityRole="button"
      >
        <Text style={[styles.input, !label && { color: paperColours.onSurfaceVariant }]}>
          {label ?? placeholder}
        </Text>
      </Pressable>
      <TimePickerModal
        visible={pickerOpen}
        locale="en-GB"
        use24HourClock={false}
        // opens on the picked time, or the earliest allowed time
        hours={value?.hours ?? earliest.hours}
        minutes={value?.minutes ?? earliest.minutes}
        onDismiss={() => setPickerOpen(false)}
        onConfirm={(time) => {
          setPickerOpen(false);
          const allowed = isTimeBetween(time, earliest, latest);
          setOutOfRange(!allowed);
          if (allowed) onChange(time);
        }}
      />
      {outOfRange && (
        <Text style={[styles.error, { color: paperColours.error }]}>
          Please pick a time from {formatTime(earliest)} to {formatTime(latest)}
        </Text>
      )}
    </>
  );
};

export default TimeInput;

function createStyles(colours: ColourSet) {
  return StyleSheet.create({
    field: {
      backgroundColor: colours.surface,
      borderRadius: 8,
      padding: 12,
    },

    input: {
      fontSize: 16,
      color: colours.onSurface,
    },

    error: {
      fontSize: 14,
    },
  });
}
