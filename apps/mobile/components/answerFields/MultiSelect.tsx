import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, View, TouchableOpacity } from "react-native";
import { useTheme } from "../../context/ThemeContext";

//MultipleChoice variables
const NUM_CHOICES = 6;
const MIN_SELECTIONS = 1;
const MAX_SELECTIONS = 10;
const MAX_LENGTH_NUM = String(MAX_SELECTIONS).length;

function validateMultipleChoice(numText: string) {
  //checking if it's something we should accept, i.e. within range
  return null;
}

function MultiSelect({ onSubmit }: { onSubmit: (v: string) => void }) {
  const { theme } = useTheme();
  const options = [
    //array of options
    "London",
    "Berlin",
    "123",
    "9892164932@",
  ];

  const [currentQuestion, setCurrentQuestion] = useState(0); // Tracks the current question index
  const [score, setScore] = useState(0); // Tracks the user's score
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]); // Tracks the currently selected answers
  const [userAnswers, setUserAnswers] = useState<{ question: string }[]>([]); // Stores user's answers and correctness

  const handleSelect = (answer: string) => {
    // Toggle selection of an answer
    setSelectedAnswers((prev) => {
      if (prev.includes(answer)) return prev.filter((a) => a !== answer);
      return [...prev, answer];
    });
  };

  const handleSubmit = () => {
  };
  return (
    <SafeAreaView style={theme.container}>
      <Text style={[theme.text, {textAlign: 'center'}]}>"Select the most relevant options, note the s"</Text>
      {/* render options as buttons */}
      {options.map((option, index) => (
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
    </SafeAreaView>
  );
}

export { MultiSelect }; //add the new component here
