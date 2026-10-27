/**
 * Index for onboarding, is the sign-on page
 */

import { Text, StyleSheet, Modal, View } from 'react-native';
import {SignInButton} from '../../../components/onboarding/SignInButton';

import { useRouter } from 'expo-router';
import {useEffect, useState} from 'react';
import OnboardingSplashScreen from './splashScreen';
import Button from '../../../components/atomicUI/Button';

import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { lineThickness } from '../../../constants/layout';
import { useTheme, ColourSet } from '../../../context/ThemeContext';
import { Typography } from '../../../constants/textSize';
import React from 'react';

export default function Page() {
  const { colours, theme } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = createStyles(colours, theme, insets.bottom);
  const router = useRouter();


  const [showOnboarding, setShowOnboarding] = useState(false);


  useEffect(()=>{
    async function checkIfOnboarded(){
      //const firstLaunchVal = await AsyncStorage.getItem(LocalConfig.IsOnboarded);
      const isOnboarded = false;
      if (!isOnboarded){
        setShowOnboarding(true);
      }
    }
    checkIfOnboarded();
  }, [])

  async function onFirstLaunchClosed(){
    //await AsyncStorage.setItem(LocalConfig.IsOnboarded, 'true');
    setShowOnboarding(false);
  }



  return (
    <SafeAreaView style={theme.screen}>
      <View style={[theme.header, styles.title]}>
        <Text style={styles.subheading}>Lets get you started</Text>
        <Text style={styles.heading}>Sign In or Create an account</Text>
      </View> 
         <Modal 
        animationType="slide"
        presentationStyle='fullScreen'
        visible={showOnboarding}
        onRequestClose={() => setShowOnboarding(false)}>
          <OnboardingSplashScreen onClose={onFirstLaunchClosed}/>
       </Modal>
      <View style={styles.bottomBar}>
        <Button
        label='Create Account'
        onPress={()=>{router.navigate('/(onboarding)/userOnboarding/createAccount')}}
        buttonType='roundSecondaryButton'
        />
        <SignInButton/>
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
