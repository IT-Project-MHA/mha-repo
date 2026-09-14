// incl variants
import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '../context/ThemeContext';

//defines the shape
type ButtonProps = {
  label: string;
  onPress: () => void;
};

//uses shape to check passed in props
const Button = ({ label, onPress}: ButtonProps) => {
  const { theme } = useTheme();
  // const {buttonType} = 
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      style={theme.primaryButton} // should be theme.buttonType
      onPress={onPress}
    >
      <Text style={theme.text}>{label}</Text>
    </TouchableOpacity>
  );
};

export default Button;