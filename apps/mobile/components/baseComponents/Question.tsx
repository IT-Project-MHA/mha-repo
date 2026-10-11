//what is the shared wrapper:
//heading
// instruction text
import type React from "react";
import { StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ENTRY_COMPONENTS, { ENTRY_TYPE } from "../answerFields/EntryRegistry";
import { InvalidQuestionTypeError } from "@/customErrors/QuestionErrors";
class QuestionProps {
  title?: String;
  detail?: String;
  questionType!: ENTRY_TYPE;
}

export default function Question({qProperties}: {qProperties: QuestionProps}) {
  const EntryComponent = ENTRY_COMPONENTS[qProperties.questionType];
  if (!EntryComponent) {
    throw new InvalidQuestionTypeError(qProperties.questionType + ' is not a valid question type');
  }
  return (
    <SafeAreaView>
      <Text style={Styles.title}>{qProperties.title}</Text>
      {/*divider*/}
      <Text style={Styles.detail}>{qProperties.detail}</Text>
        <EntryComponent onSubmit={() => {}} />
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
