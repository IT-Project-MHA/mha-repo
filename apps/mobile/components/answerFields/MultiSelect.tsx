import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Checkbox } from "react-native-paper";
import { useTheme, ColourSet } from "../../context/ThemeContext";
import { Typography } from "../../constants/textSize";
import Button from "../atomicUI/Button";


type MultiSelectProps ={
  questionOptions: string[];
  onSubmit: (v: string[]) => void;
  headingText: string;
  MIN_SELECTIONS: number;
  MAX_SELECTIONS: number;
}

function MultiSelect({ questionOptions, onSubmit, headingText, MIN_SELECTIONS, MAX_SELECTIONS }: MultiSelectProps) {
  const { colours, theme } = useTheme();
  const styles = createStyles(colours, theme);

  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]); // Tracks the currently selected answers


  function validateMultipleChoice(): boolean {
    //checking if it's something we should accept, i.e. selectedAnswers is between our bounds
    if(selectedAnswers.length < MIN_SELECTIONS) return false;
    if(selectedAnswers.length > MAX_SELECTIONS) return false;

    return true;
  }

  const handleSelect = (answer: string) => {
    // Toggle selection of an answer
    setSelectedAnswers((prev) => {
      if (prev.includes(answer)) return prev.filter((a) => a !== answer);
      return [...prev, answer];
    });
  };

  const handleSubmit = () => {
    if(validateMultipleChoice())
      onSubmit(selectedAnswers);
  };
  return (
    <View style={styles.screen}>
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      <View style={[theme.sectionContainer, styles.card]}>
        <View style={styles.cardContent}>
          <Text style={[theme.fontOnBackground, theme.small, {marginBottom: 10, marginLeft: 10}]}>
            Scroll down for more options</Text>
          {!!headingText && <Text style={[styles.heading, styles.label]}>{headingText}</Text>}
          <View style={styles.checkboxList}>
            {questionOptions.map((option, index) => (
              <Checkbox.Item
                key={index}
                label={option}
                status={selectedAnswers.includes(option) ? 'checked' : 'unchecked'}
                onPress={() => handleSelect(option)}
                rippleColor="transparent"
                color={colours.ex2}
                uncheckedColor={colours.ex2}
                labelStyle={[styles.input, selectedAnswers.includes(option) && styles.selectedText]}
                style={[
                  styles.checkboxItem,
                  selectedAnswers.includes(option) && styles.selectedOption,
                ]}
              />
            ))}
          </View>
        </View>
      </View>
    </ScrollView>

    <View style={styles.button}>
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
      // room for the last options to scroll up clear of the floating button
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

    heading: {
      ...text.h6,
      color: colours.onSurface,
      paddingHorizontal: '5%',
    },

    label: {
      marginTop: 5,
      marginBottom: 19,
    },

    button: {
      position: 'absolute',
      bottom: 10,
      width: '90%',
      alignSelf: 'center',
    },

    input: {
      ...text.body,
      color: colours.onSurface,
    },

    checkboxList: {
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

    checkboxItem: {
      backgroundColor: colours.background, // unselected colour
      paddingLeft: 20,
      paddingRight: 15,
      borderRadius: 15,
    },
  });
}

export { MultiSelect };
