//basically straight from here: https://dev.to/davelearns/building-a-basic-quiz-app-with-react-native-and-expo-go-a-complete-guide-11o

import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, TouchableOpacity } from "react-native";
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

function MultipleChoice({ onSubmit }: { onSubmit: (v: string) => void }) {
  const { theme } = useTheme();

  const questionOptions = [
    //array of options
    "London",
    "Berlin",
    "123",
    "9892164932@",
  ];

  const [currentQuestion, setCurrentQuestion] = useState(0); // Tracks the current question index
  const [score, setScore] = useState(0); // Tracks the user's score
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null); // Tracks the currently selected answer
  const [userAnswers, setUserAnswers] = useState<
    { question: string; correct: boolean }[]
  >([]); // Stores user's answers and correctness

  const handleSelect = (answer: string) => {
    // Called when a user selects an answer
    setSelectedAnswer(answer);
  };

  const handleSubmit = () => {
    // Checks if the selected answer is correct
    const isCorrect = selectedAnswer === questionOptions[currentQuestion];

    // Save the current answer result
    setUserAnswers([
      ...userAnswers,
      {
        question: questionOptions[currentQuestion],
        correct: isCorrect,
      },
    ]);

    // Update score if answer is correct
    if (isCorrect) {
      setScore(score + 1);
    }

    // Reset selected answer for the next question
    setSelectedAnswer(null);

    if (currentQuestion < questionOptions.length - 1) {
      // Move to the next question
      setCurrentQuestion(currentQuestion + 1);
    } else {
    }
  };
  return (
    <SafeAreaView style={theme.container}>
      <Text style={[theme.text, {textAlign: 'center'}]}>"Select the most relevant"</Text>
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
    </SafeAreaView>
  );
}

export { MultipleChoice }; //add the new component here
