import React, { useState } from "react";

import { Text, TextInput, View, StyleSheet, KeyboardTypeOptions } from "react-native";
import { useTheme as usePaperTheme } from "react-native-paper";
import Button from "../atomicUI/Button";


import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { lineThickness } from '../../constants/layout';
import { useTheme, ColourSet } from '../../context/ThemeContext';
import { Typography } from '../../constants/textSize';

const MAX_LENGTH_TEXT = 200;

type TextProps ={
  onSubmit: (v: string) => void;
  placeholder?: string;
  keyboardType?: KeyboardTypeOptions
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
  initialValue?: string; // the text to start with, e.g. from a saved answer
  maxLength?: number;
  numberOfLines?: number;
  optional?: boolean;
}


function validateTextInput(text: string, maxLength: number, optional: boolean) {
  //checking if it's something we should accept, i.e. within range
  //if (text == "") return "enter text"; //what it prints if submitted
  if(!optional && text.trim()=="") return "Empty entry, please enter some text";
  if (text.length > maxLength) {
    return 'enter no more than '+ maxLength + ' characters';
  }
  return null;
}

function TextEntry({ onSubmit, placeholder = 'Type here', keyboardType = 'default', textContentType, initialValue, maxLength = MAX_LENGTH_TEXT, numberOfLines = 1, optional = false }: TextProps) {
  const { colours, theme } = useTheme();
  const { colors: paperColours } = usePaperTheme();
  const insets = useSafeAreaInsets();
  const styles = createStyles(colours, theme, insets.bottom);

  const [value, setValue] = useState<string>(initialValue ?? "");
  const [error, setError] = useState<string>("");


  const handleChange = (text: string) => {
    if (text.length > maxLength) {
      setValue(text.slice(0, maxLength));
      setError('Enter no more than ' + maxLength + ' characters');
      return;
    }
    setValue(text);
    if (error) setError("");
  };

  const handleSubmit = () => {
    const err = validateTextInput(value, maxLength, optional);
    if (err) {
      setError(err);
      return;
    }
    onSubmit(value.trim()); //also gets rid of trailing white space
  };

  const fieldHeight = numberOfLines * Number(theme.body.lineHeight) + 10;

  return (
    <View>
      <View style={theme.sectionContainer}>
        <TextInput
          style={[styles.input, styles.field, numberOfLines > 1 && { height: fieldHeight, textAlignVertical: 'top' }]}
          onChangeText={handleChange}
          value={value}
          placeholder={placeholder}
          placeholderTextColor={colours.onBackground + '99'}
          keyboardType= {keyboardType}
          textContentType = {textContentType}
          multiline={numberOfLines > 1}
          numberOfLines={numberOfLines}
          onSubmitEditing={handleSubmit}
        />
        <View style={styles.messageRow}>
          <Text style={[theme.small, { color: paperColours.error, flex: 1 }]}>{error}</Text>
          <Text style={[theme.small, theme.fontOnSurface]}>{value.length}/{maxLength}</Text>
        </View>
      </View>
      <View style={{ width: '85%', alignSelf: 'center', marginTop: 25 }}>
        <Button label="Continue" onPress={handleSubmit} buttonType="roundButton" />
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

    messageRow: {
      flexDirection: 'row',
      marginHorizontal: 35,
      marginTop: -10,
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
      color: colours.onBackground,
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



export { TextEntry, TextProps }; //add the new component here

