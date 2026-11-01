/*
  Can be: (as in implementations)
  - number entry
  - multiple choice
  - text entry
  - multiselect
  - slider
  - emoji

  All AnswerFields have a view and some function to get data out
  Also a boolean filled / not filled
  And answer type
  */

import React, { useState } from "react";
import { Text, TextInput, View, StyleSheet, Pressable } from "react-native";

import { useTheme, ColourSet } from "../../context/ThemeContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";
//numberInput variables

type NumberEntryProps = {
  onSubmit: (digits: string) => void;
  length: number; // exact number of digits required
  secure?: boolean; // hide the digits, e.g. for pins
  placeholder?: string;
};

//NumberEntry
export function NumberEntry({
  onSubmit,
  length,
  secure = false,
  placeholder = "Enter digits"
}: NumberEntryProps) {
  const { colours, theme } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = createStyles(colours);

  const [value, setValue] = useState<string>("");
  const [error, setError] = useState<string>("");

  const handleChange = (text: string) => {
    setValue(text.replace(/\D/g, "").slice(0, length)); // capped at length
    setError("");
  };

  const handleSubmit = () => {
    if (value.length !== length) {
      setError(`Please enter all ${length} digits.`);
      return;
    }
    onSubmit(value);
  };

  return (
    <View style={[theme.clearContainer, styles.content, theme.centerItems]}>
      <TextInput
        style={[theme.h6, styles.field, { color: colours.onSurface }]}
        value={value}
        onChangeText={handleChange}
        onSubmitEditing={handleSubmit}
        placeholder={placeholder}
        keyboardType="number-pad"
        secureTextEntry={secure}
        maxLength={length}
      />

      {!!error && (
        <Text style={[theme.body, { color: colours.onBackground }]}>
          {error}
        </Text>
      )}

      <Pressable onPress={handleSubmit} style={styles.button}>
        <Text
          style={[theme.h6, styles.buttonText, { color: colours.onSurface }]}
        >
          Submit
        </Text>
      </Pressable>
    </View>
  );
}

function createStyles(colours: ColourSet) {
  const pill = {
    height: 60,
    width: "80%" as const,
    borderRadius: 100,
    justifyContent: "center" as const
  };

  return StyleSheet.create({
    content: { gap: 24 },
    field: {
      ...pill,
      paddingHorizontal: 40,
      borderWidth: 2,
      borderColor: colours.secondary,
      textAlign: "center"
    },
    button: { ...pill, backgroundColor: colours.primary },
    buttonText: { textAlign: "center" }
  });
}
