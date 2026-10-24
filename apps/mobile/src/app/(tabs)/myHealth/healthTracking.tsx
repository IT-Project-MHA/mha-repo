/**
 */
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import ButtonWithIcon from '../../../../components/atomicUI/ButtonWithIcon';
import { useRouter } from 'expo-router';
import { useTheme, ColourSet } from '../../../../context/ThemeContext'
import SegmentedControl from '@react-native-segmented-control/segmented-control';
import {useState, useMemo, useEffect} from 'react';
import {apiAssessment} from '@/api/django-API';
import {ownPatientProfileId} from '@/api/care_planner_api_helpers';

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
  const styles = createStyles(colours);

  // all assessment weeks that the user has made
  const [weeks, setWeeks] = useState<string[]>([]);
  // currently expanded week
  const [openWeek, setOpenWeek] = useState<string | null>(null);

  useEffect(() => { (async() => { 
    try{
      const profileId = await ownPatientProfileId();
      if (!profileId) return;
      const assessments = await apiAssessment('select', {patient_profile:profileId});
      const sorted = assessments.map((a: any)=>a.week_starting as string)
        .sort((a:string, b:string) => b.localeCompare(a)); // newest first
      setWeeks(sorted);
    } catch (e: any) {console.log('failed to load assessment weeks', e?.message);}
  })(); }, []);

  return (
    <View style={{ paddingTop: 20 }}>
      <View style={[theme.sectionContainer]}>

        {weeks.length === 0 ?(
          <Text style={[theme.small, theme.centerText, theme.fontOnSurface]}>
            No assessment records yet</Text>
            ):(
              weeks.map((week, i) => {
                const isOpen = openWeek === week;
                const showYearHeading = i===0 || week.slice(0,4) !== weeks[i-1].slice(0,4);
                return (
                  <View key={week}>
                    {showYearHeading? <Text style={[theme.h4, theme.fontOnSurface, 
                      styles.yearHeading]}>{week.slice(0,4)}</Text>
                      : i>0 && <View style={theme.line}/>}
                    <View style={styles.weekToggle}>
                      <Pressable onPress={() => setOpenWeek(isOpen? null:week)}
                        style={styles.weekToggleHeader}>
                        <Text style={[theme.small, styles.weekToggleText]}>{weekRangeLabel(week)}</Text>
                        <Text style={[theme.small, styles.weekToggleText]}>{isOpen ? '▲' : '▼'}</Text>
                      </Pressable>

                      {isOpen && (
                        <View style={styles.weekToggleContent}>
                          <Text style={[theme.small, theme.fontOnSurface]}>open</Text>
                        </View>
                      )}
                    </View>
                  </View>
                )}
              )
            )
          }
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
      },
      
      weekToggle: {
        width: '90%',
        alignSelf: 'center',
        marginTop: 10,
        paddingBottom: 5
      },

      weekToggleHeader: {
        flexDirection: 'row', 
        justifyContent: 'space-between',
        alignItems: 'center',
        minHeight: 50,
        paddingHorizontal: 4,
      },

      weekToggleContent: {
        paddingVertical: 10,
        paddingHorizontal: 4,
      },

      weekToggleText: {
        color: colours.onSurface,
        fontSize: 16,
        fontWeight: 600,
      },

      yearHeading: {
        width: '90%',
        alignSelf: 'center',
        marginTop: 14,
        marginBottom: 2,
      }
    
})
};

// converts YYYY-MM-DD on a Monday to display text Monday-Sunday (whole week)
function weekRangeLabel(weekStarting: string): string {
  const [y, m, d] = weekStarting.split('-').map(Number);
  const start = new Date(y, m-1, d);
  const end = new Date(y, m-1, d+6);
  const monthName = (date: Date) => date.toLocaleDateString('en-AU', {month: 'long'});

  if (start.getMonth() === end.getMonth()){
    return `${start.getDate()}-${end.getDate()} ${monthName(end)}`;
  }
  return `${start.getDate()} ${monthName(start)} - ${end.getDate()} ${monthName(end)}`
}