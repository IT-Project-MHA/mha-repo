//built on NumberEntry and uses community slider

import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, View } from "react-native";
import Slider from "@react-native-community/slider";
import { useTheme } from "../../context/ThemeContext";
import { themes } from "../../constants/theme";


//numberInput variables
const LOWER_BOUND = 0;

function sanitizeNumberInput(text: string) {
  let t = text.replace(/[^0-9]/g, ""); //removes any non-number
  return t;
}

function validateNumberInput(numText: string, upperBound: number) {
  //checking if it's something we should accept, i.e. within range
  if (numText == "") return "enter a number"; //what it prints if submitted

  const num = Number(numText);
  if (!Number.isInteger(num) || num < LOWER_BOUND || num > upperBound) {
    return "enter a number between 0 and 10";
  }
  return null;
}
const description = [
  "Pain does not impact my mood at all",
  "Pain slightly effects my mood",
  "etc3",
  "etc3",
  "etc3",
  "etc3",
  "etc3",
  "etc3",
  "etc3",
  "etc3",
  "etc3",
];

function SliderEntry({ onSubmit , upperBound }: { onSubmit: (v: string) => void }, upperBound: number) {

  const { theme } = useTheme();

  const [value, setValue] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const handleChange = (num: number) => {
    // slider gives a number; convert to string and sanitize/limit
    const text = sanitizeNumberInput(String(Math.round(num)));
    setValue(text);
    if (error) setError(null);
  };

  const handleSubmit = () => {
    const err = validateNumberInput(value, upperBound);
    if (err) {
      setError(err);
      return;
    }
    onSubmit(value);
  };

  return (
    <SafeAreaView>
      <View style={theme.option}>
        <Text style={[theme.text, {textAlign: 'center'}]}>My score is {value}</Text>
        <Slider
          style={theme.slider}
          minimumValue={LOWER_BOUND}
          maximumValue={upperBound}
          step={1}
          value={value === "" ? LOWER_BOUND : Number(value)}
          onValueChange={handleChange}
          minimumTrackTintColor={theme.primaryButton.backgroundColor}  //should be based on theme
          maximumTrackTintColor={theme.secondaryButton.backgroundColor}  //ditto
          thumbTintColor={theme.primaryButton.backgroundColor}            //ditto
        />
        <Text style={theme.text}>{description[Number(value)]}</Text>
      </View>
    </SafeAreaView>
  );
}

export { SliderEntry }; //add the new component here
