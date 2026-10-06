/**
 * My account
 * 
 */
import { View, Text, StyleSheet, ScrollView} from 'react-native';
import { useTheme, ColourSet } from '../../../../context/ThemeContext';
import ButtonWithIcon from '../../../../components/ButtonWithIcon';
import { Router, useRouter } from 'expo-router';

export default function Screen() {
  const {colours, theme} = useTheme();
  const router = useRouter();

  return (
   
    <ScrollView stickyHeaderIndices={[0]}>
      <View style={theme.header}>
        <Text style={[theme.h4, theme.leftText]}>My Connections</Text>
      </View>

      <Text> </Text>
      
      <View style={[theme.container]}>
        <Text style={[theme.h3, theme.leftText]}>My Support People </Text>
        <Text> </Text>
        <View style={theme.line}></View>
        <Text> </Text>

        <View style={[theme.layoutContainer,theme.centerItems]}>
        <ButtonWithIcon
	        label="Jane Doe"
	        onPress={() => router.navigate('/settings/myAccount')}
          buttonType="transparentButton"
          name="chevron-forward-outline"
          colour={colours.onBackground}
        />
        <View style={theme.line}></View>
        <Text> </Text>
        <ButtonWithIcon
	        label="John Smith"
	        onPress={() => router.navigate('/settings/myAccount')}
          buttonType="transparentButton"
          name="chevron-forward-outline"
          colour={colours.onBackground}
        />
        <View style={theme.line}></View>
        <Text> </Text>
        </View>
        
        
        <Text style={[theme.body, theme.rightText]}>Edit details </Text> 
      </View>

      <Text> </Text>
      <Text> </Text>

      <View style={theme.container}>
        <Text style={[theme.h3, theme.leftText]}>I'm Supporting </Text>
        <Text> </Text>
        <View style={theme.line}></View>
        <Text> </Text>
        <View style={[theme.layoutContainer,theme.centerItems]}>
        <ButtonWithIcon
	        label="Jane Doe"
	        onPress={() => router.navigate('/settings/myAccount')}
          buttonType="transparentButton"
          name="chevron-forward-outline"
          colour={colours.onBackground}
        />
        <View style={theme.line}></View>
        <Text> </Text>
        <ButtonWithIcon
	        label="John Smith"
	        onPress={() => router.navigate('/settings/myAccount')}
          buttonType="transparentButton"
          name="chevron-forward-outline"
          colour={colours.onBackground}
        />
        <View style={theme.line}></View>
        <Text> </Text>
        </View>
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
