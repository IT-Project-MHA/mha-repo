import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

type ButtonType = "textButton";


/**
 * defines the required input on button creation
 * 
 * for example (as well as importing button and themeContext files):
 * 
 * <Button
        label="light mode"
        onPress={() => setMode('light')}
    />
 */
type ButtonProps = {
  label: string;
  onPress: () => void;
};

/**
 * 
 * @param label string that says what the button should say
 * @param onPress prescribes an action to the button when pressed
 * @returns  button that is styled to look like plain text
 */
const TextButton = ({label, onPress}: ButtonProps) => {
  const { theme } = useTheme();

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      style={theme['textButton']}
      onPress={onPress}
    >
    <Text style={[theme.body, theme.fontOnSurface, theme.fontUnderlined]}>{label}</Text>
    
    </TouchableOpacity>
  );
};

export default TextButton;

