import { View, Text, StyleSheet } from 'react-native';
import { useTheme, ColourSet } from '../../../../context/ThemeContext';
import ThemeToggle from '../../../../components/ThemeToggle'
import TextDropdown from '../../../../components/TextDropdown'
import ButtonWithIcon from '../../../../components/ButtonWithIcon';
import ContrastToggle from '../../../../components/ContrastToggle';

export default function Tab() {
    const {colours, setMode} = useTheme();
    const styles = createStyles(colours);



  return (
    <View>

      <Text> </Text>

      <View style={styles.row}>
      <Text> click to turn on dark mode</Text>
      
      <ThemeToggle 
      />
      </View>

      <Text> </Text>
      <Text> </Text>
      

      <View style={styles.row}>

      <Text> click to turn on high contrast</Text>
      
      <ContrastToggle/>

      </View>

      <Text> </Text>
      <Text> </Text>
     
      <TextDropdown>

      </TextDropdown>

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
