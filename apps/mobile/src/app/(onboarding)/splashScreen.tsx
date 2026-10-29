/**
 * First screen user sees when they first open the app. Not shown again once onboarding complete, unless they clear their data or some such
 */

import { useWindowDimensions, ScrollView, NativeSyntheticEvent, NativeScrollEvent, View, StyleSheet } from 'react-native';

import { useRouter } from 'expo-router';
import { useState, useRef} from 'react'
import Button from '../../../components/atomicUI/Button';
import { OnboardingSplash1 } from '../../../components/onboarding/OnboardingSplash1';

//splash screens are one large animated scroll view
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { lineThickness } from '../../../constants/layout';
import { useTheme, ColourSet } from '../../../context/ThemeContext';
import { Typography } from '../../../constants/textSize';
import React from 'react';


type Props = {
  onClose: () => void
}

export default function OnboardingSplashScreen({ onClose}: Props){
  const { colours, theme } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = createStyles(colours, theme, insets.bottom);

  const screenSize = useWindowDimensions(); //so we can work on many different display sizes
  const scrollRef = useRef<ScrollView>(null);  //scroll ref
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
      <View style={styles.bottomBar}>
        <Button 
        label='Next'
        onPress={onNextPressed}
        buttonType='roundButton'></Button>
      </View>
    </View>
  </SafeAreaView>
  )
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
       bottom: bottomInset,
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
 