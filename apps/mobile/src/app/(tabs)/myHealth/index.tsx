/**
 * 'Patients' and 'Both' users can access this screen (exclusive support people can not)
 * 
 * My Heath index should include:
 *  - My Records
 *      – includes: chart & history section
 *      – chart: graph where you can select time periods and it shows scores
 *      – history: select based on time frame
 *  – My Prescriptions
 *  – My Pain Profile
 */
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import ButtonWithIcon from '../../../../components/atomicUI/ButtonWithIcon';
import { useRouter } from 'expo-router';
import { useTheme, ColourSet } from '../../../../context/ThemeContext';

export default function Screen() {
  const router = useRouter();
  const { theme } = useTheme();

  return (
    <ScrollView stickyHeaderIndices={[0]}>
      <View style={theme.header}>
        <Text style={[theme.h4, theme.leftText, theme.fontOnSurface]}>My Health</Text>
      </View>

      <View style={[theme.sectionContainer, theme.centerItems]}>
      <ButtonWithIcon
	        label="My Assessment Records"
	        onPress={() => router.navigate('/myHealth/healthTracking')}
          buttonType="transparentButton"
          name="chevron-forward-outline"
        />
      
      <View style={theme.line}/>
    
      <ButtonWithIcon
	        label="My Pain Profile"
	        onPress={() => router.navigate('/myHealth/painProfile')}
          buttonType="transparentButton"
          name="chevron-forward-outline"
        />

      <View style={theme.line}/>
      
      <ButtonWithIcon
	        label="My Prescriptions"
	        onPress={() => router.navigate('/myHealth/prescriptions')}
          buttonType="transparentButton"
          name="chevron-forward-outline"
        />

      </View>
      {/**
       * This page should have a summary chart of pain over months
       */}


    </ScrollView>

  );
}

function createStyles(colours: ColourSet){
    return StyleSheet.create({
})
};
