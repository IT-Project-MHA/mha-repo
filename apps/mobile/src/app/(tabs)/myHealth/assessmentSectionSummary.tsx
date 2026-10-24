import { View, Text, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useTheme } from '../../../../context/ThemeContext';
import { useEffect, useState } from 'react';
import { apiManagementSummary, apiMovementSummary, apiMyPainSummary, apiPersonalCareSummary, apiSocialHealthSummary } from '@/api/my_health_api_helpers';
import { averageActivityHourText, averagePainIntensityText, currentPainIntensityText, enjoymentIntensityText, medicationText, mildestPainIntensityText, moodIntensityText, relationshipsIntensityText, worstPainIntensityText } from '../../../../constants/resultDisplayText';

export default function Screen() {
  const {week, section} = useLocalSearchParams<{week: string; section: string}>();
  const {theme, colours} = useTheme();
  const [data, setData] = useState<any>(null);

  useEffect(()=>{
    const loaders: Record<string, ()=> Promise<any>>={
      my_pain: () => apiMyPainSummary(undefined, week),
      my_movement: () => apiMovementSummary(undefined, week),
      personal_care: () => apiPersonalCareSummary(undefined, week),
      social_health: () => apiSocialHealthSummary(undefined, week),
      management: () => apiManagementSummary(undefined, week),
    };
    loaders[section!]?.().then(setData) // if invalid section input, load nothing
      .catch((e: any)=> console.log('failed to load section', section, e?.message));
  }, [section, week]); // dependency

  const na = (v?: string|null) => v || 'Not available';
  const fieldsFor = (): [string, string][] => {
    if (!data) return [];
    switch(section){
      case 'my_pain': return [
        ['My Pain location',na(data.location)],
        ['My Current pain', currentPainIntensityText(data.current)],
        ['Average pain (2 weeks)', averagePainIntensityText(data.average)],
        ['Worst pain', worstPainIntensityText(data.worst)],
        ['Mildest pain', mildestPainIntensityText(data.mildest)],
        ['Pain characteristics', na(data.characteristics)],
      ];
      case 'my_movement': return [
        ['Average activity hour', averageActivityHourText(data.activeHours)],
        ['General Movement', na(data.general)],
        ['Walking', na(data.walking)], ['Lifting', na(data.lifting)],
        ['Sitting', na(data.sitting)], ['Standing', na(data.standing)],
      ];
      case 'personal_care': return [
        ['General Activities', na(data.general)],
        ['Personal care (washing, dressing, etc)', na(data.personalCare)],
        ['Sleeping', na(data.sleeping)],
      ];
      case 'social_health': return [
        ['Social life', na(data.socialLife)], ['Travelling', na(data.travelling)],
        ['Mood', moodIntensityText(data.mood)],
        ['Relation with others', relationshipsIntensityText(data.relationships)],
        ['Enjoyment of life', enjoymentIntensityText(data.enjoyment)],
      ];
      case 'management': return [
        ['Medication', medicationText(data.medication)],
        ['Exercise', na(data.exercise)],
        ['Emotion', data.emotion || 
          'You did not perform any dedicated strategy to manage your mood.'],
      ];
      default: return [];
    }
  };

  const titles: Record<string, string>={
    my_pain: 'My Pain', my_movement: 'Impacts to Movement', personal_care: 
    'Impacts to personal Care', social_health: 'Impacts to Social health', management: 
    'My Current Management'
  };

  return (
  <ScrollView stickyHeaderIndices={[0]}>
    <View style={theme.header}>
      <Text style={[theme.h4, theme.leftText, theme.fontOnSurface]}>{titles[section!] ?? 
      'Assessment'}</Text>
    </View>
    <View style={[theme.sectionContainer, {gap:12, marginBottom:30}]}>
      <View style={{width: '85%', alignSelf: 'center'}}>
        <Text style={[theme.h6, theme.fontOnSurface]}>Week of {week}</Text>
      </View>
      <View style={theme.line} />
      {fieldsFor().map(([label, value])=>(
        <View key={label} style={{width: '85%', alignSelf:'center'}}>
          <Text style={[theme.h6, theme.fontOnSurface]}>{label}</Text>
          <Text style={[theme.body, theme.fontOnSurface]}>{value}</Text>
        </View>
      ))}
    </View>
    <View style={theme.bottomGap}/>
  </ScrollView>
  );
}