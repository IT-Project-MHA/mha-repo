import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTheme as usePaperTheme } from "react-native-paper";
import { useTheme } from "../../context/ThemeContext";
import Button from "../atomicUI/Button";

/**
 * this is like multiple choice but aligned laterally
 * 
 * example use:
 *
 *  <EmojiSelect
 *    questionOptions={["very good", "good", "okay", "low", "very low"]}
 *    onSubmit={(option) => {...}}
 *  />
 */
const EMOJIS = ["😄", "🙂", "😐", "🙁", "😢"];

type EmojiSelectProps = {
  questionOptions: string[];
  onSubmit: (v: string) => void;
  initialValue?: string;
}

function EmojiSelect({ questionOptions, onSubmit, initialValue }: EmojiSelectProps) {
  const { theme } = useTheme();
  const { colors: paperColours } = usePaperTheme();

  const [selectedAnswer, setSelectedAnswer] = useState<string>(initialValue ?? "");
  const [selectionError, setSelectionError] = useState(false);

  const handleSelect = (answer: string) => {
    setSelectionError(false);
    setSelectedAnswer(answer);
  };

  const handleSubmit = () => {
    if (selectedAnswer === "") {
      setSelectionError(true);
      return;
    }
    onSubmit(selectedAnswer);
  };

  return (
    <View>
      <View style={[theme.sectionContainer, { paddingHorizontal: 20 }]}>
        <Text style={[theme.body, theme.fontOnSurface, styles.prompt]}>
          Select the emoji that best describes your mood
        </Text>
        <View style={styles.row}>
          {EMOJIS.map((emoji, index) => {
            const option = questionOptions[index];
            if (option === undefined) return null;
            return (
              <TouchableOpacity
                key={emoji}
                style={[
                  theme.option,
                  styles.emojiOption,
                  selectedAnswer === option && theme.selectedOption,
                ]}
                onPress={() => handleSelect(option)}
                accessibilityRole="radio"
                accessibilityLabel={option}
                accessibilityState={{ selected: selectedAnswer === option }}
              >
                <Text style={styles.emoji}>{emoji}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
        <Text style={[theme.body, theme.fontOnSurface, theme.centerText, styles.label]}>
          {selectedAnswer}
        </Text>
      </View>
      <View style={styles.button}>
        {selectionError && (
          <Text style={[theme.small, theme.centerText, styles.selectionError,
            { color: paperColours.error, borderColor: paperColours.error }]}>
            Please choose an emoji
          </Text>
        )}
        <Button label="Continue" onPress={handleSubmit} buttonType="roundButton" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  prompt: {
    marginBottom: 20,
  },
  row: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },

  emojiOption: {
    paddingHorizontal: 0,
    flex: 1,
  },
  emoji: {
    fontSize: 32,
  },
  label: {
    marginTop: 20,
    fontStyle: "italic",
    minHeight: 24,
  },
  button: {
    width: "85%",
    alignSelf: "center",
    marginTop: 20,
  },
  selectionError: {
    alignSelf: "stretch",
    marginBottom: 10,
    marginHorizontal: 30,
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderRadius: 20,
    overflow: "hidden",
  },
});

export { EmojiSelect };
