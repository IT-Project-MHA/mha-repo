import React, {useEffect, useRef, useState} from 'react'
import {OnboardingSplashComp} from './OnboardingSplashComp'
import { useTheme } from "../../context/ThemeContext";
import { View } from 'react-native';
import { ResizeMode, Video} from 'expo-av'

interface Props{
  width: number,
  isActive?: boolean
}


export function OnboardingSplash1({width, isActive}: Props){
  const {theme} = useTheme();
  const video = useRef<Video>(null);
  //const video = ;

  useEffect(()=>{
    if(isActive){
      video?.current?.playAsync();
    }else{
      video?.current?.stopAsync();
    }
  }, [isActive])

  return(
    <View>
      <View style={{flex: 1, width}}>
        <Video
          ref={video}
          style={{
            flex: 1,
            backgroundColor: 'transparent',
            borderRadius: 10,
            overflow: 'hidden'
          }}
          source={require('../../assets/onboardingVideos/deleteData.mp4')}
          resizeMode={ResizeMode.COVER}
          isLooping
          isMuted
        />
      </View>
      </View>
    
  )
/**
 * <OnboardingSplashComp width={width}>
 */
}