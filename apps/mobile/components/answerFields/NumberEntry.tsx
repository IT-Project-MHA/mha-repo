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


import { lineThickness } from '../../constants/layout';
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
        style={[styles.field, styles.subheading]}
        onChangeText={handleChange}
        value={value}
        placeholder="input number only"
        keyboardType="numeric"
        maxLength={MAX_lENGTH_NUM}
      />
      <View  style={styles.bottomBar}>
        {!!error && <Text style={styles.subheading}>{error}</Text>}

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
    screen: {
      flex: 1,
      backgroundColor: colours.background,
    },

    content: {
      paddingBottom: 200 + bottomInset,
      gap: 38,
    },

    title: {
      marginBottom: -19,
    },

    card: {
      gap: 12,
    },

    cardContent: {
      paddingHorizontal: '5%',
      paddingBottom: 5,
    },

    bottomBar: {
      position: 'absolute',
      left: '7.5%',
      width: '85%',
      bottom: 120 + bottomInset,
      gap: 8,
    },

    heading: {
      ...text.h6,
      color: colours.onSurface,
      paddingHorizontal: '5%',
    },

    subheading: {
      ...text.small,
      color: colours.onBackground,
      paddingHorizontal: '5%',
      marginTop: 4,
    },

    label: {
      marginTop: 29,
      marginBottom: 19,
    },

    firstLabel: {
      marginTop: 5,
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

    input: {
      ...text.body,
      color: colours.onSurface,
    },

    error: {
      ...text.small,
      borderWidth: 1,
      borderRadius: 8,
      paddingVertical: 6,
      paddingHorizontal: 12,
      backgroundColor: colours.background,
      overflow: 'hidden',
    },

    dropdown: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },

    optionList: {
      marginTop: 8,
      marginHorizontal: 8,
      borderWidth: 1,
      borderColor: colours.onSurface,
      overflow: 'hidden',
    },

    optionRow: {
      paddingVertical: 10,
      paddingHorizontal: 12,
    },

    selectedRow: {
      backgroundColor: colours.secondary,
    },

    selectedText: {
      color: colours.onSecondary,
    },
  });
}

