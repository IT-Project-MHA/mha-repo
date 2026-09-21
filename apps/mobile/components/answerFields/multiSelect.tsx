import React, { useState } from "react";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";
import type { ReactElement } from "react";
import {
  Text,
  TextInput,
  View,
  StyleSheet,
  Button,
  TouchableOpacity,
} from "react-native";
import { AnswerField } from "../baseComponents/AnswerField";
//import { } from "";

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
  const options = [
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
    const isCorrect = selectedAnswer === options[currentQuestion];

    // Save the current answer result
    setUserAnswers([
      ...userAnswers,
      {
        question: options[currentQuestion],
        correct: isCorrect,
      },
    ]);

    // Update score if answer is correct
    if (isCorrect) {
      setScore(score + 1);
    }

    // Reset selected answer for the next question
    setSelectedAnswer(null);

    if (currentQuestion < options.length - 1) {
      // Move to the next question
      setCurrentQuestion(currentQuestion + 1);
    } else {
    }
  };
  return (
    <SafeAreaView style={styles.container}>
      <Text>"Select the most relevant"</Text>
      //render options as buttons
      {options.map((option, index) => (
        <TouchableOpacity
          key={index}
          style={[
            styles.option,
            selectedAnswer === option && styles.selectedOption, // Highlights selected option
          ]}
          onPress={() => handleSelect(option)}
        >
          <Text style={styles.optionText}>{option}</Text>
        </TouchableOpacity>
      ))}
    </SafeAreaView>
  );
}

export { MultiSelect }; //add the new component here

//this is temporary, it should be in the central theme we have.
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  option: {
    backgroundColor: "#f0f0f0",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  selectedOption: {
    backgroundColor: "#d4e6ff",
    borderWidth: 1,
    borderColor: "#3498db",
  },
  optionText: {
    fontSize: 18,
  },
});
