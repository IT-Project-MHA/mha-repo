/**
 */
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import StickyButtonWithIcon, { STICKY_BUTTON_GAP } from '../../../../components/atomicUI/StickyButtonWithIcon';
import { useRouter } from 'expo-router';
import { useTheme, ColourSet } from '../../../../context/ThemeContext';
import { useEffect, useState } from 'react';
import { apiAboutMe, apiMyConditions, apiMyPainSummary, apiMovementSummary, apiPersonalCareSummary,
  apiSocialHealthSummary, apiManagementSummary } from '@/api/my_health_api_helpers';
import { currentPainIntensityText, averagePainIntensityText, worstPainIntensityText, 
  mildestPainIntensityText, averageActivityHourText, moodIntensityText, relationshipsIntensityText,
  enjoymentIntensityText, medicationText } from '../../../../constants/resultDisplayText';
import { pdfPage, sharePdf } from '@/helpers/pdfExport';

export default function Screen() {
  const router = useRouter();
  const { theme, colours } = useTheme();
  const styles = createStyles(colours);

  // About me details {name, sex, ageGroup }
  const [aboutMe, setAboutMe] = useState({ name: '', sex: '', ageGroup: '' });
  // My conditions {primaryCondition, otherConditions}
  const [conditions, setConditions] = useState({primaryCondition: '', otherConditions: ''});
  // My Pain Summary {location, current, average, worst, mildest, characteristics}
  const [pain, setPain] = useState<{
    location: string;
    current: number | null;
    average: number | null;
    worst: number | null;
    mildest: number | null;
    characteristics: string;
  }>({
    location: '', current: null, average: null, worst: null, mildest: null, characteristics: '',
  });
  // Movement Summary {activeHours, general, walking, lifting, sitting, standing}
  const [movement, setMovement] = useState<{
    activeHours: number | null;
    general: string;
    walking: string;
    lifting: string;
    sitting: string;
    standing: string;
  }>({
    activeHours: null, general: '', walking: '', lifting: '', sitting: '', standing: '',
  });
  // Personal Care Summary {general, personalCare, sleeping}
  const [personalCare, setPersonalCare] = useState({ general: '', personalCare: '', sleeping: '' });
  // Social Health summary {socialLife, travelling, mood, relationships, enjoyment}
  const [social, setSocial] = useState<{
    socialLife: string;
    travelling: string;
    mood: number | null;
    relationships: number | null;
    enjoyment: number | null;
  }>({
    socialLife: '', travelling: '', mood: null, relationships: null, enjoyment: null,
  });
  // Management summary {medication, exercise, emotion}
  const [management, setManagement] = useState({ medication: '', exercise: '', emotion: '' });

  // true until every summary request above has settled, so the PDF is not
  // exported from half-loaded state
  const [loading, setLoading] = useState(true);

  // Load all summaries together in 1 promise
  useEffect(() => {
    // for each API call, set the corresponding state
    const load = <T,>(p: Promise<T>, set: (v: T) => void, label: string) =>
      p.then(set)
        .catch((e) => console.log(`failed to load ${label}`, e?.message, e?.status, e?.data));

    Promise.allSettled([
      load(apiAboutMe(), setAboutMe, 'about me'),
      load(apiMyConditions(), setConditions, 'conditions'),
      load(apiMyPainSummary(), setPain, 'my pain'),
      load(apiMovementSummary(), setMovement, 'movement'),
      load(apiPersonalCareSummary(), setPersonalCare, 'personal care'),
      load(apiSocialHealthSummary(), setSocial, 'social health'),
      load(apiManagementSummary(), setManagement, 'management'),
    ]).finally(() => setLoading(false));
  }, []);

  // pdf export helper
  const na = (v?: string | null) => v || 'Not available';
  const row = (label: string, value?: string | null) =>
    `<tr><td class="label">${label}</td><td class="value">${na(value)}</td></tr>`;
  // append the raw number to a label for number-input fields, e.g. 'Current pain: 7'
  const withNum = (label: string, n?: number | null) => n == null ? label : `${label}: ${n}`;

  const buildHtml = () => pdfPage({
    title: 'My Pain Profile',
    footer: 'Generated from most recent weekly assessment data from the M-Powered Platform',
    body: `
      <div class="card">
      <h2>About me</h2>
      <table>
        ${row('Name', aboutMe.name)}
        ${row('Sex', aboutMe.sex)}
        ${row('Age group', aboutMe.ageGroup)}
      </table>
    </div>
      
    <div class="card">
    <h2>My conditions</h2>
      <table>
        ${row('Primary condition', conditions.primaryCondition)}
        ${row('Other conditions', conditions.otherConditions)}
      </table>
    </div>


    <div class="card">
      <h2>My Pain</h2>
      <table>
        ${row('Pain location', pain.location)}
        ${row(withNum('Current pain', pain.current), currentPainIntensityText(pain.current))}
        ${row(withNum('Average pain (2 weeks)', pain.average), averagePainIntensityText(pain.average))}
        ${row(withNum('Worst pain', pain.worst), worstPainIntensityText(pain.worst))}
        ${row(withNum('Mildest pain', pain.mildest), mildestPainIntensityText(pain.mildest))}
        ${row('Pain characteristics', pain.characteristics)}
      </table>
    </div>

    <div class="card">
      <h2>Impacts to Movement</h2>
      <table>
        ${row('Average activity hour', averageActivityHourText(movement.activeHours))}
        ${row('General movement', movement.general)}
        ${row('Walking', movement.walking)}
        ${row('Lifting', movement.lifting)}
        ${row('Sitting', movement.sitting)}
        ${row('Standing', movement.standing)}
      </table>
    </div>

    <div class="card">
      <h2>Impacts to Personal Care</h2>
      <table>
        ${row('General activities', personalCare.general)}
        ${row('Personal care (washing, dressing, etc)', personalCare.personalCare)}
        ${row('Sleeping', personalCare.sleeping)}
      </table>
    </div>

    <div class="card">
      <h2>Impacts to Social Health</h2>
      <table>
        ${row('Social life', social.socialLife)}
        ${row('Travelling', social.travelling)}
        ${row('Mood', moodIntensityText(social.mood))}
        ${row('Relation with others', relationshipsIntensityText(social.relationships))}
        ${row('Enjoyment of life', enjoymentIntensityText(social.enjoyment))}
      </table>
    </div>

    <div class="card">
      <h2>My Current Management</h2>
      <table>
        ${row('Medication', medicationText(management.medication))}
        ${row('Exercise', management.exercise)}
        ${row('Emotion', management.emotion ||
          'You did not perform any dedicated strategy to manage your mood.')}
      </table>
    </div>`,
  });

  const handleExportPdf = async () => {
    if (loading) return;
    await sharePdf(buildHtml(), 'pain-profile.pdf', 'Share my Pain Profile');
  };

  return (
    <>
    <ScrollView stickyHeaderIndices={[0]}>
      <View style={theme.header}>
        <Text style={[theme.h4, theme.leftText, theme.fontOnSurface]}>My Pain Profile</Text>
      </View>

      {/**
       *
       */}
      <Text> </Text>
      <View style={[theme.sectionContainer, styles.filledCard]}>
        <View style={styles.cardItem}>
          <Text style={[theme.h4, theme.fontOnSurface]}>About me</Text>
        </View>
        <View style={theme.line}/>
        <View style={styles.cardItem}>
          <Text style={[theme.h6, theme.fontOnSurface]}>Name</Text>
          <Text style={[theme.body, theme.fontOnSurface]}>{aboutMe.name || 'Not available'}</Text>
        </View>
        <View style={styles.cardItem}>
          <Text style={[theme.h6, theme.fontOnSurface]}>Sex</Text>
          <Text style={[theme.body, theme.fontOnSurface]}>{aboutMe.sex || 'Not available'}</Text>
        </View>
        <View style={styles.cardItem}>
          <Text style={[theme.h6, theme.fontOnSurface]}>Age group</Text>
          <Text style={[theme.body, theme.fontOnSurface]}>{aboutMe.ageGroup || 'Not available'}</Text>
        </View>
      </View>

      <View style={[theme.sectionContainer, styles.filledCard]}>
        <View style={styles.cardItem}>
          <Text style={[theme.h4, theme.fontOnSurface]}>My conditions</Text>
        </View>
        <View style={theme.line}/>
        <View style={styles.cardItem}>
          <Text style={[theme.h6, theme.fontOnSurface]}>Primary condition</Text>
          <Text style={[theme.body, theme.fontOnSurface]}>{conditions.primaryCondition || 'Not available'}</Text>
        </View>
        <View style={styles.cardItem}>
          <Text style={[theme.h6, theme.fontOnSurface]}>Other conditions</Text>
          <Text style={[theme.body, theme.fontOnSurface]}>{conditions.otherConditions || 'Not available'}</Text>
        </View>
      </View>

      <View style={[theme.sectionContainer, styles.filledCard]}>
        <View style={styles.cardItem}>
          <Text style={[theme.h4, theme.fontOnSurface]}>My Pain</Text>
          <Text style={[theme.body, theme.fontOnSurface]}>Severity of my pain, pattern and location</Text>
        </View>
        <View style={theme.line}/>
        <View style={styles.cardItem}>
          <Text style={[theme.h6, theme.fontOnSurface]}>My Pain location</Text>
          <Text style={[theme.body, theme.fontOnSurface]}>{pain.location || 'Not available'}</Text>
        </View>
        <View style={styles.cardItem}>
          <Text style={[theme.h6, theme.fontOnSurface]}>{withNum('My Current pain', pain.current)}</Text>
          <Text style={[theme.body, theme.fontOnSurface]}>{currentPainIntensityText(
            pain.current)}</Text>
        </View>
        <View style={styles.cardItem}>
          <Text style={[theme.h6, theme.fontOnSurface]}>{withNum('Average pain (2 weeks)', pain.average)}</Text>
          <Text style={[theme.body, theme.fontOnSurface]}>{averagePainIntensityText(
            pain.average)}</Text>
        </View>
        <View style={styles.cardItem}>
          <Text style={[theme.h6, theme.fontOnSurface]}>{withNum('Worst pain', pain.worst)}</Text>
          <Text style={[theme.body, theme.fontOnSurface]}>{worstPainIntensityText(
            pain.worst)}</Text>
        </View>
        <View style={styles.cardItem}>
          <Text style={[theme.h6, theme.fontOnSurface]}>{withNum('Mildest pain', pain.mildest)}</Text>
          <Text style={[theme.body, theme.fontOnSurface]}>{mildestPainIntensityText(
            pain.mildest)}</Text>
        </View>
        <View style={styles.cardItem}>
          <Text style={[theme.h6, theme.fontOnSurface]}>Pain characteristics</Text>
          <Text style={[theme.body, theme.fontOnSurface]}>
            {pain.characteristics || 'Not available'}</Text>
        </View>
      </View>


      <View style={[theme.sectionContainer, styles.filledCard]}>
        <View style={styles.cardItem}>
          <Text style={[theme.h4, theme.fontOnSurface]}>Impacts to Movement</Text>
        </View>
        <View style={theme.line}/>
        <View style={styles.cardItem}>
          <Text style={[theme.h6, theme.fontOnSurface]}>Average activity hour:</Text>
          <Text style={[theme.body, theme.fontOnSurface]}>{
          averageActivityHourText(movement.activeHours)}</Text>
        </View>
        <View style={styles.cardItem}>
          <Text style={[theme.h6, theme.fontOnSurface]}>General Movement:</Text>
          <Text style={[theme.body, theme.fontOnSurface]}>{movement.general || 'Not available'}</Text>
        </View>
        <View style={styles.cardItem}>
          <Text style={[theme.h6, theme.fontOnSurface]}>Walking:</Text>
          <Text style={[theme.body, theme.fontOnSurface]}>{movement.walking || 'Not available'}</Text>
        </View>
        <View style={styles.cardItem}>
          <Text style={[theme.h6, theme.fontOnSurface]}>Lifting:</Text>
          <Text style={[theme.body, theme.fontOnSurface]}>{movement.lifting || 'Not available'}</Text>
        </View>
        <View style={styles.cardItem}>
          <Text style={[theme.h6, theme.fontOnSurface]}>Sitting:</Text>
          <Text style={[theme.body, theme.fontOnSurface]}>{movement.sitting || 'Not available'}</Text>
        </View>
        <View style={styles.cardItem}>
          <Text style={[theme.h6, theme.fontOnSurface]}>Standing:</Text>
          <Text style={[theme.body, theme.fontOnSurface]}>{movement.standing || 'Not available'}</Text>
        </View>
      </View>

      <View style={[theme.sectionContainer, styles.filledCard]}>
        <View style={styles.cardItem}>
          <Text style={[theme.h4, theme.fontOnSurface]}>Impacts to Personal Care</Text>
        </View>
        <View style={theme.line}/>
        <View style={styles.cardItem}>
          <Text style={[theme.h6, theme.fontOnSurface]}>General Activities:</Text>
          <Text style={[theme.body, theme.fontOnSurface]}>{personalCare.general || 'Not available'}</Text>
        </View>
        <View style={styles.cardItem}>
          <Text style={[theme.h6, theme.fontOnSurface]}>Personal care (washing, dressing, etc):</Text>
          <Text style={[theme.body, theme.fontOnSurface]}>{personalCare.personalCare || 'Not available'}</Text>
        </View>
        <View style={styles.cardItem}>
          <Text style={[theme.h6, theme.fontOnSurface]}>Sleeping:</Text>
          <Text style={[theme.body, theme.fontOnSurface]}>{personalCare.sleeping || 'Not available'}</Text>
        </View>
      </View>

      <View style={[theme.sectionContainer, styles.filledCard]}>
        <View style={styles.cardItem}>
          <Text style={[theme.h4, theme.fontOnSurface]}>Impacts to Social Health</Text>
        </View>
        <View style={theme.line}/>
        <View style={styles.cardItem}>
          <Text style={[theme.h6, theme.fontOnSurface]}>Social life:</Text>
          <Text style={[theme.body, theme.fontOnSurface]}>{social.socialLife || 'Not available'}</Text>
        </View>
        <View style={styles.cardItem}>
          <Text style={[theme.h6, theme.fontOnSurface]}>Travelling:</Text>
          <Text style={[theme.body, theme.fontOnSurface]}>{social.travelling || 'Not available'}</Text>
        </View>
        <View style={styles.cardItem}>
          <Text style={[theme.h6, theme.fontOnSurface]}>Mood:</Text>
          <Text style={[theme.body, theme.fontOnSurface]}>{moodIntensityText(social.mood)}</Text>
        </View>
        <View style={styles.cardItem}>
          <Text style={[theme.h6, theme.fontOnSurface]}>Relation with others:</Text>
          <Text style={[theme.body, theme.fontOnSurface]}>{relationshipsIntensityText(social.relationships)}</Text>
        </View>
        <View style={styles.cardItem}>
          <Text style={[theme.h6, theme.fontOnSurface]}>Enjoyment of life:</Text>
          <Text style={[theme.body, theme.fontOnSurface]}>{enjoymentIntensityText(social.enjoyment)}</Text>
        </View>
      </View>

      <View style={[theme.sectionContainer, styles.filledCard]}>
        <View style={styles.cardItem}>
          <Text style={[theme.h4, theme.fontOnSurface]}>My Current Management</Text>
        </View>
        <View style={theme.line}/>
        <View style={styles.cardItem}>
          <Text style={[theme.h6, theme.fontOnSurface]}>Medication:</Text>
          <Text style={[theme.body, theme.fontOnSurface]}>{medicationText(management.medication)}</Text>
        </View>
        <View style={styles.cardItem}>
          <Text style={[theme.h6, theme.fontOnSurface]}>Exercise:</Text>
          <Text style={[theme.body, theme.fontOnSurface]}>{management.exercise || 'Not available'}</Text>
        </View>
        <View style={styles.cardItem}>
          <Text style={[theme.h6, theme.fontOnSurface]}>Emotion:</Text>
          <Text style={[theme.body, theme.fontOnSurface]}>{management.emotion || 
          'You did not perform any dedicated strategy to manage your mood.'}</Text>
        </View>
      </View>


      <View style={theme.bottomGap}/>
      <View style={{height: STICKY_BUTTON_GAP}}/>

    </ScrollView>

    <StickyButtonWithIcon
      label={loading ? 'Loading…' : 'Share PDF'}
      onPress={handleExportPdf}
      name="share-outline"
      disabled={loading}
    />
    </>
  );
}

function createStyles(colours: ColourSet){
    return StyleSheet.create({
      card: {
        gap: 12,
      },

      cardItem: {
        width: '85%',
        alignSelf: 'center',
      },

      filledCard: {
        gap: 12,
        marginBottom: 30,
      },

  })
};
