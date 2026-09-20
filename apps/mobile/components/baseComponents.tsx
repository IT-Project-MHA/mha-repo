import type React from "react";
import { Image, Text, TextInput, View, StyleSheet, type TextInputProps, type KeyboardTypeOptions } from "react-native";

//base components instead of abtracts
interface AnswerFieldProps {
  value?: string;
  onChangeText?: (text: string) => void;
  error?: string;
  keyboardType?: KeyboardTypeOptions;
  placeHolder?: string;
  maxLength?: number;
  autoCorrect?: boolean;
  autoComplete?: TextInputProps['autoComplete'];
  spellCheck?: boolean;
}
//  basically this means AnswerField is a React component now- a react function.
//  you basically can't abstract in react. How we do it is define the shared component seperately and call it. The functions are allowed to float in space outside any classes.
//  we basically shouldn't use classes
export default function AnswerField({
  value,
  onChangeText,
  error,  //so we can have feedback on incorrect entry
  keyboardType = 'default',
  placeHolder = '',
  maxLength = 50,
  //style,
  autoCorrect=false,
  autoComplete="off",
  spellCheck=false,
}: AnswerFieldProps) {
  return (
    <View>//can add style here
      <TextInput
        value = {value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        placeholder={placeHolder}
        maxLength = {maxLength}
        //style
        autoCorrect={autoCorrect}
        autoComplete={autoComplete}
        spellCheck={spellCheck}
      />

    </View>
  );
}


class Question{
  //refers to the boxed in section of a question.
  /*has:
  - A title, as in the name of the assessment
  - A box with rounded corners around the entire question except title
  - A heading string e.g "mood" or "relationship with others"
  - A line between heading and question text.
  - regular text of question "Over the past week, blah blah"
  - An answer field (could be a text bos, slider, clickable list, multi-selectable clickable list)
  - question number indicator (4/7)
  - Record button
  */

  private title: Text;
  private text: Text; //took the names from the design class diagram, think some are vague. Like what does text mean? Also different conception
  private instruction: Text;
  private subtitle: Text;
  private line: Image; //temporary types until I figure out what to put
  private box: Image;
  //record: Button;
  //answerField: AnswerField;
  private questionView:  ReactElement<any, any>

  constructor(ttl: Text, txt: Text, inst:Text, subttl:Text, ln:Image, bx:Image){
    this.title= ttl;
    this.text= txt;
    this.instruction= inst;
    this.subtitle= subttl;
    this.line= ln;
    this.box= bx;
    this.questionView = this.makeIntoView();
    //this.record = record in Amelia's custom button
    //answerField = implementation of the abstract class
  }


  makeIntoView():  ReactElement<any, any>{
    return (<View></View>);
  }
  getWhatever(): string{
    return "";
  }
  
}

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
  */
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

export { AnswerField, Question, Assessment };

