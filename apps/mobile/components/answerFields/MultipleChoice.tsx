//basically straight from here: https://dev.to/davelearns/building-a-basic-quiz-app-with-react-native-and-expo-go-a-complete-guide-11o

import React, { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "../../context/ThemeContext";
import Button from "../atomicUI/Button";



type MultipleChoiceProps ={
  questionOptions: string[];
  onSubmit: (v: string) => void;
}

function MultipleChoice({ questionOptions, onSubmit }: MultipleChoiceProps) {
  const { theme } = useTheme();

  const [selectedAnswer, setSelectedAnswer] = useState<string >(""); // Tracks the currently selected answer

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

      {questionOptions.map((option, index) => (
        <TouchableOpacity
          key={index}
          style={[
            theme.option,
            selectedAnswer.includes(option) && theme.selectedOption, // Highlights selected options
          ]}
          onPress={() => handleSelect(option)}
        >
          <Text style={[
            theme.fontOnBackground,
            selectedAnswer.includes(option) && theme.fontOnSurface, // Highlights selected option
          ]}>{option}</Text>
        </TouchableOpacity>
      ))}

      {/* display current selections */}
      <View style={{ marginTop: 10}}>
        <Text style={theme.fontOnSurface}>Selected: {selectedAnswer}</Text>
      </View>
      <Button
      label= "Continue"
      onPress={handleSubmit}
      buttonType='primaryButton'
      />
    </View>
  );
}
export { MultipleChoice }; //add the new component here
