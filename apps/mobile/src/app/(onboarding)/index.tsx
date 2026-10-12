/**
 * Index for onboarding, is the sign-on page
 */

import { View, Text, StyleSheet, Modal } from 'react-native';
import {SignInButton} from '../../../components/onboarding/SignInButton'
import { useTheme } from "../../../context/ThemeContext";
import { Router, SplashScreen, useRouter } from 'expo-router';
import {useEffect, useState} from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import OnboardingSplashScreen from './splashScreen'


export default function Page() {
  const { theme } = useTheme();

  //const {signIn, setActive, isLoaded} = /**useSignIn */
  const router = useRouter();

  const [showOnboarding, setShowOnboarding] = useState(false);
  const [emailAdress, setEmailAddress] = useState('');
  const [pin, setPin] = useState('');


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
    <View style={theme.container}>
      <Text style={theme.text}>SIGN IN / ON</Text>
      <Text style={theme.text}>In this section, we can enter the account creation or sign in pages</Text>
        <Modal
        animationType="slide"
        presentationStyle='fullScreen'
        visible={showOnboarding}
        onRequestClose={() => setShowOnboarding(false)}>
          <OnboardingSplashScreen onClose={onFirstLaunchClosed}/>
        </Modal>
      <SignInButton/>
    </View>
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