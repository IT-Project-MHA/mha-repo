/**
 * My Data page, where users can delete their data, which deletes all their health data making
 * their account a 'support person' account
 * 
 */
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme, ColourSet } from '../../../../context/ThemeContext';
import ButtonWithIcon from '../../../../components/atomicUI/ButtonWithIcon';
import { useState } from 'react';
import ConfirmModal from '../../../../components/atomicUI/ConfirmModal';
import * as WebBrowser from 'expo-web-browser';

export default function Screen() {
  const {theme} = useTheme();

  const PRIVACY_URL = 'https://s2.q4cdn.com/175719177/files/doc_presentations/Placeholder-PDF.pdf';
  const openPrivacy = () => WebBrowser.openBrowserAsync(PRIVACY_URL);
    

  const [pending, setPending] = useState< 'delete' | null>(null);
  
    const handleConfirmations = () => {
      if (pending === 'delete'){
        // API call for deleting data
        // change user type to support person
      } 
      setPending(null);
    };

  return (
   
    <ScrollView stickyHeaderIndices={[0]}>
      <View style={theme.header}>
        <Text style={[theme.h4, theme.leftText, theme.fontOnSurface]}>My Data</Text>
      </View>

      <Text> </Text>
      
      <View style={[theme.sectionContainer, theme.centerItems]}>

      <ButtonWithIcon
	        label="Delete my Data"
	        onPress={() => setPending('delete')}
          buttonType="transparentButton"
          name="trash-bin-outline"
        />

       <View style={theme.line}></View>

      <ButtonWithIcon
	        label="Privacy Policy"
	        onPress={openPrivacy}
          buttonType="transparentButton"
          name="arrow-up-right-box-outline"
        />

      </View>

      <ConfirmModal
        visible={pending === 'delete'}
        title="Are you sure you want to delete your data?"
        message="This will permanently delete your data."
        confirmLabel="Delete"
        cancelLabel='go back'
        onConfirm={handleConfirmations}
        onCancel={() => setPending(null)}
      />


    <View style={theme.bottomGap}/>

    </ScrollView>
  );
}
function createStyles(colours: ColourSet){
    return StyleSheet.create({  
})
};
