/**
 * Multiple choice. dooesn't allow submit without selection.
 */
import React, { useState } from "react";
import { Text, Pressable, View, StyleSheet } from "react-native";
import { useTheme, ColourSet } from "../../../context/ThemeContext";
import { HelperText } from "react-native-paper";

type MultipleChoiceProps ={
  questionOptions: string[];
  onSubmit: (v: string) => void;
}

function MultipleChoice({ questionOptions, onSubmit }: MultipleChoiceProps) {
  const { theme, colours } = useTheme();
  const styles = createStyles(colours);

  const [selected, setSelected] = useState<string | null>(null);; // tracks the currently selected answer
  const [error, setError] = useState("");

  const handleSubmit = () => {
    // Save the current answer result
    if(selected === null){
      setError("Please select an option");
      return;
    }
      onSubmit(selected);
  };

  return (
    <View style={theme.clearContainer}>

      <View>

      {questionOptions.map((option) => {
        const isSelected = selected === option;

        return (
          <View key={option} style={{marginVertical : 5}}>
          <Pressable
              key={option}
              onPress={() => setSelected(option)}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: isSelected }}
              style={[styles.option, isSelected && styles.optionSelected]}
            >
            <Text style={[theme.h6, { color: colours.onSurface }]}>{option}</Text>
            </Pressable>
            </View>
        );
      })}
      
      <HelperText type="error" visible={!!error} style={styles.helper}>
          {error}
      </HelperText>
      </View>

    
        <Pressable
        onPress={handleSubmit}
        style={[styles.button, selected === null && styles.buttonDisabled]}
      >
        <Text style={[theme.h6, { color: colours.onSurface }]}>Submit</Text>
      </Pressable>
      </View>
  );
}

export { MultipleChoice }; 

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
    buttonDisabled: { opacity: 0.7 },
  });
}
