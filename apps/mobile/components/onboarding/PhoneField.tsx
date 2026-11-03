import React, { useState } from "react";
import {
  Text,
  View,
  StyleSheet,
  KeyboardTypeOptions,
  Pressable,
} from "react-native";
import { useTheme, ColourSet } from '../../context/ThemeContext';
import { TextInput, HelperText } from "react-native-paper";

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
  const styles = createStyles(colours);

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
          <View style={theme.clearContainer}>
      
            <View style={theme.layoutContainer}></View>

        <TextInput
          mode="outlined"
          value={value}
          onChangeText={handleChange}
          onSubmitEditing={handleSubmit}
          keyboardType="number-pad"
          textContentType="telephoneNumber"
          maxLength={MAX_lENGTH_NUM}
          error={!!error}
          textColor={colours.onSurface}
          outlineColor={colours.secondary}
          activeOutlineColor={colours.primary}
          outlineStyle={styles.outline}
          style={[styles.field, { fontSize: theme.h6.fontSize }]}
          contentStyle={styles.fieldContent}
        />
  
        <HelperText type="error" visible={!!error} style={styles.helper}>
          {error}
        </HelperText>

           <Pressable
                      onPress={handleSubmit}
                      style={styles.button}
                    >
                      <Text style={[theme.h6, styles.buttonText, {color: colours.onSurface}]}>Submit</Text>
                    </Pressable>
      </View>
  );
}

export { PhoneField };

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