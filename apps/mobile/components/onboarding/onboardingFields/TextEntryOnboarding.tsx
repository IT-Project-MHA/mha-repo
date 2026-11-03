import React, { useState } from "react";

import {
  Text,
  View,
  StyleSheet,
  KeyboardTypeOptions,
  Pressable,
} from "react-native";

import { useTheme, ColourSet } from "../../../context/ThemeContext";
import { TextInput, HelperText } from "react-native-paper";

//Input variables
const MAX_LENGTH_TEXT = 200;

type TextProps = {
  onSubmit: (v: string) => void;
  placeholder: string;
  keyboardType: KeyboardTypeOptions;
  textContentType?:
    | "none"
    | "URL"
    | "addressCity"
    | "addressCityAndState"
    | "addressState"
    | "countryName"
    | "creditCardNumber"
    | "creditCardExpiration"
    | "creditCardExpirationMonth"
    | "creditCardExpirationYear"
    | "creditCardSecurityCode"
    | "creditCardType"
    | "creditCardName"
    | "creditCardGivenName"
    | "creditCardMiddleName"
    | "creditCardFamilyName"
    | "emailAddress"
    | "familyName"
    | "fullStreetAddress"
    | "givenName"
    | "jobTitle"
    | "location"
    | "middleName"
    | "name"
    | "namePrefix"
    | "nameSuffix"
    | "nickname"
    | "organizationName"
    | "postalCode"
    | "streetAddressLine1"
    | "streetAddressLine2"
    | "sublocality"
    | "telephoneNumber"
    | "username"
    | "password"
    | "newPassword"
    | "oneTimeCode"
    | "birthdate"
    | "birthdateDay"
    | "birthdateMonth"
    | "birthdateYear"
    | "cellularEID"
    | "cellularIMEI"
    | "dateTime"
    | "flightNumber"
    | "shipmentTrackingNumber"
    | undefined;
  //height: number;
};

function validateTextInput(text: string) {
  //checking if it's something we should accept, i.e. within range
  //if (text == "") return "enter text"; //what it prints if submitted
  if (text.trim() == "") return "Please enter your name";
  if (text.length > MAX_LENGTH_TEXT) {
    return "enter no more than " + MAX_LENGTH_TEXT + "characters";
  }
  return null;
}

function TextEntry({
  onSubmit,
  placeholder,
  keyboardType,
  textContentType
}: TextProps) {
  const { colours, theme } = useTheme();
  const styles = createStyles(colours);

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
    <View style={theme.clearContainer}>

      <View style={theme.layoutContainer}>
      <TextInput
          mode="outlined"
          value={value}
          onChangeText={handleChange}
          onSubmitEditing={handleSubmit}
          placeholder={placeholder}
          keyboardType={keyboardType}
          textContentType={textContentType}
          maxLength={MAX_LENGTH_TEXT}
          error={!!error}
          textColor={colours.onSurface}
          outlineColor={colours.secondary}
          activeOutlineColor={colours.primary}
          placeholderTextColor={colours.onSurface}
          outlineStyle={styles.outline}
          style={[styles.field, { fontSize: theme.h6.fontSize }]}
          contentStyle={styles.fieldContent}
        />

      <HelperText type="error" visible={!!error} style={styles.helper}>
          {error}
      </HelperText>
      </View>

      <Pressable onPress={handleSubmit} style={styles.button}>
        <Text style={[theme.h6, styles.buttonText, { color: colours.onPrimary }]}>Submit</Text>
      </Pressable>

    </View>
  );
}

export { TextEntry };

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