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
import { useTheme as usePaperTheme } from "react-native-paper";


import { lineThickness } from '../../constants/layout';
import { useTheme, ColourSet } from '../../context/ThemeContext';
import { Typography } from '../../constants/textSize';
import { useSafeAreaInsets } from "react-native-safe-area-context";
//numberInput variables

type NumberProps ={
  onSubmit: (v: any) => void;
  MAX_lENGTH_NUM?: number;
  LOWER_BOUND?: number;
  UPPER_BOUND?: number;
  initialValue?: string; // the number to start with, from a saved answer
  description?: string;
}


//NumberEntry
function NumberEntry({ onSubmit, LOWER_BOUND = 0, UPPER_BOUND = 10, MAX_lENGTH_NUM = String(UPPER_BOUND).length, initialValue, description }: NumberProps) {
  const { colours, theme } = useTheme();
  const { colors: paperColours } = usePaperTheme();
  const insets = useSafeAreaInsets();
  const styles = createStyles(colours, theme, insets.bottom);

  const [value, setValue] = useState<string>(initialValue ?? "");
  const [error, setError] = useState<string>("");


  function sanitizeNumberInput(text: string) {
    let t = text.replace(/[^0-9]/g, ""); //removes any non-number
    t = t.slice(0, MAX_lENGTH_NUM); //cuts down to our max length
    return t;
  }

  function validateNumberInput(numText: string) {
    //checking if it's something we should accept, i.e. within range
    const rangeMessage = `Enter a number between ${LOWER_BOUND}-${UPPER_BOUND}`;
    if (numText == "") return rangeMessage;

    const num = Number(numText);
    if (!Number.isInteger(num) || num < LOWER_BOUND || num > UPPER_BOUND) {
      return rangeMessage;
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
    <View>
      <View style={theme.sectionContainer}>
        <TextInput
          style={[styles.subheading, styles.field]}
          onChangeText={handleChange}
          value={value}
          placeholder="input number only"
          placeholderTextColor={colours.onBackground + '99'}
          keyboardType="numeric"
          maxLength={MAX_lENGTH_NUM}
        />
        {!!error && <Text style={[theme.small, styles.errorText, { color: paperColours.error }]}>{error}</Text>}
        {!!description && <Text style={[theme.body, theme.fontOnSurface, styles.description]}>{description}</Text>}
      </View>
      <View style={{ width: '85%', alignSelf: 'center', marginTop: 25 }}>
        <Button label="Continue" onPress={handleSubmit} buttonType="roundButton" />
      </View>
    </View>
  );
}

export { NumberEntry, NumberProps };



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
      marginHorizontal: 20,
    },

    label: {
      marginTop: 29,
      marginBottom: 19,
    },

    errorText: {
      marginHorizontal: 20,
      paddingHorizontal: '5%',
      marginTop: -10,
    },

    description: {
      paddingHorizontal: '5%',
      marginHorizontal: 0,
      marginTop: 8,
      fontStyle: 'italic',
    },

    firstLabel: {
      marginTop: 5,
    },

    field: {
      height: 40,
      paddingVertical: 5,
      paddingHorizontal: 10,
      marginHorizontal: 35,
      marginTop: 15,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: colours.onSurface,
      justifyContent: 'center',
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

    divider: {
      borderTopWidth: lineThickness,
      borderTopColor: colours.secondary2,
    },

    selectedRow: {
      backgroundColor: colours.secondary,
    },

    selectedText: {
      color: colours.onSecondary,
    },
  });
}

