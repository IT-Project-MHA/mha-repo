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
import { Text, View, StyleSheet, Pressable } from "react-native";
import { TextInput, HelperText } from "react-native-paper";
import { useTheme, ColourSet } from "../../../context/ThemeContext";

//numberInput variables

type NumberEntryProps = {
  onSubmit: (digits: string) => void;
  length: number; // exact number of digits required
  secure?: boolean; // hide the digits, e.g. for pins
  placeholder?: string;
  validate?: (value: string) => string | null; 
};

//NumberEntry
export function NumberEntry({
  onSubmit,
  length,
  secure = false,
  placeholder = "Enter digits",
  validate
}: NumberEntryProps) {
  const { colours, theme } = useTheme();
  const styles = createStyles(colours);

  const [value, setValue] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [hidden, setHidden] = useState(secure);

  const handleChange = (text: string) => {
    setValue(text.replace(/\D/g, "").slice(0, length)); // capped at length
    setError("");
  };

  const handleSubmit = () => {
    if (value.length !== length) {
      setError(`Please enter all ${length} digits.`);
      return;
    }
    const problem = validate?.(value);
    if (problem) {
      setError(problem);
      return;
    }
    onSubmit(value);
  };

  return (
    <View style={theme.clearContainer}>
      
      <View style={theme.layoutContainer}>
      <TextInput
          mode="outlined"
          value={value}
          onChangeText={handleChange}
          onSubmitEditing={handleSubmit}
          placeholder={placeholder}
          keyboardType="number-pad"
          secureTextEntry={hidden}
          maxLength={length}
          error={!!error}
          textColor={colours.onSurface}
          outlineColor={colours.secondary}
          activeOutlineColor={colours.primary}
          placeholderTextColor={colours.onSurface}
          outlineStyle={styles.outline}
          style={[styles.field, { fontSize: theme.h6.fontSize }]}
          contentStyle={styles.fieldContent}
          // show/hide toggle for pins
          right={
            secure ? (
              <TextInput.Icon
                icon={hidden ? "eye-off" : "eye"}
                onPress={() => setHidden((h) => !h)}
              />
            ) : undefined
          }
        />

      <HelperText type="error" visible={!!error} style={styles.helper}>
          {error}
        </HelperText>
      </View>

      <Pressable onPress={handleSubmit} style={styles.button}>
        <Text
          style={[theme.h6, styles.buttonText, { color: colours.onPrimary }]}
        >
          Submit
        </Text>

      </Pressable>
      </View>
  );
}

function createStyles(colours: ColourSet) {
  return StyleSheet.create({
    container: {
      width: "100%",
      alignItems: "center",
      gap: 40,
    },
    content: { gap: 24 },
    fieldWrap: { width: "80%" },
    field: {
      height: 60,
      backgroundColor: "transparent",
    },
    fieldContent: {
      textAlign: "center",
      paddingHorizontal: 40,
    },
    outline: {
      borderRadius: 100,
      borderWidth: 2,
    },
    helper: { textAlign: "center" },
    button: {
      height: 60,
      width: "100%",
      borderRadius: 100,
      justifyContent: "center",
      backgroundColor: colours.primary,
    },
    buttonText: { textAlign: "center" },
  });
}