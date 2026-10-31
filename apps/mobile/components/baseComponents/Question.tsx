//what is the shared wrapper:
//heading
// instruction text
import type React from "react";
import { View } from "react-native";
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
  questionOptions?: string[];
}

export default function Question({title, detail, questionType, sliderMax, questionOptions}:  QuestionProps) {
  const { theme } = useTheme();

  const EntryComponent = ENTRY_COMPONENTS[questionType];

  if (!EntryComponent) {
    throw new InvalidQuestionTypeError(questionType + ' is not a valid question type');
  }
  return (
    <SafeAreaView style={{flex: 1}}>
      <View style={[{flexDirection: "column", margin: 15}]}>
        <Text style={[theme.fontOnBackground, theme.h2, theme.leftText]}>{title}</Text>
        <Text style={[theme.fontOnBackground, theme.h6, theme.leftText]}>{detail}</Text>
      </View>
        <EntryComponent
          onSubmit={() => {}}
          upperBound={sliderMax}
          questionOptions={questionOptions ?? []}
          headingText=""
          MIN_SELECTIONS={0}
          MAX_SELECTIONS={questionOptions?.length ?? 0}
        />
    </SafeAreaView>
  );
}

export { Question, QuestionProps};
