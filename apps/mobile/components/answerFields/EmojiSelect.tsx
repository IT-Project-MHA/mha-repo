//basically straight from here: https://dev.to/davelearns/building-a-basic-quiz-app-with-react-native-and-expo-go-a-complete-guide-11o
//this is like multiple choice but aligned laterally

import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, View, StyleSheet, TouchableOpacity } from "react-native";
import { themes } from "../../constants/theme";

//MultipleChoice variables
const NUM_CHOICES = 5;
const MIN_SELECTIONS = 1;

function validateMultipleChoice(numText: string) {
  //checking if it's something we should accept, i.e. within range
  return null;
}

function EmojiSelect({ onSubmit }: { onSubmit: (v: string) => void }) {
  const options = [
    //array of options to be replaced with images later
    "terrible",
    "bad",
    "neutral",
    "good",
    "great",
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
      {/*render options as buttons*/}
      <View style={{ flexDirection: "row" }}>
        {options.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.option,
              selectedAnswer === option && styles.selectedOption,
              {/* Highlights selected option*/},
            ]}
            onPress={() => handleSelect(option)}
          >
            <Text style={styles.optionText}>{option}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

export { EmojiSelect }; //add the new component here

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
