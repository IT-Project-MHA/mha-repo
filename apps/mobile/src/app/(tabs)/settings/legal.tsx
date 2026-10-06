/**
 * My account
 * 
 */
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme, ColourSet } from '../../../../context/ThemeContext';
import ButtonWithIcon from '../../../../components/ButtonWithIcon';
import { useRouter } from 'expo-router';
import Pdf from 'react-native-pdf'


export default function Screen() {
  const {colours, theme} = useTheme();
  const router = useRouter();
  const styles = createStyles(colours);



  /**
   *   const localFilePath = {uri: 'bundle-assets://samplePDF.pdf' };
   * 
   * const source = { 
    uri: localFilePath, 
    cache: false 


    <Pdf
        source={source}
        style={styles.pdf}
      />
      
  };
   */
  
  return (
    <ScrollView stickyHeaderIndices={[0]}>
      <View style={theme.header}>
        <Text style={[theme.h4, theme.leftText]}>Legal</Text>
      </View>

      <Text> </Text>

      <View style={[theme.container, theme.centerItems]}>
      <ButtonWithIcon
	        label="Terms of service"
	        onPress={() => {}}
          buttonType="transparentButton"
          name="arrow-up-right-box-outline"
          colour={colours.onBackground}
        />
        <View style={theme.line}></View>
      </View>

      <Text> </Text>
      <Text> </Text>

      <View style={[theme.container, theme.centerItems]}>
      <ButtonWithIcon
	        label="Privacy Policy"
	        onPress={() => router.navigate('/settings/myAccount')}
          buttonType="transparentButton"
          name="arrow-up-right-box-outline"
          colour={colours.onBackground}
        />
        <View style={theme.line}></View>
      </View>

      <View style={styles.floatingContainer}>
        
    </View>

    <View style={theme.bottomGap}/>

    </ScrollView>
  );
}
function createStyles(colours: ColourSet){
    return StyleSheet.create({  
      floatingContainer: {
        position: 'absolute', // Forces the view to float
        bottom: 30,           // Distance from bottom of the screen
        right: 30,            // Distance from right side of the screen
        zIndex: 999,          // Ensures it sits on top of other elements
  },
  pdf: {
        flex:1,
    }
})
};

