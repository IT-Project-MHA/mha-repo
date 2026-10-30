/**
 * First page of sign-up sequence:
 * - Asks for name (display_name)
 * - Directs user to terms
 */
import { TextEntry } from '../../../../components/answerFields/TextEntry';
import { useRouter } from 'expo-router';
import { useOnboardingStore } from '../../../store/onboardingStorage';

import ButtonWithIcon from '../../../../components/atomicUI/ButtonWithIcon';
import { Text, StyleSheet, View, ScrollView } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { lineThickness } from '../../../../constants/layout';
import { useTheme, ColourSet } from '../../../../context/ThemeContext';
import { Typography } from '../../../../constants/textSize';
import * as WebBrowser from 'expo-web-browser';

import React from 'react';

/**
   * Using a placeholder link for demonstration purposes. When the client 
   * updates up with the PDF we can put it in a google drive, etc. (lots of options)
   * 
   * Client will also be able to update this themselves.
   */
  const TERMS_URL = 'https://s2.q4cdn.com/175719177/files/doc_presentations/Placeholder-PDF.pdf';
  const openTerms = () => WebBrowser.openBrowserAsync(TERMS_URL);
  
  const PRIVACY_URL = 'https://s2.q4cdn.com/175719177/files/doc_presentations/Placeholder-PDF.pdf';
  const openPrivacy = () => WebBrowser.openBrowserAsync(PRIVACY_URL);

export default function Page() {
  const { colours, theme } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = createStyles(colours, theme, insets.bottom);
  const router = useRouter();
  const setUserOnboaring = useOnboardingStore((s)=> s.set);

  function setDisplayName(display_name: string){
    setUserOnboaring({display_name});
    router.navigate('/(onboarding)/userOnboarding/passcode')
  }

  return (
    <ScrollView stickyHeaderIndices={[0]}>
      <View>
      <View style={[theme.header, theme.leftText] }>
        <Text style={[theme.h5, {color: colours.onSurface}]}>Choose a username</Text>
      </View>

        <TextEntry 
        onSubmit={setDisplayName}
        placeholder='Type here'
        keyboardType='default'
        />

        <View style={[theme.centerItems, theme.clearContainer]}>
            <Text style={[theme.xSmall, {color: colours.onSurface}]}>By signing up, you agree to MPowered's Terms of Use and Privacy Policy</Text>
        </View>
        <View style={theme.centerItems}>
        <ButtonWithIcon
	          label="Terms & Conditions"
	          onPress={openTerms}
            buttonType="transparentButton"
            name="arrow-up-right-box-outline"
          />
          <ButtonWithIcon
	          label="Privacy Policy"
	          onPress={openPrivacy}
            buttonType="transparentButton"
            name="arrow-up-right-box-outline"
          />

        </View>
        </View>
    </ScrollView>
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
  });
}


