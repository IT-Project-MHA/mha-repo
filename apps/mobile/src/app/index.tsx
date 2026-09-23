import { StyleSheet, Text } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { EmojiSelect } from "../../components/answerFields/EmojiSelect";
import { MultipleChoice } from "../../components/answerFields/MultipleChoice";
import { MultiSelect } from "../../components/answerFields/MultiSelect";
import { NumberEntry } from "../../components/answerFields/NumberEntry";
import { SliderEntry } from "../../components/answerFields/SliderEntry";
import { TextEntry } from "../../components/answerFields/TextEntry";
import Question from "../../components/baseComponents/Question";
//import {enterData} from ;

export default function Index() {
  //testing AnserFields
  return (
    <SafeAreaProvider>
      <Text>test</Text>

      <SafeAreaView style={{ flexDirection: "row" }}>
        <NumberEntry
          onSubmit={() => {
            /* enter data function */
          }}
        />
        <Question title={"TEMP"} detail={"STRING"} questionType="TextEntry" />
        <TextEntry
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
        <EmojiSelect
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
