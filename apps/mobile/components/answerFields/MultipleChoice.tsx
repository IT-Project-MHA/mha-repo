import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { RadioButton, useTheme as usePaperTheme } from "react-native-paper";
import { useTheme, ColourSet } from "../../context/ThemeContext";
import { Typography } from "../../constants/textSize";
import Button from "../atomicUI/Button";

// fewest options that need the "Scroll down for more options" hint
const SCROLL_HINT_MIN_OPTIONS = 6;

export type MultipleChoiceProps ={
  questionOptions: string[];
  onSubmit: (v: string) => void;
  initialValue?: string;
  exercise?: boolean; // show extra text for the exercise option
}

function MultipleChoice({ questionOptions, onSubmit, initialValue, exercise = false }: MultipleChoiceProps) {
  const { colours, theme } = useTheme();
  const styles = createStyles(colours, theme);
  const { colors: paperColours } = usePaperTheme();

  const [selectedAnswer, setSelectedAnswer] = useState<string >(initialValue ?? "");
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
    <View style={styles.screen}>
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      <View style={[theme.sectionContainer, styles.card]}>
        <View style={styles.cardContent}>
          {exercise && (
            <Text style={[theme.fontOnSurface, theme.body, {marginBottom: 10, marginLeft: 10}]}>
              Examples: walking, stretching, strengthening, yoga, resistance band work, or balance exercises.</Text>
          )}
          {questionOptions.length >= SCROLL_HINT_MIN_OPTIONS && (
            <Text style={[theme.fontOnBackground, theme.small, {marginBottom: 10, marginLeft: 10}]}>
              Scroll down for more options</Text>
          )}
          <View style={styles.radioList}>
            {questionOptions.map((option, index) => (
              <RadioButton.Item
                key={index}
                label={option}
                value={option}
                status={selectedAnswer === option ? 'checked' : 'unchecked'}
                onPress={() => handleSelect(option)}
                rippleColor="transparent"
                color={colours.ex2}
                uncheckedColor={colours.ex2}
                labelStyle={[styles.input, selectedAnswer === option && styles.selectedText]}
                style={[
                  styles.radioItem,
                  selectedAnswer === option && styles.selectedOption,
                ]}
              />
            ))}
          </View>
        </View>
      </View>
    </ScrollView>

    <View style={styles.button}>
      {selectionError && (
        <Text style={[theme.small, theme.centerText, styles.selectionError,
        { color: paperColours.error, borderColor: paperColours.error }]}>
          Please select 1 option
        </Text>
      )}
      <Button
      label= "Continue"
      onPress={handleSubmit}
      buttonType='roundButton'
      />
    </View>
    </View>
  );
}

function createStyles(colours: ColourSet, text: Typography) {
  return StyleSheet.create({
    screen: {
      flex: 1,
    },

    scroll: {
      flex: 1,
    },

    content: {
      paddingBottom: 80,
      gap: 19,
    },

    card: {
      gap: 12,
    },

    cardContent: {
      paddingHorizontal: '5%',
      paddingBottom: 5,
    },

    button: {
      position: 'absolute',
      bottom: 10,
      width: '90%',
      alignSelf: 'center',
    },

    selectionError: {
      alignSelf: 'stretch',
      marginBottom: 10,
      marginHorizontal: 30,
      paddingVertical: 4,
      paddingHorizontal: 12,
      borderWidth: 1,
      borderRadius: 20,
      backgroundColor: colours.background,
      overflow: 'hidden',
    },

    input: {
      ...text.body,
      color: colours.onSurface,
      marginRight: 14,
    },

    radioList: {
      marginVertical: 5,
      marginHorizontal: 3,
      gap: 10,
    },

    selectedOption: {
      backgroundColor: colours.secondary,
    },

    selectedText: {
      color: colours.onSecondary,
    },

    radioItem: {
      backgroundColor: colours.background,
      paddingLeft: 20,
      paddingRight: 15,
      borderRadius: 15,
    },
  });
}

export { MultipleChoice };
