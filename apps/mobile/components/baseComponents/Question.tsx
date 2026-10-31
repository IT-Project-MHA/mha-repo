//what is the shared wrapper:
//heading
// instruction text
import type React from "react";
import { View } from "react-native";
import { StyleSheet, Text } from "react-native";
import ENTRY_COMPONENTS, { ENTRY_TYPE } from "../answerFields/EntryRegistry";
import { InvalidQuestionTypeError } from "@/customErrors/QuestionErrors";
import { useTheme, ColourSet } from '../../context/ThemeContext';
import { MultiSelectAnswer } from "../answerFields/MultiSelect";

type QuestionProps = {
  section: string;
  title: String;
  detail: String;
  questionType: ENTRY_TYPE;
  sliderMax?: number;
  // what a slider question scores e.g. 'pain level', shown as 'My pain level is 3'
  sliderLabel?: string;
  // text shown under a slider for each value, by index
  sliderDescriptions?: string[];
  questionOptions?: string[];
  minSelections?: number; // multiselect only
  otherAttribute?: boolean; // multiselect only
  otherAttributeSizeLimit?: number; // multiselect only
}

// include assessment props
type QuestionScreenProps = QuestionProps & {
  onSubmit?: (answer: any) => void;
  progress?: string;
}

export default function Question({section, title, detail, questionType, sliderMax, sliderLabel, sliderDescriptions, questionOptions, minSelections, otherAttribute, otherAttributeSizeLimit, onSubmit, progress}:  QuestionScreenProps) {
  const { theme } = useTheme();

  const EntryComponent = ENTRY_COMPONENTS[questionType];

  if (!EntryComponent) {
    throw new InvalidQuestionTypeError(questionType + ' is not a valid question type');
  }

  const submit = (value: any, other?: string) => {
    if (!onSubmit) return;
    if (questionType === "MultiSelect") {
      const answer: MultiSelectAnswer = { selected: value, other: other ?? "" };
      onSubmit(answer);
    } else {
      onSubmit(value);
    }
  };
  return (
    <View style={{flex: 1}}>
      <View style={[{flexDirection: "column", marginHorizontal: 5, marginVertical: 20}]}>
        <View style={styles.sectionRow}>
          <Text style={[theme.fontOnBackground, theme.h6, theme.leftText, {fontWeight: 'bold'}]}>{section}</Text>
          {!!progress && <Text style={[theme.fontOnBackground, theme.body, theme.rightText]}>{progress}</Text>}
        </View>
        <Text style={[theme.fontOnBackground, theme.h4, theme.leftText, {marginTop: 10}]}>{title}</Text>
        <Text style={[theme.fontOnBackground, theme.h6, theme.leftText]}>{detail}</Text>
      </View>
        <EntryComponent
          onSubmit={submit}
          upperBound={sliderMax}
          scoreLabel={sliderLabel}
          descriptions={sliderDescriptions}
          questionOptions={questionOptions ?? []}
          headingText=""
          MIN_SELECTIONS={minSelections ?? 0}
          MAX_SELECTIONS={questionOptions?.length ?? 0}
          otherAttribute={otherAttribute}
          otherAttributeSizeLimit={otherAttributeSizeLimit}
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
