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
import AveragePainChart from '../../../../components/graphics/averagePainChart';

export default function Screen() {
  const router = useRouter();
  const { theme, colours } = useTheme();

  return (
    <ScrollView stickyHeaderIndices={[0]}>
      <View style={theme.header}>
        <Text style={[theme.h4, theme.leftText, theme.fontOnSurface]}>My Health</Text>
      </View>

      <Text> </Text>

      <View style={theme.leftItems}>

      <Text style={[theme.h5, theme.fontOnBackground]}>My Pain Summary </Text>
      <Text> </Text>
      <AveragePainChart/>

      <View style={[theme.layoutContainer, theme.centerItems]}>
      <Text style={[theme.xSmall, theme.fontOnBackground]}>See more and print as PDF in My Pain Profile </Text>
      <Text style={[theme.small, theme.fontOnBackground]}> </Text>
      
      <ButtonWithIcon
	        label="My Pain Profile"
	        onPress={() => router.navigate('/myHealth/painProfile')}
          buttonType="roundButton"
          name="chevron-forward-outline"
          fontColour={colours.onTertiary}
        />
      </View>
      </View>

      <Text> </Text>
      <Text> </Text>
      <Text> </Text>

      <View style={[theme.layoutContainer, theme.leftItems]}>
        <Text style={[theme.h5, theme.fontOnBackground]}>My Health Tracking History </Text>
        <Text style={[theme.small, theme.fontOnBackground]}>View your assessment history and generate a graph of your pain over time.</Text>
        <Text> </Text>
        <Text> </Text>
        <Text> </Text>

      <View style={[theme.layoutContainer, theme.centerItems]}>
        <ButtonWithIcon
	        label="My Assessment Records"
	        onPress={() => router.navigate('/myHealth/healthTracking')}
          buttonType="roundButton"
          name="chevron-forward-outline"
          fontColour={colours.onTertiary}
        />
      </View>
      </View>
    
      <Text> </Text>
      <Text> </Text>
      <Text> </Text>

      <View style={[theme.layoutContainer, theme.leftItems]}>
        <Text style={[theme.h5, theme.fontOnBackground]}>My Prescriptions </Text>
        <Text style={[theme.small, theme.fontOnBackground]}>View your active prescriptions and recommended dosages.</Text>
        <Text> </Text>
        <Text> </Text>
        <Text> </Text>

      <View style={[theme.layoutContainer, theme.centerItems]}>
        <ButtonWithIcon
	        label="My Prescriptions"
	        onPress={() => router.navigate('/myHealth/prescriptions')}
          buttonType="roundButton"
          name="chevron-forward-outline"
          fontColour={colours.onTertiary}
        />
      </View>
      </View>
      {/**
       * This page should have a summary chart of pain over months
       */}
      <View style={theme.bottomGap}/>
      <View style={theme.bottomGap}/>

    </ScrollView>

  );
}

function createStyles(colours: ColourSet){
    return StyleSheet.create({
})
};
