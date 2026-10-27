import React, {useEffect, useRef} from 'react'
import { useTheme } from "../../context/ThemeContext";
import { useWindowDimensions, View } from 'react-native';
import { useVideoPlayer, VideoView} from 'expo-video'
import { SafeAreaView } from 'react-native-safe-area-context';

interface Props{
  width: number,
  isActive?: boolean
}
const ASPECT_RATIO = 1
const MAX_HEIGHT_FRACTION = 0.6

export function OnboardingSplash1({width, isActive}: Props){
  const {theme} = useTheme();
  const player = useVideoPlayer(require('../../assets/onboardingVideos/carePlanner_cropped.mp4'),
  (p) => {
    p.loop = true
    p.muted = true
  })

  const {height: screenHeight} = useWindowDimensions();
  const size = Math.min(width, screenHeight * MAX_HEIGHT_FRACTION * ASPECT_RATIO);

  useEffect(()=>{
    if(isActive){
      player.play();
    }else{
      player.pause();
    }
  }, [isActive])

  return(

      <View style={{width, flexShrink: 0, alignItems: 'center', justifyContent: 'center'}}>
        <VideoView
          player = {player}
          style={{
            width: size,
            height: size / ASPECT_RATIO,
            borderRadius: 10,
            overflow: 'hidden',
          }}
          contentFit='contain'
          nativeControls={false}
        />
      </View>
  )
/**
 * <OnboardingSplashComp width={width}>
 */
}