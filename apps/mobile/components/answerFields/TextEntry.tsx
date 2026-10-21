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
    onSubmit(value.trim()); //also gets rid of trailing white space
  };

  return (
      <View style={[theme.sectionContainer, styles.content]}>
        <TextInput
          style={[styles.field, theme.option]}
          onChangeText={handleChange}
          value={value}
          placeholder={placeholder}
          keyboardType= {keyboardType}
          textContentType = {textContentType}
          maxLength={MAX_LENGTH_TEXT}
          onSubmitEditing={handleSubmit}
        />
        <View style={styles.bottomBar}>
          {!!error && <Text style={styles.subheading}>{error}</Text>}
          <Button
            label="submit"
            onPress={handleSubmit}
            buttonType="primaryButton"
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
      bottom: 30+bottomInset,
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



export { TextEntry }; //add the new component here

