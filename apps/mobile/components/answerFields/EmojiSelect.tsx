import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, View, TouchableOpacity, StyleSheet } from "react-native";
import { useTheme } from "../../context/ThemeContext";
import { ColourSet } from "../../constants/colourScheme"
/**
 * basically straight from here: https://dev.to/davelearns/building-a-basic-quiz-app-with-react-native-and-expo-go-a-complete-guide-11o
 * this is like multiple choice but aligned laterally
 * 
 * example use:
 * 
 *  <EmojiSelect
 *    onSubmit={() => {
 *      enter data function
 *    }
 *  />       
 */


//MultipleChoice variables
const NUM_CHOICES = 5;
const MIN_SELECTIONS = 1;

/**
 * EmojiSelect component that makes the interactable UI.
 *
 * @param onSubmit, a function to get the data to the back-end
 * @returns a styled EmojiSelect component, which performs some funtion when pressed
 */

function EmojiSelect({ onSubmit }: { onSubmit: (v: string) => void }) {
  const { theme } = useTheme();

  const questionOptions = [
    //array of options to be replaced with images later
    "terrible",
    "bad",
    "neutral",
    "good",
    "great",
  ];

  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null); // Tracks the currently selected answer
  const [userAnswer, setUserAnswer] = useState<string | null>(null);

  const handleSelect = (answer: string) => {
    // Called when a user selects an answer
    setSelectedAnswer(answer);
  };

  //no submit button, so never called
  const handleSubmit = () => {
    setUserAnswer(selectedAnswer);
  };

  return (
    <SafeAreaView>
      <View style={theme.container}>
        <Text style={[theme.text, {textAlign: 'center'}]}> "Select the most relevant"</Text>
        
        {/*render options as buttons*/}
        <View style={{flexDirection: "row"}}>
          {questionOptions.map((option, index) => (
            <View style={theme.emojiContainer}>
            <TouchableOpacity
              key={index}
              style={[
                theme.option,
                selectedAnswer === option && theme.selectedOption,
                {/* Highlights selected option*/},
              ]}
              onPress={() => handleSelect(option)}
            >
              <Text style={theme.optionText}>{option}</Text>
            </TouchableOpacity>
            </View>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

export { EmojiSelect };