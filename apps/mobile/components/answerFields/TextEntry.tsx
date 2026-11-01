import React, { useState } from "react";

import {
  Text,
  TextInput,
  View,
  StyleSheet,
  KeyboardTypeOptions,
  Pressable
} from "react-native";
import Button from "../atomicUI/Button";

import {
  SafeAreaView,
  useSafeAreaInsets
} from "react-native-safe-area-context";
import { lineThickness } from "../../constants/layout";
import { useTheme, ColourSet } from "../../context/ThemeContext";
import { Typography } from "../../constants/textSize";
import TextButton from "../atomicUI/TextWithIconButton";

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
    <View style={styles.container}>
      <TextInput
        style={[theme.h6, styles.field, { color: colours.onSurface }]}
        onChangeText={handleChange}
        value={value}
        placeholder={placeholder} 
        keyboardType={keyboardType}
        textContentType={textContentType}
        maxLength={MAX_LENGTH_TEXT}
        onSubmitEditing={handleSubmit}
      />

      {!!error && (
        <Text style={[theme.body, { color: colours.onSurface }]}>{error}</Text>
      )}

      <Pressable onPress={handleSubmit} style={styles.button}>
        <Text style={[theme.h6, { color: colours.onSurface }]}>Submit</Text>
      </Pressable>
    </View>
  );
}

function createStyles(
  colours: ColourSet,
  text: Typography,
  bottomInset: number
) {
  return StyleSheet.create({
    content: {
      paddingBottom: 100 + bottomInset,
      gap: 40
    },
    field: {
      height: 60,
      paddingVertical: 3,
      width: "80%",
      paddingHorizontal: 40,
      borderRadius: 100,
      borderWidth: 2,
      borderColor: colours.secondary,
      justifyContent: "center",
      textAlign: "center"
    },
    button: {
      height: 60,
      width: "80%",
      alignSelf: "center",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 100,
      backgroundColor: colours.primary
    },
    text: {
      justifyContent: "center",
      textAlign: "center"
    },
    container: {
      width: "100%",
      alignItems: "center",
      gap: 40,
      paddingBottom: 100 + bottomInset
    }
  });
}

export { TextEntry };