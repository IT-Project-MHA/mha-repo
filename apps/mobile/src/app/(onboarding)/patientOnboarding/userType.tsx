/**
 * This page contains a multiple choice question.
 * It asks if the user will use the app to track their own health
 */


import { View, Text, ScrollView, StyleSheet } from 'react-native';

import { useRouter } from 'expo-router';
import { MultipleChoice } from '../../../../components/answerFields/MultipleChoice';
import { useOnboardingStore } from '../../store/onboardingStorage';

import React from 'react';

import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { lineThickness } from '../../../../constants/layout';
import { useTheme, ColourSet } from '../../../../context/ThemeContext';
import { Typography } from '../../../../constants/textSize';



export default function Page() {
  const router = useRouter();
  const { colours, theme } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = createStyles(colours, theme, insets.bottom);
  const setUserOnboaring = useOnboardingStore((s)=> s.set);

  const USER_TYPES = ["For myself","To help someone else"]; //patient equivalent text, support person equivalent text

  function setUserType(selection: string){
    //this function sets the user type based on selection, and navigates to the appropriate page

    //check selections and set flags
    const track_health = (selection==USER_TYPES[0]);

    setUserOnboaring({track_health});
    //navigation
    //if patient tagged, do that first.
    //support person onboarding is tacked on after phone number verification, with a check to the pseudo-account flag
    if(track_health){
      //navigate to sex-select
      router.navigate('/(onboarding)/patientOnboarding/sexSelect');
    }
    else{
      //navigate to landing page
      router.navigate('/(onboarding)/supportPersonOnboarding/supportPersonOnboarding');
    }
  }
  return (
    <SafeAreaView style={theme.screen}>
      <View style={theme.header}>
        <Text style={styles.heading}>How do you plan to use the app?</Text>
      </View>
      <ScrollView
      showsVerticalScrollIndicator={false}
      >
        <MultipleChoice
        questionOptions={USER_TYPES}
        onSubmit={setUserType}
        />
      </ScrollView>
    </SafeAreaView>
  );
}


function createStyles(colours: ColourSet, text: Typography, bottomInset: number) {
  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colours.background,
    },

    content: {
      paddingBottom: 200 + bottomInset,
      gap: 38,
    },

    title: {
      marginBottom: -19,
    },

    card: {
      gap: 12,
    },

    cardContent: {
      paddingHorizontal: '5%',
      paddingBottom: 5,
    },

    bottomBar: {
      position: 'absolute',
      left: '7.5%',
      width: '85%',
      bottom: 120 + bottomInset,
      gap: 8,
    },

    heading: {
      ...text.h6,
      color: colours.onSurface,
      paddingHorizontal: '5%',
    },

    subheading: {
      ...text.small,
      color: colours.onBackground,
      paddingHorizontal: '5%',
      marginTop: 4,
    },

    label: {
      marginTop: 29,
      marginBottom: 19,
    },

    firstLabel: {
      marginTop: 5,
    },

    field: {
      height: 40,
      paddingVertical: 5,
      paddingHorizontal: 10,
      marginHorizontal: 8,
      borderWidth: 1,
      borderColor: colours.onSurface,
      justifyContent: 'center',
    },

    input: {
      ...text.body,
      color: colours.onSurface,
    },

    error: {
      ...text.small,
      borderWidth: 1,
      borderRadius: 8,
      paddingVertical: 6,
      paddingHorizontal: 12,
      backgroundColor: colours.background,
      overflow: 'hidden',
    },

    dropdown: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },

    optionList: {
      marginTop: 8,
      marginHorizontal: 8,
      borderWidth: 1,
      borderColor: colours.onSurface,
      overflow: 'hidden',
    },

    optionRow: {
      paddingVertical: 10,
      paddingHorizontal: 12,
    },

    divider: {
      borderTopWidth: lineThickness,
      borderTopColor: colours.secondary2,
    },

    selectedRow: {
      backgroundColor: colours.secondary,
    },

    selectedText: {
      color: colours.onSecondary,
    },
  });
}

