import React, {useEffect, useRef} from 'react'
import { useTheme } from "../../context/ThemeContext";
import { useWindowDimensions, View } from 'react-native';
import { ResizeMode, Video} from 'expo-av'

interface Props{
  width: number,
  isActive?: boolean
}
const ASPECT_RATIO = 1
const MAX_HEIGHT_FRACTION = 0.6

export function OnboardingSplash1({width, isActive}: Props){
  const {theme} = useTheme();
  const video = useRef<Video>(null);
  const {height: screenHeight} = useWindowDimensions();
  const size = Math.min(width, screenHeight * MAX_HEIGHT_FRACTION * ASPECT_RATIO);

  useEffect(()=>{
    if(isActive){
      video?.current?.playAsync();
    }else{
      video?.current?.stopAsync();
    }
  }, [isActive])

  return(
      <View style={{width, flexShrink: 0, alignItems: 'center', justifyContent: 'center'}}>
        <Video
          ref={video}
          style={{
            width: size,
            height: size / ASPECT_RATIO,
            borderRadius: 10,
            overflow: 'hidden',
          }}
          source={require('../../assets/onboardingVideos/carePlanner_cropped.mp4')}
          resizeMode={ResizeMode.CONTAIN}
          isLooping
          isMuted
        />
      </View>
    
  )
/**
 * <OnboardingSplashComp width={width}>
 */
}