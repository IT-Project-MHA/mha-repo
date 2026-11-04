import React, {useEffect, useState} from 'react'
import { useTheme } from "../../context/ThemeContext";
import { useWindowDimensions, View, Text, Pressable, Modal } from 'react-native';
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

  const [zoomed, setZoomed] = useState(false);
  const screen = useWindowDimensions();

  const zoomWidth = Math.min(screen.width * 0.95, screen.height * 0.85 * VIDEO_ASPECT_RATIO);
  const zoomHeight = zoomWidth / VIDEO_ASPECT_RATIO;

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
        <Pressable
          onPress={() => setZoomed(true)}
          accessibilityRole="button"
          accessibilityLabel={`Zoom in: ${caption}`}
        >
          <VideoView
            player = {player}
            style={{
              width: videoWidth,
              height: videoHeight,
              overflow: 'hidden',
            }}
            contentFit='contain'
            nativeControls={false}
            pointerEvents="none"
          />
        </Pressable>

        <Modal
          visible={zoomed}
          transparent
          animationType="fade"
          onRequestClose={() => setZoomed(false)}
        >
          <Pressable
            onPress={() => setZoomed(false)}
            accessibilityLabel="Close zoomed video"
            style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', alignItems: 'center', justifyContent: 'center' }}
          >
            <VideoView
              player={player}
              style={{ width: zoomWidth, height: zoomHeight }}
              contentFit='contain'
              nativeControls={false}
              pointerEvents="none"
            />
          </Pressable>
        </Modal>

        <Text style={[theme.xSmall, {color: colours.onBackground,  flex: 1, flexShrink: 1, padding: 5}]}>
        {caption}
        </Text>

      </View>
  )

}