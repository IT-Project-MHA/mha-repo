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
import type { ReactElement } from "react";
import { Text, View } from "react-native";
import { AnswerField } from "./abstracts";

class numberEntry extends AnswerField{

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