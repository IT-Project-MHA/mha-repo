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
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, TextInput, View, StyleSheet } from "react-native";
import Button from "../atomicUI/Button";
import { themes } from "../../constants/theme";
//import { } from "";

//numberInput variables
const MAX_lENGTH_NUM = 2;
const LOWER_BOUND = 1;
const UPPER_BOUND = 10;

function sanitizeNumberInput(text: string) {
  let t = text.replace(/[^0-9]/g, ""); //removes any non-number
  t = t.slice(0, MAX_lENGTH_NUM); //cuts down to our max length
  return t;
}

function validateNumberInput(numText: string) {
  //checking if it's something we should accept, i.e. within range
  if (numText == "") return "enter a number"; //what it prints if submitted

  const num = Number(numText);
  if (!Number.isInteger(num) || num < LOWER_BOUND || num > UPPER_BOUND) {
    return "enter a number between 1 and 10";
  }
  return null;
}

//NumberEntry
function NumberEntry({ onSubmit }: { onSubmit: (v: string) => void }) {
  const [value, setValue] = useState<string>("");
  const [error, setError] = useState<string>("");

  const handleChange = (text: string) => {
    setValue(sanitizeNumberInput(text));
    if (error) setError("");
  };

  const handleSubmit = () => {
    const err = validateNumberInput(value);
    if (err) {
      setError(err);
      return;
    }
    onSubmit(value);
  };

  return (
    <SafeAreaView>
      <View>
        <TextInput
          style={styles.input}
          onChangeText={handleChange}
          value={value}
          placeholder="input number only"
          keyboardType="numeric"
          maxLength={MAX_lENGTH_NUM}
        />
        {!!error && <Text>{error}</Text>}
        <Button
          label="submit"
          onPress={() => {
            onSubmit;
          }}
          buttonType="primaryButton"
        />
      </View>
    </SafeAreaView>
  );
}

export { NumberEntry };

//this is temporary, it should be in the central theme we have.
const styles = StyleSheet.create({
  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
  },
});
