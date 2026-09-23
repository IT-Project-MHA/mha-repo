import type React from "react";
import { Text, View, StyleSheet, Button, } from "react-native";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";
import { Question, QuestionProps } from "../../components/baseComponents/Question";


class AssessmentProps {
  title?: String;
  questions!: QuestionProps[];
  currIndex!: number
}

export default function Assessment({ properties }: {properties: AssessmentProps}) {
  return (
    <SafeAreaView>
      <Button title="<- Back"></Button>
      <Question qProperties={properties.questions[properties.currIndex]} />
      <Text>{properties.currIndex+1}/{properties.questions.length}</Text>
      <Button  onPress={() => {
        properties.currIndex += 1;
          if (properties.currIndex >= properties.questions.length) {
            // do something
          }}} 
          title="Record">
      </Button>
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
