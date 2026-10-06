import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme, ColourSet } from '../../../../context/ThemeContext';
import ThemeToggle from '../../../../components/ThemeToggle'
import TextDropdown from '../../../../components/TextDropdown'
import ContrastToggle from '../../../../components/ContrastToggle';
import Button from '../../../../components/Button';

export default function Tab() {
    const {colours, theme, setMode} = useTheme();
    const styles = createStyles(colours);

  return (
    <ScrollView>
    <Text> </Text>
    <View style={theme.container}>

      <Text> </Text>

      <View style={styles.row}>
        <Button
          label= "Dark Mode"
          onPress={() => {}}
          buttonType= "transparentButton"
        />
        <ThemeToggle />
      </View>

      <Text> </Text>
      <View style={theme.line}/>
      <Text> </Text>
      
      <View style={theme.row}>
        <Text style={[theme.body, theme.leftText]}>High Contrast</Text>
        <ContrastToggle/>
      </View>

      <Text> </Text>
      <View style={theme.line}/>
      <Text> </Text>
     
     <View style={[theme.layoutContainer, theme.rightItems]}>
      <TextDropdown>
      </TextDropdown>
      </View>

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
      leftToggle: {
        width: 4000,
      }
  })
};
