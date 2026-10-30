/**
 */
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme, ColourSet } from '../../../../context/ThemeContext'
import {useState, useEffect} from 'react';
import {apiAssessment} from '@/api/django-API';
import {ownPatientProfileId} from '@/api/care_planner_api_helpers';
import {apiAnsweredSections} from '@/api/my_health_api_helpers';
import {Ionicons} from '@react-native-vector-icons/ionicons';
import {weekRangeLabel, formatDate} from '../../../../constants/date';
import AssessmentChart, {ChartSnapshot} from '../../../../components/graphics/AssessmentChart';
import SegmentedPill from '../../../../components/atomicUI/SegmentedControlPill';
import StickyButtonWithIcon, {STICKY_BUTTON_GAP} from '../../../../components/atomicUI/StickyButtonWithIcon';
import {pdfPage, sharePdf} from '@/helpers/pdfExport';

const SECTIONS = [
  {key: 'my_pain', label: 'My Pain'},
  {key: 'my_movement', label: 'My Movement'},
  {key: 'personal_care', label: 'My Personal Care'},
  {key: 'social_health', label: 'My Social Health'},
  {key: 'management', label: 'My Management'},
] as const;

// formats a number for a table cell, '–' when missing
const fmt = (v: number | null | undefined) => (v == null ? '–' : String(v));

/**
 * Builds the PDF of the chart card
 */
function chartPdfHtml(chart: ChartSnapshot, image: string | null) {
  const table = chart.stats ? `
    <table class="data-table">
      <tr><th class="week">Week</th><th>Average</th><th>Worst</th><th>Mildest</th></tr>
      <tr class="overall"><td class="week">Overall</td><td>${fmt(chart.stats.average)}</td>
        <td>${fmt(chart.stats.worst)}</td><td>${fmt(chart.stats.mildest)}</td></tr>
      ${[...chart.points].reverse().map((w) => `
        <tr><td class="week">${formatDate(w.completedAt)}</td><td>${fmt(w.score)}</td>
          <td>${fmt(w.worst)}</td><td>${fmt(w.mildest)}</td></tr>`).join('')}
    </table>` : '';

  return pdfPage({
    title: 'My Assessment Records',
    footer: 'Generated from weekly assessment data from the M-Powered Platform',
    extraStyle: `
      .chart-card {page-break-inside: auto;}
      .period {color: #666; margin: 0 0 12px;}
      .chart-image {width: 100%;}
      .data-table {margin-top: 16px; border: 1px solid #e0e0e0;}
      .data-table th, .data-table td {border: 1px solid #e0e0e0; padding: 6px; text-align: center;}
      .data-table .week {text-align: left;}
      .data-table .overall td {font-weight: 700;}
      .data-table tr {page-break-inside: avoid;}`,
    body: `
    <div class="card chart-card">
      <h2>${chart.title}</h2>
      <p class="period">${chart.periodLabel}</p>
      ${image ? `<img class="chart-image" src="data:image/png;base64,${image}"/>` : ''}
      ${table}
    </div>`,
  });
}

export default function Screen() {

  const { theme,colours } = useTheme();
  const styles = createStyles(colours);
  const [index, setIndex]= useState(0);
  const [chart, setChart] = useState<ChartSnapshot | null>(null);
  const chartLoading = !chart || chart.loading;

  const handleExportPdf = async () => {
    if (!chart || chart.loading) return;
    let image: string | null = null;
    try {
      image = await chart.captureChart();
    } catch (e: any) {
      console.log('failed to capture chart', e?.message);
    }
    await sharePdf(chartPdfHtml(chart, image), 'assessment-chart.pdf', 'Share my Assessment Chart');
  };

  return (
    <>
    <ScrollView stickyHeaderIndices={[0]}>
      <View style={theme.header}>
        <Text style={[theme.h4, theme.leftText, theme.fontOnSurface]}>My Assessment Records</Text>
        <View style={{marginTop: 30}}>
        <SegmentedPill
          values={['Chart', 'History']}
          selectedIndex={index}
          onChange={setIndex}
          radius={50}
          style={styles.segmentedControl}
        />
        </View>
      </View>
      
      
       {index === 0 ? <ChartPage onSnapshotChange={setChart}/> : <RecordPage /> }
      <View style={theme.bottomGap}/>
      {index === 0 && <View style={{height: STICKY_BUTTON_GAP}}/>}

    </ScrollView>

    {index === 0 && (
      <StickyButtonWithIcon
        label={chartLoading ? 'Loading…' : 'Share PDF'}
        onPress={handleExportPdf}
        name="share-outline"
        disabled={chartLoading}
      />
    )}
    </>
  );
}

function ChartPage({onSnapshotChange}: {onSnapshotChange: (snapshot: ChartSnapshot) => void}){
  const { theme } = useTheme();

  return (
    <View>
      <View style={[theme.layoutContainer]}>
        <AssessmentChart onSnapshotChange={onSnapshotChange}/>
        <View style={theme.bottomGap}/>
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
  // answered section keys per week; undefined = not fetched yet (still loading)
  const [answered, setAnswered] = useState<Record<string, string[]>>({});

  // toggle a week open/closed; fetch its answered sections the first time it opens
  const toggleWeek = (week: string, isOpen: boolean) => {
    setOpenWeek(isOpen ? null : week);
    if (!isOpen && answered[week] === undefined) {
      apiAnsweredSections(undefined, week)
        .then((keys: string[]) => setAnswered((prev) => ({...prev, [week]: keys})))
        .catch((e: any) => console.log('failed to load answered sections', week, e?.message));
    }
  };

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
                // show year heading for the first week, or if the current assessment date is in 
                // a different year
                const showYearHeading = i===0 || week.slice(0,4) !== weeks[i-1].slice(0,4);
                return (
                  <View key={week}>
                    {showYearHeading? <Text style={[theme.h4, theme.fontOnSurface, 
                      styles.yearHeading]}>{week.slice(0,4)}</Text>
                      : i>0 && <View style={theme.line}/>}
                    <View style={styles.weekToggle}>
                      <Pressable onPress={() => toggleWeek(week, isOpen)}
                        style={styles.weekToggleHeader}>
                        <Text style={[theme.small, styles.weekToggleText]}>{weekRangeLabel(week)}</Text>
                        <Text style={[theme.small, styles.weekToggleText]}>{isOpen ? '▲' : '▼'}</Text>
                      </Pressable>

                      {/*display only the sections that were answered for the opened week*/}
                      {isOpen && (
                        <View style={styles.weekToggleContent}>
                          {SECTIONS.filter((section) => (answered[week] ?? []).includes(section.key))
                            .map((section) => (
                            <Pressable key={section.key} style={styles.sectionRow} onPress={()=>
                              router.push({pathname: '/myHealth/assessmentSectionSummary',
                                params: {week, section: section.key},
                              })
                            }>
                              <Text style={[theme.body, theme.fontOnSurface]}>{section.label}</Text>
                              <Ionicons name="chevron-forward" size={18} color={colours.onSurface}/>
                            </Pressable>
                          ))}
                          {answered[week]?.length === 0 && (
                            <Text style={[theme.small, theme.fontOnSurface]}>
                              No sections answered this week</Text>
                          )}
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
        borderRadius: 20,
        width: '92%',
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