import type React from "react";
import {
  Image,
  Text,
  TextInput,
  View,
  StyleSheet,
  type TextInputProps,
  type KeyboardTypeOptions,
} from "react-native";

//base components instead of abtracts
interface AnswerFieldProps {
  value?: string;
  onChangeText?: (text: string) => void;
  error?: string;
  keyboardType?: KeyboardTypeOptions;
  placeHolder?: string;
  maxLength?: number;
  autoCorrect?: boolean;
  autoComplete?: TextInputProps["autoComplete"];
  spellCheck?: boolean;
}

//what is the shared wrapper?
export default function AnswerField({
  value,
  onChangeText,
  error, //so we can have feedback on incorrect entry
  keyboardType = "default",
  placeHolder = "",
  maxLength = 50,
  //style,
  autoCorrect = false,
  autoComplete = "off",
  spellCheck = false,
}: AnswerFieldProps) {
  return (
    <View>
      //can add style here
      <TextInput
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        placeholder={placeHolder}
        maxLength={maxLength}
        //style
        autoCorrect={autoCorrect}
        autoComplete={autoComplete}
        spellCheck={spellCheck}
      />
    </View>
  );
}

export { AnswerField };
