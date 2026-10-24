import { View, Text, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useTheme } from '../../../../context/ThemeContext';
import { useEffect, useState } from 'react';

export default function Screen() {
  const {week, section} = useLocalSearchParams<{week: string; section: string}>();
  return (
    <ScrollView stickyHeaderIndices={[0]}>
        
    </ScrollView>
  );
}