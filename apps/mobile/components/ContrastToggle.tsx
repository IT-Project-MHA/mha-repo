/**
 * Creates a toggle button using a Switch component
 */
import React, { useState } from 'react';
import { StyleSheet, Switch, View, Text } from 'react-native';
import { useTheme, ColourSet} from '../context/ThemeContext';


const ContrastToggle = () => {
    const {colours, setMode, isDark, isHC} = useTheme();
    const styles = createStyles(colours);

    // isEnabled is true when the switch is off
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
            <Switch
                trackColor={{ false: colours.secondary, true: colours.primary }}
                thumbColor={isEnabled ? colours.tertiary : colours.primary}
                activeThumbColor={colours.tertiary} // this is specific to viewing on the web lol, will come up as error but works
                ios_backgroundColor={colours.tertiary}
                onValueChange={toggleColour}
                value={isEnabled}
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
  },
})};


