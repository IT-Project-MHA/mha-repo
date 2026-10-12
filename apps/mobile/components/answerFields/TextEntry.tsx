import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, TextInput, View, StyleSheet } from "react-native";
import Button from "../atomicUI/Button";
import { useTheme } from "../../context/ThemeContext";


//Input variables
const MAX_LENGTH_TEXT = 200;

function validateTextInput(text: string) {
  //checking if it's something we should accept, i.e. within range
  //if (text == "") return "enter text"; //what it prints if submitted
  if(text.trim()=="") return "Empty entry, please enter some text";
  if (text.length > MAX_LENGTH_TEXT) {
    return 'enter no more than ${MAX_LENGTH_TEXT} characters';
  }
  return null;
}

function TextEntry({ onSubmit }: { onSubmit: (v: string) => void }) {
  const { theme } = useTheme();

  const [value, setValue] = useState<string>("");
  const [error, setError] = useState<string>("");


  const handleChange = (text: string) => {
    setValue(text);
    if (error) setError("");
  };

  const handleSubmit = () => {
    const err = validateTextInput(value);
    if (err) {
      setError(err);
      return;
    }
    onSubmit(value.trim()); //also gets rid of trailing white space
  };

  return (
      <View>
        <TextInput
          style={[theme.text, theme.option]}
          onChangeText={handleChange}
          value={value}
          placeholder="textInput"
          keyboardType="default"
          maxLength={MAX_LENGTH_TEXT}
          onSubmitEditing={handleSubmit}
        />
        {!!error && <Text style={theme.text}>{error}</Text>}
        <Button
          label="submit"
          onPress={handleSubmit}
          buttonType="primaryButton"
        />
      </View>
  );
}

export { TextEntry }; //add the new component here

