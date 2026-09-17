  /*
  Can be: (as in implementations)
  - number entry
  - multiple choice
  - text entry
  - multiselect
  - slider
  - emoji

  All AnswerFields have a view and some function to get data out
  Also a boolean filled / not filled
  And answer type
  */
import type { ReactElement } from "react";
import { Text, View } from "react-native";
import { AnswerField } from "./abstracts";

class NumberEntry extends AnswerField{
  constructor(filled: boolean, data: any){
    super(filled, data);
    this.setAnswerView(this.makeIntoView());
  }
  enterData(){
    //function to enter data
  }

  makeIntoView(): ReactElement<any, any>{
    //returns the view that gets displayed
    var view: ReactElement<any, any>;
    view = <View>
        <Text>"Hello"</Text>
           </View>;
    return view;
  }
  
}
//Xavy will also do text entry, slider

//Josh TODO: multiple choice, multi-select, emoji

export { NumberEntry}; //add the new classes here