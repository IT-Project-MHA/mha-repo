import { StyleSheet, Text, View, Button } from "react-native";
import { NumberEntry } from "./answers";
import { AnswerField } from "./abstracts";

export default function Index() {
  //testing AnserFields
  var numEntry = new NumberEntry(false, -1);
  return (numEntry.makeIntoView());

  
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
