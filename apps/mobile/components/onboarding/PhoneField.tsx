import { useState } from "react";
import Button from "../atomicUI/Button";
import { TextInput } from "react-native-paper";
import { Text, View, StyleSheet } from 'react-native';
import { useTheme, ColourSet } from '../../context/ThemeContext';
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

  //checking input is within range
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
  const { theme, colours } = useTheme();
  const  styles = createStyles(colours);

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
      <View style= {theme.clearContainer}>
        <TextInput
          style={[styles.field]}
          onChangeText={handleChange}
          value={value}
          keyboardType="numeric"
          maxLength={MAX_lENGTH_NUM}
          textContentType="telephoneNumber"
        />

        {!!error && <Text style={theme.small}>{error}</Text>}
        </View>
        <View style = {{marginBottom: 16}}>
        <Button
          label="Submit"
          onPress={handleSubmit}
          buttonType="roundButton"
        />
        </View>
    </View>
  );
}

export { PhoneField }; //add the new component here

function createStyles(colours: ColourSet) {
  return StyleSheet.create({
    field: {
      height: 40,
      paddingVertical: 5,
      paddingHorizontal: 10,
      borderStartStartRadius:100,
      
      marginHorizontal: 8,
      borderWidth: 2,
      borderColor: colours.onSurface,
      justifyContent: 'center',
      textAlign: 'center',
    },
  });
}


