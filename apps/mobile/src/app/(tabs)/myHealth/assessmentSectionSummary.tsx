import { View, Text, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useTheme } from '../../../../context/ThemeContext';
import { useEffect, useState } from 'react';
import { apiManagementSummary, apiMovementSummary, apiMyPainSummary, apiPersonalCareSummary, apiSocialHealthSummary } from '@/api/my_health_api_helpers';
import { weekRangeLabel } from '../../../../constants/date';
import { fieldsFor, titles } from '../../../healthInfo/sectionSummaryFields';

export default function Screen() {
  const {week, section} = useLocalSearchParams<{week: string; section: string}>();
  const {theme} = useTheme();
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

  return (
  <ScrollView stickyHeaderIndices={[0]}>
    <View style={theme.header}>
      <Text style={[theme.h4, theme.leftText, theme.fontOnSurface]}>My Assessment Summary</Text>
    </View>
    <View style={[theme.sectionContainer, {gap:12, marginBottom:30}]}>
      {/* card title: section name heading with the formatted period underneath */}
      <View style={{width: '85%', alignSelf: 'center'}}>
        <Text style={[theme.h4, theme.fontOnSurface]}>{titles[section!] ?? 'Assessment'}</Text>
        <Text style={[theme.body, theme.fontOnSurface]}>{week ? weekRangeLabel(week) : ''}</Text>
      </View>
      <View style={theme.line} />
      {fieldsFor(section, data).map(([label, value])=>(
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