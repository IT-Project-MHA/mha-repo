import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme, ColourSet } from '../../../../context/ThemeContext';
import ThemeToggle from '../../../../components/ThemeToggle'
import TextDropdown from '../../../../components/TextDropdown'
import ContrastToggle from '../../../../components/ContrastToggle';

export default function Tab() {
    const {colours, theme} = useTheme();
    const styles = createStyles(colours);

  return (
    <ScrollView>
    <Text> </Text>
    <View style={theme.container}>

      <Text> </Text>

      <View style={styles.row}>
        <Text style={[theme.body, theme.leftText]}>Dark Mode</Text>
        <ThemeToggle/>
      </View>

      <Text> </Text>
      <View style={theme.line}/>
      <Text> </Text>
      
      <View style={styles.row}>
        <Text style={[theme.body, theme.leftText]}>High Contrast</Text>
        <ContrastToggle/> 
      </View>

      <Text> </Text>
      <View style={theme.line}/>
      <Text> </Text>
     
      <TextDropdown>

      </TextDropdown>

    </View>
    </ScrollView>
  );
}

function createStyles(colours: ColourSet){
    return StyleSheet.create({
      row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        alignSelf: 'stretch',
      },
  })
};
