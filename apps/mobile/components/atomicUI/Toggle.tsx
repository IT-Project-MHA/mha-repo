/**
 * Creates a toggle button using a Switch component
 */
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme, ColourSet} from '../../context/ThemeContext';
import SwitchToggle from "react-native-switch-toggle";

type ToggleProps = {
  onToggle: () => void;
  switchOn: boolean;
};

const Toggle = ({onToggle, switchOn}: ToggleProps)  => {
    const {colours} = useTheme();
    const styles = createStyles(colours);

  return (
    <View style={styles.container}>
            <SwitchToggle
                backgroundColorOn={colours.primary}
                circleColorOn={colours.tertiary}

                circleColorOff={colours.primary}
                backgroundColorOff={colours.secondary}

                switchOn= {switchOn}
                onPress={onToggle}
                containerStyle= {styles.buttonContainer}
                circleStyle={styles.circle}
            />
        </View>
  );
}

export default Toggle;

function createStyles(colours: ColourSet){
    return StyleSheet.create({
        container: {
            alignItems: 'center',
            flexDirection: 'row',
            justifyContent: 'space-between',
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


