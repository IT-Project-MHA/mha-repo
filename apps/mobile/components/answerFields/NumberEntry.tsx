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
import { Text, TextInput, View, StyleSheet } from "react-native";
import Button from "../atomicUI/Button";

import { useTheme, ColourSet } from '../../context/ThemeContext';
import { Typography } from '../../constants/textSize';
import { useSafeAreaInsets } from "react-native-safe-area-context";
//numberInput variables

type NumberProps ={
  onSubmit: (v: any) => void;
  MAX_lENGTH_NUM: number;
  LOWER_BOUND: number;
  UPPER_BOUND: number;
}


//NumberEntry
function NumberEntry({ onSubmit, MAX_lENGTH_NUM, LOWER_BOUND, UPPER_BOUND }: NumberProps) {
  const { colours, theme } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = createStyles(colours, theme, insets.bottom);

  const [value, setValue] = useState<string>("");
  const [error, setError] = useState<string>("");


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
      return 'enter a number between '+LOWER_BOUND+' and '+UPPER_BOUND;
    }
    return null;
  }

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
    <View style={[theme.clearContainer, styles.content]}>
      <TextInput
        style={[theme.h6, styles.field, {color:colours.onSurface}]}
        onChangeText={handleChange}
        value={value}
        placeholder="input number only"
        keyboardType="numeric"
        maxLength={MAX_lENGTH_NUM}
      />
      <View>
        {!!error && <Text style={ [theme.body, {color: colours.onBackground}]}>{error}</Text>}

        <Button
        label="submit"
        onPress={handleSubmit}
        buttonType="roundButton"
        />
      </View>
    </View>
  );
}

export { NumberEntry };

function createStyles(colours: ColourSet, text: Typography, bottomInset: number) {
  return StyleSheet.create({
    content: {
      paddingBottom: 100 + bottomInset,
      gap: 40,
    },
    field: {
      height: 60,
      paddingVertical: 3,
      paddingHorizontal: 40,
      borderRadius:100,
      borderWidth: 2,
      borderColor: colours.secondary,
      justifyContent: 'center',
      textAlign: 'center',
    },
  });
}