//what is the shared wrapper:
//heading
// instruction text
import type React from "react";
import { View } from "react-native";
import { StyleSheet, Text } from "react-native";
import ENTRY_COMPONENTS, { ENTRY_TYPE } from "../answerFields/EntryRegistry";
import { InvalidQuestionTypeError } from "@/customErrors/QuestionErrors";
import { useTheme, ColourSet } from '../../context/ThemeContext';

type QuestionProps = {
  section: string;
  title: String;
  detail: String;
  questionType: ENTRY_TYPE;
  sliderMax?: number;
  questionOptions?: string[];
}

// include assessment props
type QuestionScreenProps = QuestionProps & {
  onSubmit?: (answer: any) => void;
  progress?: string;
}

export default function Question({section, title, detail, questionType, sliderMax, questionOptions, onSubmit, progress}:  QuestionScreenProps) {
  const { theme } = useTheme();

  const EntryComponent = ENTRY_COMPONENTS[questionType];

  if (!EntryComponent) {
    throw new InvalidQuestionTypeError(questionType + ' is not a valid question type');
  }
  return (
    <View style={{flex: 1}}>
      <View style={[{flexDirection: "column", marginHorizontal: 5, marginVertical: 20}]}>
        <View style={styles.sectionRow}>
          <Text style={[theme.fontOnBackground, theme.h6, theme.leftText, {fontWeight: 'bold'}]}>{section}:</Text>
          {!!progress && <Text style={[theme.fontOnBackground, theme.body, theme.rightText]}>{progress}</Text>}
        </View>
        <Text style={[theme.fontOnBackground, theme.h4, theme.leftText, {marginTop: 10}]}>{title}</Text>
        <Text style={[theme.fontOnBackground, theme.h6, theme.leftText]}>{detail}</Text>
      </View>
        <EntryComponent
          onSubmit={onSubmit ?? (() => {})}
          upperBound={sliderMax}
          questionOptions={questionOptions ?? []}
          headingText=""
          MIN_SELECTIONS={0}
          MAX_SELECTIONS={questionOptions?.length ?? 0}
        />
    </View>
  );
}

const styles = StyleSheet.create({
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});

export { Question, QuestionProps};
