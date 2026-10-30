/**
 * First screen user sees when they first open the app. Not shown again once onboarding complete, unless they clear their data.
 */
import { useWindowDimensions, ScrollView, NativeSyntheticEvent, NativeScrollEvent, View, ScrollViewInstance } from 'react-native';

import { useRouter } from 'expo-router';
import { useState, useRef} from 'react'
import Button from '../../../components/atomicUI/Button';
import { OnboardingSplash1 } from '../../../components/onboarding/OnboardingSplash1';

//splash screens are one large animated scroll view
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../context/ThemeContext';
import React from 'react';


type Props = {
  onClose: () => void
}

export default function OnboardingSplashScreen({ onClose}: Props){
  const { colours, theme } = useTheme();

  const screenSize = useWindowDimensions(); //so we can work on many different display sizes
  const scrollRef = useRef<ScrollViewInstance>(null);  //scroll ref
  const [step, setStep] = useState(1);

  const RELALTIVE_SIZE = 0.9; //how big should the splash be relative to the screen
  const ITEM_SIZE = screenSize.width * RELALTIVE_SIZE;
  const ITEM_MARGIN = 40;
  const INTERVAL = ITEM_SIZE+ITEM_MARGIN;
  const SIDE_PADDING = (screenSize.width-ITEM_SIZE) / 2; //centers items

  const router = useRouter();

  function onScroll(scrollEvent: NativeSyntheticEvent<NativeScrollEvent>){
    const next = Math.round(scrollEvent.nativeEvent.contentOffset.x / INTERVAL)+1;
    setStep(next);
  }


  function onNextPressed(){
    //close the modal to go to sign-on
    onClose ? onClose(): router.push('/')
  }

  return (
    <SafeAreaView style={[theme.screen, {flex: 1}]}>
    <View style={{flex:1}}>
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={INTERVAL}
        snapToAlignment='start'
        decelerationRate='fast'
        onScroll={onScroll}
        scrollEventThrottle={16}
        style={[{flex:1}, theme.screen]}
        contentContainerStyle={{
          paddingHorizontal: SIDE_PADDING,
          paddingVertical: ITEM_MARGIN,
          columnGap: ITEM_MARGIN,
        }}
        >

          <OnboardingSplash1
          width={ITEM_SIZE}
          isActive={step==1}/>
          <OnboardingSplash1
          width={ITEM_SIZE}
          isActive={step==2}/>
      </ScrollView>
      <View>
        <Button 
        label='Next'
        onPress={onNextPressed}
        buttonType='roundButton'></Button>
      </View>
    </View>
  </SafeAreaView>
  )
}
