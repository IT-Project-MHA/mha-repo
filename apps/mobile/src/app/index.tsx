import { StyleSheet, Text, View, Button } from "react-native";
import { NumberEntry } from "../../components/answerFields/NumberEntry";
import { TextEntry } from "../../components/answerFields/TextEntry";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

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
      </SafeAreaView>
      <SafeAreaView style={{ flexDirection: "row" }}>
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
    justifyContent: "center",
  },
});
