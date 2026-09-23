//built on NumberEntry and uses community slider

import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, View } from "react-native";
import Slider from "@react-native-community/slider";
import { themes } from "../../constants/theme";

//numberInput variables
const LOWER_BOUND = 0;
const UPPER_BOUND = 10;

function sanitizeNumberInput(text: string) {
  let t = text.replace(/[^0-9]/g, ""); //removes any non-number
  return t;
}

function validateNumberInput(numText: string) {
  //checking if it's something we should accept, i.e. within range
  if (numText == "") return "enter a number"; //what it prints if submitted

  const num = Number(numText);
  if (!Number.isInteger(num) || num < LOWER_BOUND || num > UPPER_BOUND) {
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

function SliderEntry({ onSubmit }: { onSubmit: (v: string) => void }) {
  const [value, setValue] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const handleChange = (num: number) => {
    // slider gives a number; convert to string and sanitize/limit
    const text = sanitizeNumberInput(String(Math.round(num)));
    setValue(text);
    if (error) setError(null);
  };

  const handleSubmit = () => {
    const err = validateNumberInput(value);
    if (err) {
      setError(err);
      return;
    }
    onSubmit(value);
  };

  return (
    <SafeAreaView>
      <View>
        <Text>My score is {value}</Text>
        <Slider
          style={{ width: 200, height: 40 }}
          minimumValue={LOWER_BOUND}
          maximumValue={UPPER_BOUND}
          step={1}
          value={value === "" ? LOWER_BOUND : Number(value)}
          onValueChange={handleChange}
          minimumTrackTintColor="#FFFFFF" //should be based on theme
          maximumTrackTintColor="#000000" //ditto
        />
        <Text>{description[Number(value)]}</Text>
      </View>
    </SafeAreaView>
  );
}

export { SliderEntry }; //add the new component here
