import { useRouter } from "expo-router";
import { useState } from "react";
import Button from "../atomicUI/Button";
import { TextInput } from "react-native-paper";
import { Text, StyleSheet, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { lineThickness } from '../../constants/layout';
import { useTheme, ColourSet } from '../../context/ThemeContext';
import { Typography } from '../../constants/textSize';
import React from 'react';


//Input variables
const MAX_lENGTH_NUM = 10; //aus phone numbers are 10 characters, including the "04"
const AREA_CODE = "04";

function sanitizeNumberInput(text: string) {
  let t = text.replace(/[^0-9]/g, ""); //removes any non-number
  t = t.slice(0, MAX_lENGTH_NUM); //cuts down to our max length
  return t;
}


function validateTextInput(text: string) {
  //checking if it's something we should accept, i.e. within range
  //if (text == "") return "enter text"; //what it prints if submitted

  const length = text.length;
  if (length > MAX_lENGTH_NUM) {
    return "phone number is too long";
  }else if(length < MAX_lENGTH_NUM){
    return "phone number is too short"
  }
  return null;
}

/**
 * This is a variation of text entry, specifically for phone numbers
 */
type PhoneFieldProps ={
  onSubmit: (phone :string)=> void;
}

function PhoneField({onSubmit}: PhoneFieldProps) {
  const { colours, theme } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = createStyles(colours, theme, insets.bottom);
  const router = useRouter();

  const [value, setValue] = useState<string>(AREA_CODE);
  const [error, setError] = useState<string>("");



  const handleChange = (text: string) => {
    setValue(sanitizeNumberInput(text));
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
    <View>
      <View style= {theme.sectionContainer}>
        <TextInput
          style={[styles.field, theme.option]}
          onChangeText={handleChange}
          value={value}
          keyboardType="numeric"
          maxLength={MAX_lENGTH_NUM}
          textContentType="telephoneNumber"
        />

        <View style= {theme.sectionContainer}>
        {!!error && <Text style={styles.subheading}>{error}</Text>}
        </View>
        <View style = {{marginBottom: 16}}>
        <Button
          label="Submit"
          onPress={handleSubmit}
          buttonType="roundButton"
        />
        </View>
      </View>
    </View>
  );
}

export { PhoneField }; //add the new component here

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
      height: 40,
      paddingVertical: 5,
      paddingHorizontal: 10,
      marginHorizontal: 8,
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
