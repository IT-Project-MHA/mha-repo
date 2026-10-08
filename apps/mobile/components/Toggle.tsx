/**
 * Creates a toggle button using a Switch component
 */
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme, ColourSet} from '../context/ThemeContext';
import SwitchToggle from "react-native-switch-toggle";

const ThemeToggle = () => {
    const {colours, setMode, isHC, isDark} = useTheme();
    const styles = createStyles(colours);

    // function that runs when the toggle is pressed
    // changes between light and dark mode
    const toggleColour = () => {
            if (isDark){
                setMode(!isHC ? 'light' : 'lightHC');
            }else{
                setMode(!isHC ? 'dark' : 'darkHC');
            } 
    };

  return (
    <View style={styles.container}>
            <SwitchToggle
                circleColorOn={colours.secondary}
                backgroundColorOn={colours.primary}
                circleColorOff={colours.tertiary}
                backgroundColorOff={colours.secondary}
                switchOn= {isDark}
                onPress={toggleColour}
                containerStyle= {styles.buttonContainer}
                circleStyle={styles.circle}
            />
        </View>
  );
}

export default ThemeToggle;

function createStyles(colours: ColourSet){
    return StyleSheet.create({
        container: {
            alignItems: 'center',
            flexDirection: 'row',
            justifyContent: 'space-between',
            paddingHorizontal: 20,
        },
        buttonContainer: {
            marginTop: 8,
            width: 50,
            height: 28,
            borderRadius: 25,
            padding: 5,
        },
        circle: {
            width: 20,
            height: 20,    
            borderRadius: 20,
        }
})};


