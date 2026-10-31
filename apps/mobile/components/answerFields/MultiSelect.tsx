import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Checkbox } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
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
  const insets = useSafeAreaInsets();
  const styles = createStyles(colours, theme, insets.bottom);

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
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      <View style={[theme.sectionContainer, styles.card]}>
        <View style={styles.cardContent}>
          {!!headingText && <Text style={[styles.heading, styles.label]}>{headingText}</Text>}
          <View style={styles.checkboxList}>
            {questionOptions.map((option, index) => (
              <Checkbox.Item
                key={index}
                label={option}
                status={selectedAnswers.includes(option) ? 'checked' : 'unchecked'}
                onPress={() => handleSelect(option)}
                rippleColor="transparent"
                color={colours.onEx3}
                uncheckedColor={colours.onEx3}
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

      <View style={styles.button}>
        <Button
        label= "Continue"
        onPress={handleSubmit}
        buttonType='roundButton'
        />
      </View>
    </ScrollView>
  );
}

function createStyles(colours: ColourSet, text: Typography, bottomInset: number) {
  return StyleSheet.create({
    scroll: {
      flex: 1,
    },

    content: {
      paddingBottom: 0 + bottomInset,
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
      width: '85%',
      alignSelf: 'center',
      marginTop: 10,
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
      backgroundColor: colours.tertiary,
    },

    selectedText: {
      color: colours.onTertiary,
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
