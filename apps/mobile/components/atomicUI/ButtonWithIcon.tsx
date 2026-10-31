/**
 * Button with an icon
 */
import React, { StyleProp, ViewStyle, TextStyle, Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import {Ionicons, IoniconsIconName} from '@react-native-vector-icons/ionicons'

type ButtonType = "primaryButton" | "secondaryButton" | "transparentButton" | "textButton" | "roundButton";

/**
 * defines the required input on button creation
 * 
 * for example (as well as importing button and themeContext files):
 * 
 * <Button
        label="light mode"
        onPress={() => setMode('light')}
        buttonType="roundButton"
        name="alarm"
    />
 */
type ButtonProps = {
  label: string;
  onPress: () => void;
  buttonType: ButtonType;
  name: IoniconsIconName;
  style?: StyleProp<ViewStyle>; // optional, added on top of the button type's style, e.g. for layout
  textStyle?: StyleProp<TextStyle>; // optional, added on top of the label's style, e.g. to centre lines
  disabled?: boolean; // optional, when true the button is dimmed and ignores presses
};

/**
 * Themed button that changes style based on current theme, and selected
 * button type, of the button types defined in theme.ts
 * 
 * @param label string that says what the button should say
 * @param onPress prescribes an action to the button when pressed
 * @param buttonType string that maps to a button type, defined in theme.ts
 * @returns a styled button component, which performs some funtion when pressed, with an icon
 */
const Button = ({label, onPress, buttonType, name, style, textStyle, disabled}: ButtonProps) => {
  const { theme, colours} = useTheme();

  // flatten so we can safely read .color, whatever shape textStyle is
  const flatTextStyle = StyleSheet.flatten(textStyle);
  const iconColour = flatTextStyle?.color ?? colours.onSurface;

  return (

    <TouchableOpacity
      activeOpacity={0.7}
      disabled={disabled}
      style={[theme[buttonType], style, disabled && styles.disabled]}
      onPress={onPress}
    >
    <View style={styles.row}>
      <Text style={[textStyle, theme.body]}>{label}</Text>
        <Ionicons
            name={name}
            size={16}
            color={iconColour as string}  
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
    // dimmed look while the button is disabled
    disabled: {
        opacity: 0.5,
    },
});