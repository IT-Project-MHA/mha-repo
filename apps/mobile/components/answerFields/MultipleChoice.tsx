//basically straight from here: https://dev.to/davelearns/building-a-basic-quiz-app-with-react-native-and-expo-go-a-complete-guide-11o

import React, { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "../../context/ThemeContext";
import Button from "../atomicUI/Button";

//MultipleChoice variables

const MAX_SELECTIONS = 10;

function validateMultipleChoice(numText: string) {
  //checking if it's something we should accept, i.e. within range
  return null;
}

type MultipleChoiceProps ={
  questionOptions: string[];
  onSubmit: (v: string) => void;
}

function MultipleChoice({ questionOptions, onSubmit }: MultipleChoiceProps) {
  const { theme } = useTheme();

  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null); // Tracks the currently selected answer

  const handleSelect = (answer: string) => {
    // Called when a user selects an answer
    setSelectedAnswer(answer);
  };

  const handleSubmit = () => {
    // Save the current answer result
    if(selectedAnswer!=null)
      onSubmit(selectedAnswer);
  };
  return (
    <View style={theme.container}>
      <Text style={[theme.fontOnBackground, {textAlign: 'center'}]}>"Select the most relevant"</Text>
      {/*render options as buttons*/}
      {questionOptions.map((option, index) => (
        <TouchableOpacity
          key={index}
          style={[
            theme.option,
            selectedAnswer === option && theme.selectedOption, // Highlights selected option
          ]}
          onPress={() => handleSelect(option)}
        >
          <Text style={[
            theme.optionText,
            selectedAnswer === option && theme.selectedOptionText, // Highlights selected option
          ]}
          >{option}</Text>
        </TouchableOpacity>
      ))}
      <Button
      label= "Continue"
      onPress={handleSubmit}
      buttonType='primaryButton'
      />
    </View>
  );
}

export { MultipleChoice }; //add the new component here
