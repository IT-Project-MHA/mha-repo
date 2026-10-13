import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, View, TouchableOpacity } from "react-native";
import { useTheme } from "../../context/ThemeContext";
import Button from "../atomicUI/Button";


type MultiSelectProps ={
  questionOptions: string[];
  onSubmit: (v: string[]) => void;
  MIN_SELECTIONS: number;
  MAX_SELECTIONS: number;
}

function MultiSelect({ questionOptions, onSubmit, MIN_SELECTIONS, MAX_SELECTIONS }: MultiSelectProps) {
  const { theme } = useTheme();

  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]); // Tracks the currently selected answers
  const [userAnswers, setUserAnswers] = useState<{ question: string }[]>([]); // Stores user's answers and correctness



  function validateMultipleChoice(): boolean {
    //checking if it's something we should accept, i.e. selectedAnswers is between our bounds
    if(selectedAnswers.length < MIN_SELECTIONS) return false;
    if(selectedAnswers.length > MAX_SELECTIONS) return false;

    return true;
  }

  const handleSelect = (answer: string) => {
    // Toggle selection of an answer
    setSelectedAnswers((prev) => {
      if (prev.includes(answer)) return prev.filter((a) => a !== answer);
      return [...prev, answer];
    });
  };

  const handleSubmit = () => {
    if(validateMultipleChoice())
      onSubmit(selectedAnswers);
  };
  return (
    <SafeAreaView style={theme.container}>
      <Text style={[theme.text, {textAlign: 'center'}]}>"Select the most relevant options, note the s"</Text>
      {/* render options as buttons */}
      {questionOptions.map((option, index) => (
        <TouchableOpacity
          key={index}
          style={[
            theme.option,
            selectedAnswers.includes(option) && theme.selectedOption, // Highlights selected options
          ]}
          onPress={() => handleSelect(option)}
        >
          <Text style={[
            theme.optionText,
            selectedAnswers.includes(option) && theme.selectedOptionText, // Highlights selected option
          ]}>{option}</Text>
        </TouchableOpacity>
      ))}

      {/* display current selections */}
      <View style={{ marginTop: 10 }}>
        <Text style={theme.text}>Selected: {selectedAnswers.join(", ")}</Text>
      </View>
      <Button
      label= "Continue"
      onPress={handleSubmit}
      buttonType='primaryButton'
      />
    </SafeAreaView>
  );
}

export { MultiSelect }; //add the new component here
