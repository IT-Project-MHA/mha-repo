import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, TextInput, View, StyleSheet, KeyboardTypeOptions } from "react-native";
import Button from "../atomicUI/Button";
import { useTheme } from "../../context/ThemeContext";


//Input variables
const MAX_LENGTH_TEXT = 200;

type TextProps ={
  onSubmit: (v: string) => void;
  placeholder: string;
  keyboardType: KeyboardTypeOptions
  textContentType?:
    | 'none'
    | 'URL'
    | 'addressCity'
    | 'addressCityAndState'
    | 'addressState'
    | 'countryName'
    | 'creditCardNumber'
    | 'creditCardExpiration'
    | 'creditCardExpirationMonth'
    | 'creditCardExpirationYear'
    | 'creditCardSecurityCode'
    | 'creditCardType'
    | 'creditCardName'
    | 'creditCardGivenName'
    | 'creditCardMiddleName'
    | 'creditCardFamilyName'
    | 'emailAddress'
    | 'familyName'
    | 'fullStreetAddress'
    | 'givenName'
    | 'jobTitle'
    | 'location'
    | 'middleName'
    | 'name'
    | 'namePrefix'
    | 'nameSuffix'
    | 'nickname'
    | 'organizationName'
    | 'postalCode'
    | 'streetAddressLine1'
    | 'streetAddressLine2'
    | 'sublocality'
    | 'telephoneNumber'
    | 'username'
    | 'password'
    | 'newPassword'
    | 'oneTimeCode'
    | 'birthdate'
    | 'birthdateDay'
    | 'birthdateMonth'
    | 'birthdateYear'
    | 'cellularEID'
    | 'cellularIMEI'
    | 'dateTime'
    | 'flightNumber'
    | 'shipmentTrackingNumber'
    | undefined;
  //height: number;
}


function validateTextInput(text: string) {
  //checking if it's something we should accept, i.e. within range
  //if (text == "") return "enter text"; //what it prints if submitted
  if(text.trim()=="") return "Empty entry, please enter some text";
  if (text.length > MAX_LENGTH_TEXT) {
    return 'enter no more than '+ MAX_LENGTH_TEXT + 'characters';
  }
  return null;
}

function TextEntry({ onSubmit, placeholder, keyboardType, textContentType }: TextProps) {
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
          placeholder={placeholder}
          keyboardType= {keyboardType}
          textContentType = {textContentType}
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

