import { View, Text, StyleSheet } from 'react-native';
import { useTheme, ColourSet } from '../../../../context/ThemeContext';
import { Router, useRouter } from 'expo-router';
import ButtonWithIcon from '../../../../components/ButtonWithIcon';
import { Stack } from 'expo-router';
import Button from '../../../../components/Button';
import ToggleButton from '../../../../components/ToggleButton'
import ThemeToggle from '../../../../components/ThemeToggle'
import { lightColours } from '../../../../constants/colourScheme';



export default function Tab() {
    const router = useRouter();
    const {colours} = useTheme();
    const styles = createStyles(colours);
    const {setMode} = useTheme();

  return (
    <View>
      <Button
	    label="light mode"
	    onPress={() => setMode('light')}
      buttonType="primaryButton"
      textType='textOnPrimary'
      />
      <Text> </Text>
      
      <View style={styles.row}>
      <Button
	    label="dark mode"
	    onPress={() => setMode('dark')}
      buttonType="primaryButton"
      textType='textOnPrimary'
      />
 
      <ThemeToggle>
      </ThemeToggle>

    </View>

    </View>
  );
}

function createStyles(colours: ColourSet){
    return StyleSheet.create({
      
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colours.surface,
    paddingBlock: 30, //lit
    alignSelf: 'center',
    width: '85%', // of page

    borderRadius: 28,
    borderTopWidth: 0,     
    borderBottomWidth: 0, 
 
    overflow: 'hidden',

    shadowColor: colours.tertiary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 4,
  },

  line: {
    height: 3,
    backgroundColor: colours.onBackground,
    width: '89%',
    borderRadius: 300,
    //marginHorizontal: 20,
  },
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
})
};
