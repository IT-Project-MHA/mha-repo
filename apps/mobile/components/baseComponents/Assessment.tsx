import type React from "react";
import { useState } from "react";
import { Text, View, StyleSheet} from "react-native";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";
import { useRouter } from 'expo-router';
import Button from "../atomicUI/Button";
import ButtonWithIcon from '../atomicUI/ButtonWithIcon';
import { Question, QuestionProps } from "../../components/baseComponents/Question";
import {EmptyQuestionArrayError} from "../../src/customErrors/QuestionErrors";
import { useTheme, ColourSet } from '../../context/ThemeContext';


type AssessmentProps = {
  title: String;
  questions: QuestionProps[];
}

export default function Assessment({title, questions}: AssessmentProps) {
  const router = useRouter();

  const { theme } = useTheme();

  const [currIndex, setNumber] = useState(0);

  if (questions == null) {
    throw new EmptyQuestionArrayError("properties.questions is null");
  } else if (questions.length < 1) {
    throw new EmptyQuestionArrayError("properties.questions has length " + questions.length);
  }

  let currQuestion: QuestionProps = questions[currIndex];

  let returnRoute = () => {
    router.navigate('/painTracker');
  }

  return (
    <SafeAreaView>
      <View style={[{flexDirection: "row", alignContent: "flex-start"}]}>
        <ButtonWithIcon
	        label="Back"
	        onPress={() => {
          if (currIndex == 0) {
            returnRoute();
          } else {
            setNumber(currIndex - 1);
          }
          returnRoute}}
          buttonType="secondaryButton"
          name="chevron-back-outline"
        />
      </View>
      <Question title={questions[currIndex].title} 
      detail={questions[currIndex].detail} questionType={questions[currIndex].questionType} />
      <Text style={[theme.fontOnBackground, theme.h6, theme.leftText]}>{'Progress: ' + (currIndex+1) + '/' + questions.length}</Text>
      <View style={[{flexDirection: "row", justifyContent: "space-around"}]}>
        <Button label="Record" onPress={() => {
          if (currIndex >= questions.length-1) {
              // submit assessment
              returnRoute();
            } else {
              setNumber(currIndex + 1);
            }}} buttonType="primaryButton"></Button>
      </View>
    </SafeAreaView>
  )
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
