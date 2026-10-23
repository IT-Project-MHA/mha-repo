/**
 */
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import ButtonWithIcon from '../../../../components/atomicUI/ButtonWithIcon';
import { useRouter } from 'expo-router';
import { useTheme, ColourSet } from '../../../../context/ThemeContext';
import { useEffect, useState } from 'react';
import { apiAboutMe, apiMyConditions, apiMyPainSummary, apiMovementSummary, apiPersonalCareSummary,
  apiSocialHealthSummary, apiManagementSummary } from '@/api/my_health_api_helpers';
import { currentPainIntensityText, averagePainIntensityText, worstPainIntensityText, 
  mildestPainIntensityText, averageActivityHourText, moodIntensityText, relationshipsIntensityText,
  enjoymentIntensityText, medicationText } from '../../../../constants/resultDisplayText';

export default function Screen() {
  const router = useRouter();
  const { theme, colours } = useTheme();
  const styles = createStyles(colours);

  // About me details {name, sex, ageGroup }
  const [aboutMe, setAboutMe] = useState({ name: '', sex: '', ageGroup: '' });
  useEffect(() => {
    apiAboutMe().then(setAboutMe)
      .catch((e) => console.log('failed to load about me', e?.message, e?.status, e?.data));
  }, []);

  // My conditions {primaryCondition, otherConditions}
  const [conditions, setConditions] = useState({primaryCondition: '', otherConditions: ''});
  useEffect(() => {
    apiMyConditions()
      .then(setConditions)
      .catch((e) => console.log('failed to load conditions', e?.message, e?.status, e?.data));
  }, []);

  // My Pain Summary {location, current, average, worst, mildest, characteristics}
  const [pain, setPain] = useState({
    location: '', current: null, average: null, worst: null, mildest: null, characteristics: '',
  });
  useEffect(() => {
    apiMyPainSummary()
      .then(setPain)
      .catch((e) => console.log('failed to load my pain', e?.message, e?.status, e?.data));
  }, []);

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
  useEffect(() => {
    apiMovementSummary()
      .then(setMovement)
      .catch((e) => console.log('failed to load movement', e?.message, e?.status, e?.data));
  }, []);

  // Personal Care Summary {general, personalCare, sleeping}
  const [personalCare, setPersonalCare] = useState({ general: '', personalCare: '', sleeping: '' });
  useEffect(() => {
    apiPersonalCareSummary()
      .then(setPersonalCare)
      .catch((e) => console.log('failed to load personal care', e?.message, e?.status, e?.data));
  }, []);

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
  useEffect(() => {
    apiSocialHealthSummary()
      .then(setSocial)
      .catch((e) => console.log('failed to load social health', e?.message, e?.status, e?.data));
  }, []);

  // Management summary {medication, exercise, emotion}
  const [management, setManagement] = useState({ medication: '', exercise: '', emotion: '' });
  useEffect(() => {
    apiManagementSummary()
      .then(setManagement)
      .catch((e) => console.log('failed to load management', e?.message, e?.status, e?.data));
  }, []);

  return (
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
          <Text style={[theme.h6, theme.fontOnSurface]}>My Current pain:</Text>
          <Text style={[theme.body, theme.fontOnSurface]}>{currentPainIntensityText(
            pain.current)}</Text>
        </View>
        <View style={styles.cardItem}>
          <Text style={[theme.h6, theme.fontOnSurface]}>Average pain (2 weeks):</Text>
          <Text style={[theme.body, theme.fontOnSurface]}>{averagePainIntensityText(
            pain.average)}</Text>
        </View>
        <View style={styles.cardItem}>
          <Text style={[theme.h6, theme.fontOnSurface]}>Worst pain:</Text>
          <Text style={[theme.body, theme.fontOnSurface]}>{worstPainIntensityText(
            pain.worst)}</Text>
        </View>
        <View style={styles.cardItem}>
          <Text style={[theme.h6, theme.fontOnSurface]}>Mildest pain:</Text>
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

    </ScrollView>

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
