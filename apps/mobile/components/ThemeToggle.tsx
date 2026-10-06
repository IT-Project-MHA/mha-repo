import SwitchToggle from "react-native-switch-toggle";
/**
 * Creates a toggle button using a Switch component
 */
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme, ColourSet} from '../context/ThemeContext';


const ThemeToggle = () => {
    const {colours, setMode, isHC, isDark} = useTheme();
    const styles = createStyles(colours);

     const [isEnabled, setIsEnabled] = useState(false);

    // function that runs when the toggle is pressed
    // changed between light and dark mode
    const toggleColour = (newValue: boolean) => {
        if (isDark){
            if (isHC){
                setMode('lightHC');
            }else{
                setMode('light');
            }
        }
        else{
            if (isHC){
                setMode('darkHC');
            }else{
                setMode('dark');
            }
        } 
    };

  return (
    <View style={styles.container}>
            <SwitchToggle
                circleColorOn={colours.secondary}
                backgroundColorOn={colours.primary}
                circleColorOff={colours.tertiary}
                backgroundColorOff={colours.secondary}
                switchOn= {isEnabled}
                onPress={() => [toggleColour(true), isEnabled ? setIsEnabled(false) : setIsEnabled(true)]}
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
            paddingHorizontal: 30,
        },
        buttonContainer: {
            marginTop: 8,
            width: 58,
            height: 29,
            borderRadius: 25,
            padding: 5,
        },
        circle: {
            width: 25,
            height: 25,    
            borderRadius: 20,
        }
})};


