  import { StyleSheet, TouchableOpacity, View, Text } from 'react-native';
  import React, {useState} from 'react';
  import { useTheme, ColourSet } from '../../context/ThemeContext';
  import type { FontScale } from '../../constants/textSize';
  import { lineThickness
   } from '../../constants/layout';
   import { Typography } from '../../constants/textSize';

  const data: {label: string; value: FontScale}[] = [
    { label: 'Size 1', value: 1 },
    { label: 'Size 2', value: 1.5 },
    { label: 'Size 3', value: 2 },
  ];

  const DropdownComponent = () => {
  const { colours, fontScale, setFontScale, theme } = useTheme();
  const styles = createStyles(colours, theme);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // choose a size and close the dropdown
  const handleSelect = (value: FontScale) => {
    setFontScale(value);
    setDropdownOpen(false);
  };

  return (
    <View>
      <TouchableOpacity
        style={[styles.field, styles.dropdown]}
        onPress={() => setDropdownOpen(!dropdownOpen)}
      >
        <Text style={styles.input}>
          {data.find((option) => option.value === fontScale)?.label ?? 'Select Size'}
        </Text>
        <Text style={styles.input}>{dropdownOpen ? '▲' : '▼'}</Text>
      </TouchableOpacity>
      {dropdownOpen && (
        <View style={styles.optionList}>
          {data.map((option, index) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.optionRow,
                index > 0 && styles.divider,
                fontScale === option.value && styles.selectedRow, // highlights selected option
              ]}
              onPress={() => handleSelect(option.value)}
            >
              <Text style={[styles.input, fontScale === option.value && styles.selectedText]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

export default DropdownComponent;

function createStyles(colours: ColourSet, text: Typography) {
  return StyleSheet.create({
    field: {
      paddingVertical: 5,
      paddingHorizontal: 10,
      borderWidth: 1,
      borderColor: colours.onSurface,
      width: '90%',
    },

    input: {
      ...text.body,
      color: colours.onSurface,
    },

    dropdown: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },

    optionList: {
      borderWidth: 1,
      borderColor: colours.onSurface,
      overflow: 'hidden',
    },

    optionRow: {
      paddingVertical: 10,
      paddingHorizontal: 12,
    },

    divider: {
      borderTopWidth: lineThickness,
      borderTopColor: colours.ex3,
    },

    selectedRow: {
      backgroundColor: colours.secondary,
    },

    selectedText: {
      color: colours.onSecondary,
    },
  });
}