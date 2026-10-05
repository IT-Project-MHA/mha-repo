import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, TextInput, View, StyleSheet } from "react-native";
import Button from "../atomicUI/Button";
import { useTheme } from "../../context/ThemeContext";

function onSubmit(v: string){

}


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
  }else if(1){
    return "phone number is too short"
  }
  return null;
}

/**
 * This is a variation of text entry, specifically for phone numbers
 */
function PhoneField() {
  const { theme } = useTheme();

  const [value, setValue] = useState<string>("04");
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
    <SafeAreaView>
      <View>
        <TextInput
          style={[theme.text, theme.option]}
          onChangeText={handleChange}
          value={value}
          keyboardType="numeric"
          maxLength={MAX_lENGTH_NUM}
          textContentType="telephoneNumber"
        />
        <View style={theme.container}>
        {!!error && <Text>{error}</Text>}
        </View>
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

export { PhoneField }; //add the new component here