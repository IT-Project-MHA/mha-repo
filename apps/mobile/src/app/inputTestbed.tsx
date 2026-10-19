import { StyleSheet, Text } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { EmojiSelect } from "../../components/answerFields/EmojiSelect";
import { MultipleChoice } from "../../components/answerFields/MultipleChoice";
import { MultiSelect } from "../../components/answerFields/MultiSelect";
import { NumberEntry } from "../../components/answerFields/NumberEntry";
import { SliderEntry } from "../../components/answerFields/SliderEntry";
import { TextEntry } from "../../components/answerFields/TextEntry";
import { Question, QuestionProps } from "../../components/baseComponents/Question";
import { Assessment, AssessmentProps } from "../../components/baseComponents/Assessment";

import { useTheme } from "../../context/ThemeContext";

export default function Index() {
  const { theme } = useTheme();

  let propsA: QuestionProps = new QuestionProps;
  propsA.title="QuestionA title:)";
  propsA.detail="Select an answer...";
  propsA.questionType="MultipleChoice";
  let propsB: QuestionProps = new QuestionProps;
  propsB.title="QuestionB title:)";
  propsB.detail="type an answer...";
  propsB.questionType="NumberEntry";
  let propsC: QuestionProps = new QuestionProps;
  propsC.title="QuestionC title:)";
  propsC.detail="Slide an answer...";
  propsC.questionType="SliderEntry";
  let someProps: QuestionProps[] = new Array<QuestionProps>;
  someProps.push(propsA);
  someProps.push(propsB);
  someProps.push(propsC);
  let assessmentP: AssessmentProps = new AssessmentProps;
  assessmentP.title="Testssessment";
  assessmentP.questions = someProps;
  assessmentP.firstIndex = 0;

  //testing AnserFields
  return (
    <SafeAreaProvider style={theme.screen}>
      <Text>test</Text>

      <SafeAreaView style={{ flexDirection: "row" }}>
        <Assessment properties={assessmentP}/>
        <NumberEntry
          onSubmit={() => {
            /* enter data function */
          }}
        />
        <SliderEntry
          onSubmit={() => {
            /* enter data function */
          }}
        />
        <MultipleChoice
          onSubmit={() => {
            /* enter data function */
          }}
        />
        <MultiSelect
          onSubmit={() => {
            /* enter data function */
          }}
        />
      </SafeAreaView>
      <SafeAreaView style={{ flexDirection: "row" }}>

        <EmojiSelect
          onSubmit={() => {
            /* enter data function */
          }}
        />
        <TextEntry
          onSubmit={() => {
            /* enter data function */
          }}
        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  }
});
