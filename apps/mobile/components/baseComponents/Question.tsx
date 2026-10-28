//what is the shared wrapper:
//heading
// instruction text
import type React from "react";
import { StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ENTRY_COMPONENTS, { ENTRY_TYPE } from "../answerFields/EntryRegistry";
import { InvalidQuestionTypeError } from "@/customErrors/QuestionErrors";
import { useTheme, ColourSet } from '../../context/ThemeContext';

type QuestionProps = {
  title: String;
  detail: String;
  questionType: ENTRY_TYPE;
  sliderMax?: number;
}

export default function Question({title, detail, questionType}:  QuestionProps) {
  const { theme } = useTheme();

  const EntryComponent = ENTRY_COMPONENTS[questionType];

  if (!EntryComponent) {
    throw new InvalidQuestionTypeError(questionType + ' is not a valid question type');
  }
  return (
    <SafeAreaView>
      <Text style={[theme.fontOnBackground, theme.h2, theme.leftText]}>{title}</Text>
      {/*divider*/}
      <Text style={[theme.fontOnBackground, theme.h6, theme.leftText]}>{detail}</Text>
        <EntryComponent onSubmit={() => {}} />
    </SafeAreaView>
  );
}

export { Question, QuestionProps};
