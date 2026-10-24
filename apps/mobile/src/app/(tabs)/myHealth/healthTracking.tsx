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
import {Ionicons} from '@react-native-vector-icons/ionicons';

const SECTIONS = [
  {key: 'my_pain', label: 'My Pain'},
  {key: 'my_movement', label: 'My Movement'},
  {key: 'personal_care', label: 'My Personal Care'},
  {key: 'social_health', label: 'My Social Health'},
  {key: 'management', label: 'My Management'},
] as const;

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
        backgroundColor={colours.tertiary}
        fontStyle={{ color: colours.onTertiary, fontSize: 16 }}
        activeFontStyle={{ color: colours.onEx3, fontSize: 16 }}
       />

       {index === 0 ? <ChartPage/> : <RecordPage /> }
      <View style={theme.bottomGap}/>
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
  const router = useRouter();

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
                          {SECTIONS.map((section) => (
                            <Pressable key={section.key} style={styles.sectionRow} onPress={()=>
                              router.push({pathname: '/myHealth/assessmentSectionSummary',
                                params: {week, section: section.key},
                              })
                            }>
                              <Text style={[theme.body, theme.fontOnSurface]}>{section.label}</Text>
                              <Ionicons name="chevron-forward" size={18} color={colours.onSurface}/>
                            </Pressable>
                          ))}
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
        borderRadius: 10,
        width: '75%',
        height: 40,
        alignSelf: 'center',
        marginBottom: 10,
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
      },

      sectionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        minHeight: 44,
        paddingHorizontal: 4,
        paddingVertical: 8,
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