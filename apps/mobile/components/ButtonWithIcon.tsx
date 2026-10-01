import React from 'react';
import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import {Ionicons, IoniconsIconName} from '@react-native-vector-icons/ionicons'

type ButtonType = "primaryButton" | "secondaryButton" | "settingsButton" | "squareButtonWithLine" | "transparentButton";
type TextType = "textOnPrimary" | "textOnBackground";

/**
 * defines the required input on button creation
 * 
 * for example (as well as importing button and themeContext files):
 * 
 * <Button
        label="light mode"
        onPress={() => setMode('light')}
        buttonType="primaryButton"
        name="alarm"
        colour='pink'
    />
 */
type ButtonProps = {
  label: string;
  onPress: () => void;
  buttonType: ButtonType;
  textType: TextType;
  name: IoniconsIconName;
  colour: string; 
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
const Button = ({label, onPress, buttonType, textType, name, colour}: ButtonProps) => {
  const { theme } = useTheme();

  return (
    
    <TouchableOpacity

      activeOpacity={0.7}
      style={theme[buttonType]}
      onPress={onPress}
    >
    <View style={styles.row}>
      <Text style={theme[textType]}>{label}</Text>

      
        <Ionicons
            name={name}
            size={16}
            color={colour}  
            style={styles.icon}
        />
   
    </View>
    
    </TouchableOpacity>
    
  );
};

export default Button;

const styles = StyleSheet.create({
   row: {
    flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        alignSelf: 'stretch',
    },
    // pins the icon to the right
    icon: {
        position: 'absolute', // absolute detaches it from the text
        right: 0,
    },
});