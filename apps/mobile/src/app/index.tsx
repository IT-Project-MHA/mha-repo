import { StyleSheet, Text, View } from "react-native";

export default function Index() {
  return (
    <View style={styles.container}>
      <Text>Edit src/app/index.tsx to edit this screen.</Text>
      <Text>Changes you make will appear after save and reload.</Text>
      <Text>For "Question" I refer to the grey boxes we click through. They each have a heading, page number, record button, and the question itself and enter method.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
