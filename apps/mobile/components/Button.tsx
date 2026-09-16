import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '../context/ThemeContext';


type ButtonType = "primaryButton" | "secondaryButton" ;

/**
 * defines the required input on button creation
 * 
 * for example (as well as importing button and themeContext files):
 * 
 * <Button
	    label="light mode"
	    onPress={() => setMode('light')}
      buttonType="primaryButton"
    />
 */
type ButtonProps = {
  label: string;
  onPress: () => void;
  buttonType: ButtonType;
};

/**
 * Themed button that changes style based on current theme, and selected
 * button type, of the button types defined in theme.ts
 * 
 * @param label string that says what the button should say
 * @param onPress prescribes an action to the button when pressed
 * @param buttonType string that maps to a button type, defined in theme.ts
 * @returns a styled button component, which performs some funtion when pressed
 */
const Button = ({label, onPress, buttonType}: ButtonProps) => {
  const { theme } = useTheme();

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      style={theme[buttonType]}
      onPress={onPress}
    >
      <Text style={theme.text}>{label}</Text>
    </TouchableOpacity>
  );
};

export default Button;

