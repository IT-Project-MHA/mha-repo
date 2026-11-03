/**
 * First page of sign-up sequence:
 * - Asks for name (display_name)
 * - Directs user to terms
 */
import { TextEntry } from '../../../../components/onboarding/onboardingFields/TextEntryOnboarding';
import { useRouter } from 'expo-router';
import { useOnboardingStore } from '../../../store/onboardingStorage';

import { Text, View, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useTheme } from '../../../../context/ThemeContext';
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
    <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >

    <ScrollView
      contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
    >
      <View style={[theme.header, theme.leftText] }>
        <Text style={[theme.h5, {color: colours.onSurface}]}>What's Your Name?</Text>
      </View>

        
        <View>
        <TextEntry 
        onSubmit={setDisplayName}
        placeholder='Enter Your Name'
        keyboardType='default'
        />
        </View>
       

      {/**
       * 
       *  <View style={[theme.centerItems, theme.layoutContainer, {paddingHorizontal: 30}]}>
            <Text style={[theme.xSmall, {color: colours.onSurface}]}>By signing up, you agree to MPowered's Terms of Use and Privacy Policy</Text>
        </View>

        <View style={[theme.clearContainer]}>
        <View style={{marginVertical: 10}}>
        <TextWithIconButton
	          label="Terms & Conditions"
	          onPress={openTerms}
            iconName="arrow-up-right-box-outline"
            fontColour={colours.onBackground}
          />
        </View>
        <View style={{marginVertical: 10}}>
          <TextWithIconButton
	          label="Privacy Policy"
	          onPress={openPrivacy}
            iconName="arrow-up-right-box-outline"
            fontColour={colours.onBackground}
          />
         </View>
         </View>
       * 
       */}



    </ScrollView>
     </KeyboardAvoidingView>
  );
}

