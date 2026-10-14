/**
 * Index for onboarding, is the sign-on page
 */

import { Text, StyleSheet, Modal } from 'react-native';
import {SignInButton} from '../../../components/onboarding/SignInButton';
import { useTheme } from "../../../context/ThemeContext";
import { Router, SplashScreen, useRouter } from 'expo-router';
import {useEffect, useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import OnboardingSplashScreen from './splashScreen';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../../../components/atomicUI/Button';


export default function Page() {
  const { theme } = useTheme();

  //const {signIn, setActive, isLoaded} = /**useSignIn */
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
      <Text style={theme.text}>SIGN IN / ON</Text>
      <Text style={theme.text}>In this section, we can enter the account creation or sign in pages</Text>
        <Modal
        animationType="slide"
        presentationStyle='fullScreen'
        visible={showOnboarding}
        onRequestClose={() => setShowOnboarding(false)}>
          <OnboardingSplashScreen onClose={onFirstLaunchClosed}/>
        </Modal>
      <Button
      label='Create Account'
      onPress={()=>{router.navigate('/(onboarding)/initialPhoneEntry')}}
      buttonType='primaryButton'
      />
      <SignInButton/>
      
    </SafeAreaView>
  );
}

/**
 * <Modal
 * animationType="Slide"
 * PresentationStyle='fullScreen'
 * visible={showOnboarding}
 * onRequestClose={() => setShowOnboarding(false)}>
 * <Onboarding onClose={onFirstLaunchClosed}/>
 * </Modal>
 */