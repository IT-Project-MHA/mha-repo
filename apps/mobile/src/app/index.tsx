import { StyleSheet, Text, View, Button } from "react-native";
import { NumberEntry } from "../../components/answerFields/NumberEntry";
import { TextEntry } from "../../components/answerFields/TextEntry";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
// @ts-ignore: module resolution issue in editor—runtime import works
import { SliderEntry } from "../../components/answerFields/SliderEntry";
import { MultipleChoice } from "../../components/answerFields/MultipleChoice";
import { MultiSelect } from "../../components/answerFields/MultiSelect";
import { EmojiSelect } from "../../components/answerFields/EmojiSelect";
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
    justifyContent: "center",
  },
});
