import React, {useEffect, useRef} from 'react'
import { useTheme } from "../../context/ThemeContext";
import { useWindowDimensions, View, Text } from 'react-native';
import { useVideoPlayer, VideoView, VideoSource } from 'expo-video'

interface Props{
  width: number,
  source: VideoSource,
  isActive?: boolean
  caption: string,
}
const VIDEO_ASPECT_RATIO = 9 / 16 
const VIDEO_WIDTH_FRACTION = 0.6

export function OnboardingSplash1({width, source, isActive, caption}: Props){
  const {theme, colours } = useTheme();
  const player = useVideoPlayer(source,
  (p) => {
    p.loop = true
    p.muted = true
  })

  let videoWidth = width * VIDEO_WIDTH_FRACTION;
  let videoHeight = videoWidth / VIDEO_ASPECT_RATIO;
  
  useEffect(()=>{
    if(isActive){
      player.play();
    }else{
      player.pause();
    }
  }, [isActive])

  return(

      <View style={[{width, flexShrink: 0, alignItems: 'flex-start', justifyContent: 'center', columnGap: 0, flexDirection: 'row', paddingHorizontal: 10}]}>
        <VideoView
          player = {player}
          style={{
            width: videoWidth,
            height: videoHeight,
            overflow: 'hidden',
          }}
          contentFit='contain'
          nativeControls={false}
        />

        <Text style={[theme.xSmall, {color: colours.onBackground,  flex: 1, flexShrink: 1, padding: 5}]}>
        {caption}
        </Text>

      </View>
  )

}