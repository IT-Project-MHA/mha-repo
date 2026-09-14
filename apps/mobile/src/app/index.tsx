import { StyleSheet, Text, View, Button } from "react-native";

export default function Index() {
  return (
    <View style={styles.container}>
      <Text>Edit src/app/index.tsx to edit this screen.</Text>
      <Text>Changes you make will appear after save and reload.</Text>
      <Text>For "Question" I refer to the grey boxes we click through. They each have a heading, page number, record button, and the question itself and enter method.</Text>
      <Button 
        title = "press" 
        onPress={() => console.log("button pressed")} //logs show up in the browser console. So strl shift J or your equivalent
        color="purple"
      />
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
