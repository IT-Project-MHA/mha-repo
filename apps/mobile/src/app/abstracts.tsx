import { Image, Text, View } from "react-native";

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

  title: Text;
  text: Text; //took the names from the design class diagram, think some are vague. Like what does text mean? Also different conception
  instruction: Text;
  subtitle: Text;
  line: Image; //temporary types until I figure out what to put
  box: Image;

  constructor(ttl: Text, txt: Text, inst:Text, subttl:Text, ln:Image, bx:Image){
    this.title= ttl;
    this.text= txt;
    this.instruction= inst;
    this.subtitle= subttl;
    this.line= ln;
    this.box= bx;
  }


  
  
  abstract makeIntoView(): View;
  abstract getWhatever(): string;
  
}
