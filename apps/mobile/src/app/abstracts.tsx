import type { ReactElement } from "react";
import { Image, Text } from "react-native";

abstract class AnswerField{
  /*
  Can be: (as in implementations)
  - number entry
  - multiple choice
  - text entry
  - multiselect
  - slider
  - emoticon

  All AnswerFields have a view and some function to get data out
  Also a boolean filled / not filled
  And answer type
  */
  
  private isFilled: boolean;
  private data: any;
  private answerView:  ReactElement<any, any>;
  

  constructor(filled: boolean, data: any){
    this.isFilled = filled; //this is false most of the time, unless returning to the question after filling
    this.answerView = this.makeIntoView();
    this.data;              //incase we return to the question when it had been filled
  }

  abstract enterData(): void; //updates data and isFilled
  abstract makeIntoView():  ReactElement<any, any>;
  
  getData(): any{
    //function returns the data parameter
    if(this.isFilled)
        return this.data;

    return null;
  }

  setData(){}
  setFilled(){}
}


abstract class Question{
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


  abstract makeIntoView():  ReactElement<any, any>;
  abstract getWhatever(): string;
  
}

export { AnswerField, Question };

