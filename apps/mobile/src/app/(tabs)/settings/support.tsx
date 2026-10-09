/**
 * Support page, providing MHA contact details
 */
import { View, Text, ScrollView } from 'react-native';
import { useTheme } from '../../../../context/ThemeContext';

export default function Tab() {
    const {theme} = useTheme();

  return (
    //header
    <ScrollView stickyHeaderIndices={[0]}>
      <View style={theme.header}>
        <Text style={[theme.h4, theme.leftText, theme.fontOnBackground]}>Support</Text>
      </View>

      <Text> </Text>
    
    <View style={theme.clearContainer}>

    <Text style={[theme.body,theme.leftText, theme.fontOnBackground]}>Contact us at: </Text>
    <Text> </Text>
    <Text style={[theme.body,theme.centerText, theme.fontOnBackground]}>info@muscha.org</Text>

  <Text> </Text>
    <View style={theme.line}>
    </View>

    </View>

    <View style={theme.clearContainer}>

    <Text style={[theme.body,theme.leftText, theme.fontOnBackground]}>B.A.M Helpline: </Text>
    <Text style={theme.xSmall}> </Text>
    <Text style={[theme.xSmall,theme.leftText, theme.fontOnBackground]}>Call the team Monday to Friday 9am – 9pm or email helpline@muscha.org </Text>
    <Text> </Text>
    <Text style={[theme.body,theme.centerText, theme.fontOnBackground]}>1800 263 265</Text>
    <Text> </Text>

    <View style={theme.line}>
    
    </View>
    </View>

    <View style={theme.bottomGap}/>

    </ScrollView>
  );
}