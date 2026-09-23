//what is the shared wrapper:
//heading
// instruction text
import type React from "react";
import { StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ENTRY_COMPONENTS, { ENTRY_TYPE } from "../answerFields/EntryRegistry";
class QuestionProps {
  title?: String;
  detail?: String;
  questionType!: ENTRY_TYPE;
}

export default function Question({
  title,
  detail,
  questionType
}: QuestionProps) {
  const EntryComponent = ENTRY_COMPONENTS[questionType];
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

export { Question, QuestionProps};

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
