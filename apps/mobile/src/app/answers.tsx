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


import {useState} from 'react';
import {SafeAreaView, SafeAreaProvider} from 'react-native-safe-area-context';
import type { ReactElement } from "react";
import { Text, TextInput, View, StyleSheet } from "react-native";
import { AnswerField } from "./abstracts";
//import { } from "";


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
        <TextInput
          style={styles.input}
          onChangeText={this.enterData}
          placeholder="numberInput"
          keyboardType="numeric"
        />
      </View>;
    return view;
  }
}
class TextEntry extends AnswerField{
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
        <TextInput
          style={styles.input}
          onChangeText={this.enterData}
          placeholder="textInput"
          //value={}
        />
      </View>;
    return view;
  }
}
//Xavy will also do text entry, slider

//Josh TODO: multiple choice, multi-select, emoji

export { NumberEntry, TextEntry }; //add the new classes here


const styles = StyleSheet.create({
  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
  },
});