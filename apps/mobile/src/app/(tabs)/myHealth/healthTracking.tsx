import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme, ColourSet } from '../../../../context/ThemeContext'
import {useState} from 'react';
import AssessmentChart from '../../../../components/graphics/AssessmentChart';
import SegmentedPill from '../../../../components/atomicUI/SegmentedControlPill';

export default function Screen() {
  const router = useRouter();
  const { theme,colours } = useTheme();
  const styles = createStyles(colours);
  const [index, setIndex]= useState(0);

  return (
    <ScrollView stickyHeaderIndices={[0]}>
      <View style={theme.header}>
        <Text style={[theme.h4, theme.leftText, theme.fontOnSurface]}>My Assessment Records</Text>
      </View>

      <SegmentedPill
        values={['Chart', 'History']}
        selectedIndex={index}
        onChange={setIndex}
        radius={50}
        style={styles.segmentedControl}
        />

       {index === 0 ? <ChartPage/> : <RecordPage /> }

    </ScrollView>

  );
}

function ChartPage(){
  const { theme } = useTheme();

  return (
    <View>
      <View style={[theme.layoutContainer]}>
        <AssessmentChart/>
        <View style={theme.bottomGap}/>
      </View>
    </View>
  );
}

function RecordPage(){
  const { theme,colours } = useTheme();

  return (
    <View>
      <Text>  </Text>
    
      <View style={[theme.sectionContainer]}>

      <Text>  </Text>

      <Text style={[theme.layoutContainer,theme.centerText]}> History </Text>

      </View>
    </View>
  );
}

function createStyles(colours: ColourSet){
    return StyleSheet.create({
      segmentedControl: {
        width: '92%',
        alignSelf: 'center',
      }
})
};