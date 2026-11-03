/**
 * Select from multiple. Allows custom select numbers.
 */
import React, { useState } from "react";
import { Text, View, Pressable, StyleSheet } from "react-native";
import { useTheme, ColourSet } from "../../context/ThemeContext";
import { HelperText } from "react-native-paper";

type MultiSelectProps ={
  questionOptions: string[];
  onSubmit: (v: string[]) => void;
  headingText?: string;
  MIN_SELECTIONS: number;
  MAX_SELECTIONS: number;
}

function MultiSelect({ questionOptions, onSubmit, headingText, MIN_SELECTIONS, MAX_SELECTIONS }: MultiSelectProps) {
  const { theme, colours } = useTheme();
  const styles = createStyles(colours)

  const [selected, setSelected] = useState<string[]>([]); // Tracks the currently selected answers
  const [error, setError] = useState("");

  function validateMultipleChoice(): string | null {
  if (selected.length < MIN_SELECTIONS) {
    return MIN_SELECTIONS === 1
      ? "Please select at least one option"
      : `Please select at least ${MIN_SELECTIONS} options`;
  }
  if (selected.length > MAX_SELECTIONS) {
    return `Please select no more than ${MAX_SELECTIONS} options`;
  }
  return null;
  };

  const handleSelect = (answer: string) => {
    // Toggle selection of an answer
    setSelected((prev) => {
      if (prev.includes(answer)) return prev.filter((a) => a !== answer);
      return [...prev, answer];
    });
  };

  const handleSubmit = () => {
    const problem = validateMultipleChoice();
    if(problem){
      setError(problem);
      return;
    }
      onSubmit(selected);
  };

  return (
    <View style={theme.clearContainer}>

      {/* render options as buttons */}
      <View style={styles.options}>
        {questionOptions.map((option) => {
          const isSelected = selected.includes(option);
          return (
            <Pressable
              key={option}
              onPress={() => handleSelect(option)}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: isSelected }}
              style={[styles.option, isSelected && styles.optionSelected]}
            >
              <Text style={[theme.h6, { color: colours.onSurface }]}>{option}</Text>
            </Pressable>
          );
        })}

        <HelperText type="error" visible={!!error} style={styles.helper}>
          {error}
        </HelperText>
        
      </View>

      <Pressable onPress={handleSubmit} style={styles.button}>
        <Text style={[theme.h6, { color: colours.onSurface }]}>Submit</Text>
      </Pressable>
    </View>

  );
}

export { MultiSelect };


function createStyles(colours: ColourSet) {
  const pill = {
    height: 60,
    width: "100%" as const,
    borderRadius: 100,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  };

  return StyleSheet.create({
    options: { width: "100%", alignSelf: "center", gap: 12 },
    option: {
      ...pill,
      borderWidth: 2,
      borderColor: colours.secondary,
      backgroundColor: "transparent",
    },
    optionSelected: {
      borderColor: colours.secondary,
      backgroundColor: colours.tertiary,
    },
    helper: { textAlign: "center" },
    button: {
      ...pill,
      width: "100%",
      alignSelf: "center",
      backgroundColor: colours.primary,
    },
  });
}
