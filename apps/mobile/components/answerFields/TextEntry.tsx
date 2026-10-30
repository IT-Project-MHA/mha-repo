import React, { useState } from "react";

import { Text, TextInput, View, StyleSheet, KeyboardTypeOptions } from "react-native";
import Button from "../atomicUI/Button";


import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { lineThickness } from '../../constants/layout';
import { useTheme, ColourSet } from '../../context/ThemeContext';
import { Typography } from '../../constants/textSize';

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
  const { colours, theme } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = createStyles(colours, theme, insets.bottom);

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
    onSubmit(value.trim()); // gets rid of trailing white space
  };

  return (
      <View style={[theme.clearContainer, styles.content, {padding: 40}]}>
        <TextInput
          style={[theme.h6, styles.field]}
          onChangeText={handleChange}
          value={value}
          placeholder={placeholder}
          keyboardType= {keyboardType}
          textContentType = {textContentType}
          maxLength={MAX_LENGTH_TEXT}
          onSubmitEditing={handleSubmit}
        />
        <View style={theme.centerItems}>
          {!!error && <Text style={[theme.body, {color: colours.onSurface}]}>{error}</Text>}
          <Button
            label="Submit"
            onPress={handleSubmit}
            buttonType="roundButton"
          />
        </View>
      </View>
  );
}



function createStyles(colours: ColourSet, text: Typography, bottomInset: number) {
  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colours.background,
    },
    content: {
      paddingBottom: 100 + bottomInset,
      gap: 40,
    },
    title: {
      marginBottom: -19,
    },
    card: {
      gap: 12,
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
    bottomBar: {
      position: 'absolute',
      left: '7.5%',
      width: '85%',
      bottom: 30+bottomInset,
      gap: 8,
    },
  });
}



export { TextEntry }; //add the new component here

