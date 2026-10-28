/**
 * first page of sign-up sequence
 * asks for name
 * directs to terms and conditions page
 */



import { TextEntry } from '../../../../components/answerFields/TextEntry';
import { useRouter } from 'expo-router';
import { useOnboardingStore } from '../../store/onboardingStorage';

import { Text, StyleSheet, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { lineThickness } from '../../../../constants/layout';
import { useTheme, ColourSet } from '../../../../context/ThemeContext';
import { Typography } from '../../../../constants/textSize';
import React from 'react';
import Constants from 'expo-constants'


export default function Page() {
  const { colours, theme } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = createStyles(colours, theme, insets.bottom);
  const router = useRouter();
  const setUserOnboaring = useOnboardingStore((s)=> s.set);

  function setDisplayName(display_name: string){
    setUserOnboaring({display_name});

    //debugging
    const devHost = Constants.expoConfig?.hostUri?.split(':')[0];
    const SERVER_URL = process.env.EXPO_PUBLIC_SERVER_URL ?? (devHost ? `http://${devHost}:8000`: "http://localhost:8000")
    console.log('SERVER_URL =', SERVER_URL, '| hostUri =', Constants.expoConfig?.hostUri);


    router.navigate('/(onboarding)/userOnboarding/passcode')
  }

  return (
    <SafeAreaView style={theme.screen}>
      <View style={[theme.header, styles.title]}>
        <Text style={styles.subheading}>Start making that account!</Text>
        <Text style={styles.heading}>Choose a username</Text>
      </View>
      <View style={styles.bottomBar}>
        <TextEntry 
        onSubmit={setDisplayName}
        placeholder='Type here'
        keyboardType='default'
        />
        {/**FIX: link to terms of use and privacy policy */}
        <View style={styles.label}>
          <Text style={styles.subheading}>By signing up, you agree to MPowered's Terms of Use and Privacy Policy</Text>
        </View>
        
      </View>
      
      
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


