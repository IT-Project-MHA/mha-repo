/**
 * My account
 * 
 */
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme, ColourSet } from '../../../../context/ThemeContext';
import ButtonWithIcon from '../../../../components/ButtonWithIcon';
import { useRouter } from 'expo-router';

export default function Screen() {
  const {colours, theme} = useTheme();
  const router = useRouter();
  const styles = createStyles(colours);

  return (
   
    <ScrollView stickyHeaderIndices={[0]}>
      <View style={theme.header}>
        <Text style={[theme.h4, theme.leftText]}>My Data</Text>
      </View>

      <Text> </Text>
      
      <View style={[theme.container, theme.centerItems]}>
      <ButtonWithIcon
	        label="Delete my Data"
	        onPress={() => router.navigate('/settings/myAccount')}
          buttonType="transparentButton"
          name="trash-bin-outline"
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
})
};
