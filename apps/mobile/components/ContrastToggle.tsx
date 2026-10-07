import SwitchToggle from "react-native-switch-toggle";
/**
 * Creates a toggle button using a Switch component
 */
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme, ColourSet} from '../context/ThemeContext';


const ContrastToggle = () => {
    const {colours, setMode, isHC, isDark} = useTheme();
    const styles = createStyles(colours);

    /**
     * function that runs when the toggle is pressed
     * Normal constrast -> high contrast
     */
    const toggleContrast = () => {
            if (isDark){
                setMode(!isHC ? 'darkHC' : 'dark');
            }else{
                setMode(!isHC ? 'lightHC' : 'light');
            } 
    };


  return (
    <View style={styles.container}>
            <SwitchToggle
                backgroundColorOn={colours.primary}
                circleColorOff={colours.tertiary}
                circleColorOn={colours.secondary}
                backgroundColorOff={colours.secondary}
                switchOn= {isHC}
                onPress={toggleContrast}
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





