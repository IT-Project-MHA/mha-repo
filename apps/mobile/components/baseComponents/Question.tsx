//what is the shared wrapper:
//heading
// instruction text
import type React from "react";
import { Component, ReactElement } from "react";
import { Text, View, StyleSheet } from "react-native";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";

class QuestionProps {
  title?: String;
  detail?: String;
}

export default function Question ({
  title,
  detail}: QuestionProps,{ answerField }: { answerField: () => void }) {

  return (
    <SafeAreaView>
      <Text style={Styles.title}>
        {title}
      </Text>
      // divider
      <Text style={Styles.detail}>
        {detail}
      </Text>
      answerField();
    </SafeAreaView>
  );
}

export { Question };

const Styles = StyleSheet.create({
  title: {
    margin: 10,
    fontSize: 30,
    fontWeight: 'bold',
  },
  detail: {
    margin: 8,
    fontSize: 15,
  }
})