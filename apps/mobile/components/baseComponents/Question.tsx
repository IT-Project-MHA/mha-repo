//what is the shared wrapper:
//heading
// instruction text
import type React from "react";
import { Component, ReactElement, ReactNode } from "react";
import { Text, View, StyleSheet } from "react-native";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";
import ENTRY_COMPONENTS from "../answerFields/EntryRegistry";

class QuestionProps {
  title?: String;
  detail?: String;
  questionType?: String;
}

export default function Question({
  title,
  detail,
  questionType
}: QuestionProps) {
  const EntryComponent = ENTRY_COMPONENTS["EmojiSelect"];
  return (
    <SafeAreaView>
      <Text style={Styles.title}>{title}</Text>
      {/*divider*/}
      <Text style={Styles.detail}>{detail}</Text>
      {EntryComponent ? (
        <EntryComponent onSubmit={() => {}} />
      ) : (
        <Text>not a valid question type: {questionType}</Text>
      )}
    </SafeAreaView>
  );
}

export { Question };

const Styles = StyleSheet.create({
  title: {
    margin: 10,
    fontSize: 30,
    fontWeight: "bold"
  },
  detail: {
    margin: 8,
    fontSize: 15
  }
});
