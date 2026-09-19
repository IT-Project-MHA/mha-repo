import { StyleSheet, Text, View, Button } from "react-native";
import { NumberEntry, TextEntry } from "./answers";
import { AnswerField } from "./baseComponents";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
  //testing AnserFields
  const numEntry = new NumberEntry(false, -1);
  const textEntry = new TextEntry(false, -1);
  //(numEntry.makeIntoView(), textEntry.makeIntoView());
  return (
  <SafeAreaProvider>
    <SafeAreaView style={{flexDirection: 'row'}}>
      {numEntry.makeIntoView()}
      {textEntry.makeIntoView()}
    </SafeAreaView>
  </SafeAreaProvider>);

  
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
