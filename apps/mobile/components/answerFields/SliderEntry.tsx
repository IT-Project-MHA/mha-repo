//built on NumberEntry and uses community slider

import React, { useState } from "react";
import { Text, View } from "react-native";
import Slider from "@react-native-community/slider";
import { useTheme } from "../../context/ThemeContext";
import Button from "../atomicUI/Button";
import { themes } from "../../constants/theme";


//numberInput variables
const LOWER_BOUND = 0;

function sanitizeNumberInput(text: string) {
  let t = text.replace(/[^0-9]/g, ""); //removes any non-number
  return t;
}

// function validateNumberInput(numText: string, upperBound: number) {
//   //checking if it's something we should accept, i.e. within range
//   if (numText == "") return "enter a number"; //what it prints if submitted
//
//   const num = Number(numText);
//   if (!Number.isInteger(num) || num < LOWER_BOUND || num > upperBound) {
//     return "enter a number between 0 and 10";
//   }
//   return null;
// }


// scoreLabel is what's being scored, shown as 'My <scoreLabel> is <value>'. descriptions holds the
// text shown under the slider for each value, by index
function SliderEntry({ onSubmit, upperBound = 10, scoreLabel = "score", descriptions = [] }: { onSubmit: (v: string) => void; upperBound?: number; scoreLabel?: string; descriptions?: string[] }) {

  const { colours, theme } = useTheme();

  // starts at the lowest score, so it can be submitted without moving the slider
  const [value, setValue] = useState<string>(String(LOWER_BOUND));

  const handleChange = (num: number) => {
    // slider gives a number; convert to string and sanitize/limit
    const text = sanitizeNumberInput(String(Math.round(num)));
    setValue(text);
  };

  const handleSubmit = () => {
    onSubmit(value);
  };

  return (
    <View>
      {/* slider padding */}
      <View style={[theme.sectionContainer, { paddingHorizontal: 40 }]}>
        <Text style={[theme.h6, theme.fontOnSurface, theme.centerText]}>My {scoreLabel} is 
          <Text style={{fontWeight: 'bold'}}> {value}</Text>
        </Text>
        <Slider
          style={[theme.slider, { alignSelf: 'stretch', height: 40 }]}
          minimumValue={LOWER_BOUND}
          maximumValue={upperBound}
          step={1}
          value={Number(value)}
          onValueChange={handleChange}
          minimumTrackTintColor={colours.primary}
          maximumTrackTintColor={colours.tertiary}
          thumbTintColor={colours.primary}
        />
        <Text style={[theme.body, theme.fontOnSurface, theme.centerText, {fontStyle: 'italic'}]}>{descriptions[Number(value)]}</Text>
      </View>
      <View style={{ width: '85%', alignSelf: 'center', marginTop: 20 }}>
        <Button label="Continue" onPress={handleSubmit} buttonType="roundButton" />
      </View>
    </View>
  );
}

export { SliderEntry }; //add the new component here
