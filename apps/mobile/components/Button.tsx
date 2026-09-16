// incl variants
import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '../context/ThemeContext';

type ButtonType = "primaryButton" | "secondaryButton" ;

//defines the shape
type ButtonProps = {
  label: string;
  onPress: () => void;
  buttonType: ButtonType;
};

//uses shape to check passed in props
const PrimaryButton = ({label, onPress, buttonType}: ButtonProps) => {
  const { theme } = useTheme();

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      style={theme[buttonType]} // should be button stype
      onPress={onPress}
    >
      <Text style={theme.text}>{label}</Text>
    </TouchableOpacity>
  );
};


export default PrimaryButton;

