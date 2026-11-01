import React, { useState } from "react";
import { Text, View, StyleSheet, TextInput, Pressable} from 'react-native';
import { useTheme, ColourSet } from '../../context/ThemeContext';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

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
  const insets = useSafeAreaInsets();
  const styles = createStyles(colours, insets.bottom);

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
        <View style={styles.container}>
        <TextInput
          style={[styles.field]}
          onChangeText={handleChange}
          value={value}
          keyboardType="numeric"
          maxLength={MAX_lENGTH_NUM}
          textContentType="telephoneNumber"
        />
    
          {!!error && <Text style={[theme.body, {color: colours.onSurface}]}>{error}</Text>}
           <Pressable
                      onPress={handleSubmit}
                      style={styles.button}
                    >
                      <Text style={[theme.h6, {color: colours.onSurface}, styles.text]}>Submit</Text>
                    </Pressable>
      </View>
  );
}

export { PhoneField };

function createStyles(
  colours: ColourSet,
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