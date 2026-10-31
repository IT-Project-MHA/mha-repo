import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Checkbox, useTheme as usePaperTheme } from "react-native-paper";
import { useTheme, ColourSet } from "../../context/ThemeContext";
import { Typography } from "../../constants/textSize";
import Button from "../atomicUI/Button";


// the option that opens a text box for the user's own details, when otherAttribute is on
const OTHER_OPTION = "Other";

type MultiSelectAnswer = {
  selected: string[];
  other: string; // default ''
}

type MultiSelectProps ={
  questionOptions: string[];
  onSubmit: (v: string[], other: string) => void;
  headingText: string;
  MIN_SELECTIONS: number;
  MAX_SELECTIONS: number;
  otherAttribute?: boolean; // shows a text box under the "Other" option while it's ticked
  otherAttributeSizeLimit?: number;
}

function MultiSelect({ questionOptions, onSubmit, headingText, MIN_SELECTIONS, MAX_SELECTIONS, 
  otherAttribute = false, otherAttributeSizeLimit = 100 }: MultiSelectProps) {
  const { colours, theme } = useTheme();
  const styles = createStyles(colours, theme);

  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]); // Tracks the currently selected answers
  const [otherText, setOtherText] = useState("");
  // when Continue is pressed with Other ticked and empty answer
  const [otherError, setOtherError] = useState(false); 
  const { colors: paperColours } = usePaperTheme();
  // when Continue is pressed and validation fails
  const [selectionError, setSelectionError] = useState(false); 
  const showOther = otherAttribute && selectedAnswers.includes(OTHER_OPTION);


  function validateMultipleChoice(): boolean {
    //checking if it's something we should accept, i.e. selectedAnswers is between our bounds
    if(selectedAnswers.length < MIN_SELECTIONS) return false;
    if(selectedAnswers.length > MAX_SELECTIONS) return false;

    return true;
  }

  const handleSelect = (answer: string) => {
    if (answer === OTHER_OPTION) setOtherError(false);
    setSelectionError(false);
    // Toggle selection of an answer
    setSelectedAnswers((prev) => {
      if (prev.includes(answer)) return prev.filter((a) => a !== answer);
      return [...prev, answer];
    });
  };

  const handleSubmit = () => {
    if (showOther && otherText.trim() === "") {
      setOtherError(true);
      return;
    }
    if (!validateMultipleChoice()) {
      setSelectionError(true);
      return;
    }
    onSubmit(selectedAnswers, showOther ? otherText.trim() : "");
  };
  return (
    <View style={styles.screen}>
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <View style={[theme.sectionContainer, styles.card]}>
        <View style={styles.cardContent}>
          <Text style={[theme.fontOnBackground, theme.small, {marginBottom: 10, marginLeft: 10}]}>
            Scroll down for more options</Text>
          {!!headingText && <Text style={[styles.heading, styles.label]}>{headingText}</Text>}
          <View style={styles.checkboxList}>
            {questionOptions.map((option, index) => (
              <View key={index}>
              <Checkbox.Item
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
              {option === OTHER_OPTION && showOther && (
                <View style={styles.otherField}>
                  <TextInput
                    style={[styles.input, styles.otherInput]}
                    value={otherText}
                    onChangeText={(text) => {
                      setOtherText(text);
                      setOtherError(false);
                    }}
                    placeholder="Enter other details"
                    placeholderTextColor={colours.onSurface}
                    maxLength={otherAttributeSizeLimit}
                    multiline
                  />
                  <Text style={[theme.small, theme.fontOnSurface, styles.otherCount]}>
                    {otherText.length}/{otherAttributeSizeLimit}
                  </Text>
                </View>
              )}
              {option === OTHER_OPTION && showOther && otherError && (
                <Text style={[theme.small, styles.otherError, { color: paperColours.error }]}>
                  Field cannot be empty, uncheck Other instead
                </Text>
              )}
              </View>
            ))}
          </View>
        </View>
      </View>
    </ScrollView>

    <View style={styles.button}>
      {selectionError && (
        <Text style={[theme.small, theme.centerText, styles.selectionError, 
        { color: paperColours.error, borderColor: paperColours.error }]}>
          Select at least {MIN_SELECTIONS} {MIN_SELECTIONS === 1 ? "option" : "options"}
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

    otherField: {
      marginTop: 8,
      paddingVertical: 5,
      paddingHorizontal: 10,
      borderWidth: 1,
      borderColor: colours.onSurface,
      borderRadius: 15,
    },

    otherInput: {
      minHeight: 40,
    },

    otherCount: {
      textAlign: 'right',
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

    otherError: {
      marginTop: 4,
      marginLeft: 10,
    },

    checkboxItem: {
      backgroundColor: colours.background, // unselected colour
      paddingLeft: 20,
      paddingRight: 15,
      borderRadius: 15,
    },
  });
}

export { MultiSelect, MultiSelectAnswer };
