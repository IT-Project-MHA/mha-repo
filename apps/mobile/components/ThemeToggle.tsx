/**
 * Creates a toggle button using a Switch component
 */
import React, { useState } from 'react';
import { StyleSheet, Switch, View, Text } from 'react-native';
import { useTheme, ColourSet} from '../context/ThemeContext';


export default function App() {
    const {colours, setMode} = useTheme();
    const styles = createStyles(colours);

    // isEnabled is true when the switch is off
    const [isEnabled, setIsEnabled] = useState(false);

    // function that runs when the toggle is pressed
    const toggleSwitch = (newValue: boolean) => {
        setIsEnabled(newValue);
        if (isEnabled){
            setMode('light');
        }else{
            setMode('dark');
        } 
    };

  return (
    <View style={styles.container}>
            <Switch
                trackColor={{ false: colours.secondary, true: colours.primary }}
                thumbColor={isEnabled ? colours.tertiary : colours.primary}
                activeThumbColor={colours.tertiary} // this is specific to viewing on the web lol, will come up as error but works
                ios_backgroundColor={colours.tertiary}
                onValueChange={toggleSwitch}
                value={isEnabled}
            />
        </View>
  );
}

function createStyles(colours: ColourSet){
    return StyleSheet.create({
  container: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
})};


