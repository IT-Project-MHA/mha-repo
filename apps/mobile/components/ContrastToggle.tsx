import SwitchToggle from "react-native-switch-toggle";
/**
 * Creates a toggle button using a Switch component
 */
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme, ColourSet} from '../context/ThemeContext';


const ContrastToggle = () => {
    const {colours, setMode, isHC, isDark} = useTheme();
    const styles = createStyles(colours);

     const [isEnabled, setIsEnabled] = useState(false);

    /**
     * function that runs when the toggle is pressed
     * Normal constrast -> high contrast
     * @param newValue 
     */
    const toggleColour = (newValue: boolean) => {
        setIsEnabled(newValue);
        if (isEnabled){
            if (isDark){
                setMode('dark');
            }else{
                setMode('light');
            } 
        }
        else{ // when you press the toggle it goes to high contrast
             if (isDark){
                setMode('darkHC');
            }else{
                setMode('lightHC');
            } 
        } 
    };

  return (
    <View style={styles.container}>
            <SwitchToggle
                backgroundColorOn={colours.primary}
                circleColorOff={colours.tertiary}
                circleColorOn={colours.secondary}
                backgroundColorOff={colours.secondary}
                switchOn= {isEnabled}
                onPress={() => [toggleColour(true), isEnabled ? setIsEnabled(false) : setIsEnabled(true)]}
                containerStyle= {styles.buttonContainer}
                circleStyle={styles.circle}
                />
        </View>
  );
}

export default ContrastToggle;

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





