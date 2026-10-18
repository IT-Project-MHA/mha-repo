/**
 */
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import ButtonWithIcon from '../../../../components/atomicUI/ButtonWithIcon';
import { useRouter } from 'expo-router';
import { useTheme, ColourSet } from '../../../../context/ThemeContext'
import SegmentedControl from '@react-native-segmented-control/segmented-control';
import {useState, useMemo} from 'react';

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

      <SegmentedControl
        values={['Chart', 'History']}
        selectedIndex={index}
        onChange={(event) => setIndex(event.nativeEvent.selectedSegmentIndex)}
        style={styles.segmentedControl}
        tintColor={colours.ex3}
       />

       {index === 0 ? <ChartPage/> : <RecordPage /> }

    </ScrollView>

  );
}

function ChartPage(){
  const { theme,colours } = useTheme();

  return (
    <View>
      <Text>  </Text>
    
      <View style={[theme.sectionContainer]}>

      <Text>  </Text>

      <Text style={[theme.layoutContainer,theme.centerText]}> Chart </Text>

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
        backgroundColor: colours.tertiary,
        borderRadius: 8,
        width: '95%',
        alignSelf: 'center',
      }
})
};