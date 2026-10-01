import React from 'react';
import { Text } from 'react-native';
import { useTheme } from '../context/ThemeContext';

type TextType = "textOnPrimary" | "textOnBackground";

type TextProps = {
  label: string;
  textType: TextType;
};

/**
 * Themed text, with styles pulled from theme.
 * 
 * declare like this:
 * 
 * <CustomText label= "About Me" textType="textOnPrimary"/>
 * 
 * @param label string that says what the button should say
 * @param textType string that maps to a text type, defined in theme.ts
 * @returns a styled text component
 */
const CustomText = ({label, textType}: TextProps) => {
  const { theme } = useTheme();

  return (
    <Text style={theme[textType]}>{label}</Text>
  );
};

export default CustomText;
