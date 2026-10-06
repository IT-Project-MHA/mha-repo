/**
 * My account
 * 
 */
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useTheme, ColourSet } from '../../../../context/ThemeContext';
import ButtonWithIcon from '../../../../components/ButtonWithIcon';
import { Router, useRouter } from 'expo-router';

export default function Screen() {
  const {colours, theme} = useTheme();
  const router = useRouter();
  const styles = createStyles(colours);

  const createWarningAlert = () => 
    Alert.alert(
      'Warning', // Title of the popup
      'Are you sure you want to delete this item?', // Message body
      [
        {
          text: 'Cancel',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel', // iOS styling
        },
        { 
          text: 'OK', 
          onPress: () => console.log('OK Pressed'),
          style: 'destructive' // iOS styling (turns text red)
        },
      ],
      { cancelable: true } // Android only: allows tapping outside to dismiss
    );

  return (
   
    <ScrollView stickyHeaderIndices={[0]}>
      <View style={theme.header}>
        <Text style={[theme.h4, theme.leftText]}>My Account</Text>
      </View>

      <Text> </Text>
      
      <View style={theme.container}>
        <Text style={[theme.h3, theme.leftText]}>About Me </Text>
        <Text> </Text>
        <View style={theme.line}></View>
        <Text> </Text>
        <Text style={[theme.body, theme.leftText]}>Name </Text>
        <Text style={[theme.body, theme.leftText]}>Sex </Text>
        <Text style={[theme.body, theme.leftText]}>Email </Text>
        <Text style={[theme.body, theme.leftText]}>Phone Number </Text>
        <Text> </Text>
        <Text style={[theme.body, theme.rightText]}>Edit details </Text> 
      </View>

      <Text> </Text>
      <Text> </Text>

      <View style={theme.container}>
        <Text style={[theme.h3, theme.leftText]}>My Conditions </Text>
        <Text> </Text>
        <View style={theme.line}></View>
        <Text> </Text>
        <Text style={[theme.h6, theme.leftText]}>Primary Condition </Text>
        <Text style={[theme.body, theme.leftText]}>Osteoperiosis </Text>
        <Text> </Text>
        <Text style={[theme.h6, theme.leftText]}>Other Conditions </Text>
        <Text style={[theme.body, theme.leftText]}>Arthritis </Text>
      </View>
      <Text> </Text>
      <Text> </Text>
      <Text> </Text>

      <View style={[theme.clearContainer, theme.centerItems]}>
      <ButtonWithIcon
	        label="Delete my account"
	        onPress={createWarningAlert}
          buttonType="transparentButton"
          name="trash-bin-outline"
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
