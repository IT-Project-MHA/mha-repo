//what is the shared wrapper:
//heading
// instruction text
import type React from "react";
import { View } from "react-native";
import { StyleSheet, Text } from "react-native";
import ENTRY_COMPONENTS, { ENTRY_TYPE } from "../answerFields/EntryRegistry";
import { InvalidQuestionTypeError } from "@/customErrors/QuestionErrors";
import { useTheme, ColourSet } from '../../context/ThemeContext';
import { MultiSelectAnswer, MultiSelectProps } from "../answerFields/MultiSelect";
import { useTheme as usePaperTheme } from "react-native-paper";

// otherAttribute & otherAttributeSizeLimit are multiselect only, so they're defined there
type QuestionProps = Pick<MultiSelectProps, "otherAttribute" | "otherAttributeSizeLimit"> & {
  answerKey?: string; // attribute as named in backend
  section: string;
  title: String;
  detail: String;
  questionType: ENTRY_TYPE;
  sliderMax?: number;
  numberMax?: number;
  textMax?: number;
  textLines?: number;
  optional?: boolean;
  placeholder?: string;
  // what a slider question scores e.g. 'pain level', shown as 'My pain level is 3'
  sliderLabel?: string;
  // text shown under a slider for each value, by index
  sliderDescriptions?: string[];
  questionOptions?: string[];
  optionScores?: number[]; // score of each questionOptions entry by index
  description?: string;
  minSelections?: number; // multiselect only, given to MultiSelect as MIN_SELECTIONS
  /// extra validation for specific questions
  validate?: (answers: Record<string, any>) => string | null;
}

// include assessment props
type QuestionScreenProps = QuestionProps & {
  onSubmit?: (answer: any) => void;
  progress?: string;
  initialAnswer?: any; // for editing saved answers
  error?: string | null;
}

export default function Question({section, title, detail, questionType, sliderMax, numberMax, textMax, textLines, optional, placeholder, sliderLabel, sliderDescriptions, questionOptions, description, minSelections, otherAttribute, otherAttributeSizeLimit, onSubmit, progress, initialAnswer, error}:  QuestionScreenProps) {
  const { theme, colours } = useTheme();
  const { colors: paperColours } = usePaperTheme();

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
        {!!error && (
          <Text style={[theme.small, theme.centerText, styles.error,
            { color: paperColours.error, borderColor: paperColours.error, backgroundColor: colours.background }]}>
            {error}
          </Text>
        )}
      </View>
        <EntryComponent
          onSubmit={submit}
          upperBound={sliderMax}
          UPPER_BOUND={numberMax}
          maxLength={textMax}
          numberOfLines={textLines}
          optional={optional}
          placeholder={placeholder}
          description={description}
          scoreLabel={sliderLabel}
          descriptions={sliderDescriptions}
          questionOptions={questionOptions ?? []}
          headingText=""
          MIN_SELECTIONS={minSelections ?? 0}
          MAX_SELECTIONS={questionOptions?.length ?? 0}
          otherAttribute={otherAttribute}
          otherAttributeSizeLimit={otherAttributeSizeLimit}
          initialValue={initialAnswer}
          initialSelected={initialAnswer?.selected}
          initialOther={initialAnswer?.other}
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

  error: {
    marginTop: 10,
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderRadius: 15,
    overflow: 'hidden',
  },
});

export { Question, QuestionProps};
