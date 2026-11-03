//what is the shared wrapper:
//heading
// instruction text
import type React from "react";
import { View, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { StyleSheet, Text } from "react-native";
import ENTRY_COMPONENTS, { ENTRY_TYPE } from "../answerFields/EntryRegistry";
import { InvalidQuestionTypeError } from "@/customErrors/QuestionErrors";
import { useTheme, ColourSet } from '../../context/ThemeContext';
import { MultiSelectAnswer, MultiSelectProps } from "../answerFields/MultiSelect";
import { MultipleChoiceProps } from "../answerFields/MultipleChoice";
import { NumberProps } from "../answerFields/NumberEntry";
import { TextProps } from "../answerFields/TextEntry";
import { SliderProps } from "../answerFields/SliderEntry";
import { useTheme as usePaperTheme } from "react-native-paper";
import { apiQuestionOptionOrdered } from "@/api/django-API";

type QuestionOption = { id: string; text: string; score: number };

// the active options of a question, in order
async function loadOptions(appSection: string, questionKey: string): Promise<QuestionOption[]> {
  const options = await apiQuestionOptionOrdered('select', {
    app_section: appSection,
    question_key: questionKey,
  });
  return options
    .filter((o: any) => o.is_active)
    .sort((a: any, b: any) => a.option_number - b.option_number)
    .map((o: any) => ({ id: o.id, text: o.text, score: o.score }));
}

// options picked by their text -> their ids, and back
const idsOf = <T extends { id: string; text: string }>(options: T[], selected: string[] = []) =>
  options.filter((option) => selected.includes(option.text)).map((option) => option.id);

const textsOf = <T extends { id: string; text: string }>(options: T[], ids: string[] = []) =>
  options.filter((option) => ids.includes(option.id)).map((option) => option.text);

// the one option picked by its text -> its id, and back
const idOf = <T extends { id: string; text: string }>(options: T[], text?: string) =>
  options.find((option) => option.text === text)?.id ?? null;

const textOf = <T extends { id: string; text: string }>(options: T[], id?: string | null) =>
  options.find((option) => option.id === id)?.text;

type QuestionProps = 
  // answerField-specific props
  Pick<MultiSelectProps, "otherAttribute" | "otherAttributeSizeLimit" | "medication" | "optionDetails"> & 
  Pick<MultipleChoiceProps, "exercise"> &
  Pick<NumberProps, "description"> &
  Pick<TextProps, "placeholder" | "optional" | "maxLength" | "numberOfLines"> &
  Pick<SliderProps, "upperBound" | "scoreLabel" | "descriptions"> &
  Pick<NumberProps, "UPPER_BOUND"> &
  Partial<Pick<MultiSelectProps, "MIN_SELECTIONS">> & {
  scoreFromValue?: boolean;
  answerKey?: string; // attribute as named in backend
  section: string;
  title: String;
  detail: String;
  questionType: ENTRY_TYPE;
  questionOptions?: string[];
  optionScores?: number[]; // score of each questionOptions entry by index
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

export default function Question({section, title, detail, questionType, upperBound, UPPER_BOUND, maxLength, numberOfLines, optional, placeholder, scoreLabel, descriptions, questionOptions, description, MIN_SELECTIONS, otherAttribute, otherAttributeSizeLimit, medication, optionDetails, exercise, onSubmit, progress, initialAnswer, error}:  QuestionScreenProps) {
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
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
      >

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
          upperBound={upperBound}
          UPPER_BOUND={UPPER_BOUND}
          maxLength={maxLength}
          numberOfLines={numberOfLines}
          optional={optional}
          placeholder={placeholder}
          description={description}
          scoreLabel={scoreLabel}
          descriptions={descriptions}
          questionOptions={questionOptions ?? []}
          headingText=""
          MIN_SELECTIONS={MIN_SELECTIONS ?? 0}
          MAX_SELECTIONS={questionOptions?.length ?? 0}
          otherAttribute={otherAttribute}
          otherAttributeSizeLimit={otherAttributeSizeLimit}
          medication={medication}
          optionDetails={optionDetails}
          exercise={exercise}
          initialValue={initialAnswer}
          initialSelected={initialAnswer?.selected}
          initialOther={initialAnswer?.other}
        />
    </View>

    
    </ScrollView>
    </KeyboardAvoidingView>
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

export { Question, QuestionProps, QuestionOption, loadOptions, idsOf, textsOf, idOf, textOf };
