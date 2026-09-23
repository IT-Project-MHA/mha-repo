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
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";
import type { ReactElement } from "react";
import { Text, TextInput, View, StyleSheet } from "react-native";
import { AnswerField } from "../baseComponents/AnswerField";
import Button from "../atomicUI/Button";
//import { } from "";

//numberInput variables
const MAX_lENGTH_TEXT = 1000;

function sanitizeTextInput(text: string) {
  /*let t = text.replace(/[^0-9]/g, ''); //removes any non-number
  t = t.slice(0, MAX_lENGTH_NUM); //cuts down to our max length
  return t;*/
  return text;
}

function validateTextInput(text: string) {
  //checking if it's something we should accept, i.e. within range
  //if (text == "") return "enter text"; //what it prints if submitted

  const length = Number(text);
  if (length > MAX_lENGTH_TEXT) {
    return "enter no more than 1000 characters";
  }
  return null;
}

function TextEntry({ onSubmit }: { onSubmit: (v: string) => void }) {
  const [value, setValue] = useState<string>("");
  const [error, setError] = useState<string>("");

  const handleChange = (text: string) => {
    setValue(sanitizeTextInput(text));
    if (error) setError("");
  };

  const handleSubmit = () => {
    const err = validateTextInput(value);
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
          placeholder="textInput"
          keyboardType="default"
          maxLength={MAX_lENGTH_TEXT}
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

/*
        {Button({
          label: "submit",
          onPress: handleSubmit,
          buttonType: themes.darkHC.primaryButton,
        })}

  */

export { TextEntry }; //add the new component here

//this is temporary, it should be in the central theme we have.
const styles = StyleSheet.create({
  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
  },
});
