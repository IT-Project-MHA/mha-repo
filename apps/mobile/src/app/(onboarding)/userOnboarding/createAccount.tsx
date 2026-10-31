/**
 * First page of sign-up sequence:
 * - Asks for name (display_name)
 * - Directs user to terms
 */
import { TextEntry } from '../../../../components/answerFields/TextEntry';
import { useRouter } from 'expo-router';
import { useOnboardingStore } from '../../../store/onboardingStorage';

import ButtonWithIcon from '../../../../components/atomicUI/ButtonWithIcon';
import { Text, View, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, ColourSet } from '../../../../context/ThemeContext';
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
        <Text style={[theme.h5, {color: colours.onSurface}]}>Enter Your Name</Text>
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
            textStyle={{color: colours.onSurface}}
          />
          <ButtonWithIcon
	          label="Privacy Policy"
	          onPress={openPrivacy}
            buttonType="transparentButton"
            name="arrow-up-right-box-outline"
            textStyle={{color: colours.onSurface}}
          />
        </View>
      </View>
    </ScrollView>
  );
}


