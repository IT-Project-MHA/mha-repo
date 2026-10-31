import type React from "react";
import { useState } from "react";
import { Text, View, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@react-native-vector-icons/ionicons";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";
import { useRouter } from 'expo-router';
import { Question, QuestionProps } from "../../components/baseComponents/Question";
import {EmptyQuestionArrayError} from "../../src/customErrors/QuestionErrors";
import { useTheme, ColourSet } from '../../context/ThemeContext';

type AssessmentProps = {
  title: String;
  questions: QuestionProps[];
}

export default function Assessment({title, questions}: AssessmentProps) {
  const router = useRouter();

  const { colours, theme } = useTheme();
  const styles = createStyles(colours);

  const [currIndex, setNumber] = useState(0);
  const [answers, setAnswers] = useState<any[]>([]);

  if (questions == null) {
    throw new EmptyQuestionArrayError("properties.questions is null");
  } else if (questions.length < 1) {
    throw new EmptyQuestionArrayError("properties.questions has length " + questions.length);
  }

  let returnRoute = () => {
    router.navigate('/(tabs)/myPain');
  }

  const submitAnswer = (answer: any) => {
    const updated = [...answers];
    updated[currIndex] = answer;
    setAnswers(updated);
    if (currIndex >= questions.length - 1) {
      // submit assessment
      returnRoute();
    } else {
      setNumber(currIndex + 1);
    }
  }

  return (
    <SafeAreaView style={{flex: 1}}>
      <Pressable
        style={styles.backButton}
        onPress={() => {
          if (currIndex == 0) {
            returnRoute();
          } else {
            setNumber(currIndex - 1);
          }
        }}
        accessibilityRole="button"
        hitSlop={8}
      >
        <Ionicons name="arrow-back" size={28} color={colours.onBackground} />
        <Text style={[theme.h6, theme.fontOnBackground]}> Back</Text>
      </Pressable>
      <View style={[{flex: 1}, styles.footer]}>
        <Question key={currIndex} section={questions[currIndex].section} title={questions[currIndex].title}
        detail={questions[currIndex].detail} questionType={questions[currIndex].questionType}
        sliderMax={questions[currIndex].sliderMax} sliderLabel={questions[currIndex].sliderLabel} sliderDescriptions={questions[currIndex].sliderDescriptions} questionOptions={questions[currIndex].questionOptions}
        onSubmit={submitAnswer} progress={'Progress: ' + (currIndex+1) + '/' + questions.length} />
      </View>
    </SafeAreaView>
  )
}

function createStyles(colours: ColourSet) {
  return StyleSheet.create({
    footer: {
      paddingBottom: 83,
    },

    backButton: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start',
      paddingHorizontal: 12,
      paddingVertical: 8,
    },
  });
}

export { Assessment, AssessmentProps };
/**
  abstract class Assessment {
  //The section in which certain questions are grouped within
  /* Contains:
  - A section title
  - A last updated date
  - A completion date
  - An array of Questions
  - A 'set question' function(?), setting question number and title
  - An add question function
  - A complete function - sets the date and sends off question answers to database(?)
  - Date completed
  - A StartQuestions function to begin the assessment.
  - A NextQuestion function to cycle to the next question.
  - A ShowSummary function 
  
  private readonly PLACEHOLDER_DATE = new Date("December 31, 1999");

  private title: Text;
  private lastUpdated: Date;
  private dateCompleted: Date;

  private questions: Question[];


  constructor(setTitle: Text);
  constructor(setTitle: Text, setQuestions?: Question[]) {
    this.title = setTitle;
    this.questions = [];
    if (setQuestions) {
      this.setQuestions(setQuestions);
    } 
    this.lastUpdated = this.PLACEHOLDER_DATE;
    this.dateCompleted = this.PLACEHOLDER_DATE;  
  }

  abstract setQuestions(newQuestions: Question[]): void;
  abstract addQuestion(newQuestion: Question, questionIndex: bigint): void;
  abstract addQuestions(newQuestions: Question[], startIndex: bigint): void;
  
  abstract startQuestions(): void;
  abstract nextQuestion(): void;
  abstract completeAssessment(): void; //Set date in here
  abstract showSummary(): void;
}

 */
