/**
 * 'Patients' and 'Both' users can access this screen (exclusive support people can not)
 */
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme, ColourSet } from '../../../../context/ThemeContext';
import ButtonWithIcon from '../../../../components/ButtonWithIcon';


export default function Tab() {
    const {colours, theme} = useTheme();
    const styles = createStyles(colours);

  /**
   * <Text style = {styles.body}> if made bigger, body should be updated automatically via context
   */
  return (
    <ScrollView stickyHeaderIndices={[0]}>
      <View style={theme.header}>
        <Text style={[theme.h4, theme.leftText]}>Support</Text>
      </View>

      <Text> </Text>
      
    <View style={theme.clearContainer}>

    <Text style={[theme.body,theme.leftText]}>Contact us at: </Text>
    <Text> </Text>
    <Text style={[theme.body,theme.centerText]}>info@muscha.org</Text>

  <Text> </Text>
    <View style={theme.line}>
    </View>

    </View>


    <View style={theme.clearContainer}>

    <Text style={[theme.body,theme.leftText]}>B.A.M Helpline: </Text>
    <Text style={theme.xSmall}> </Text>
    <Text style={[theme.xSmall,theme.leftText]}>Call the team Monday to Friday 9am – 9pm or email helpline@muscha.org </Text>
    <Text> </Text>
    <Text style={[theme.body,theme.centerText]}>1800 263 265</Text>
    <Text> </Text>

    <View style={theme.line}>
    
    </View>
    </View>

    <View style={theme.bottomGap}/>

    </ScrollView>
  );
}

function createStyles(colours: ColourSet){
    return StyleSheet.create({

})
};

