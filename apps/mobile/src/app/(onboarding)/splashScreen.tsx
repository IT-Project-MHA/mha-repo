/**
 * First screen user sees when they first open the app. Not shown again once onboarding complete, unless they clear their data.
 */
import {
  useWindowDimensions,
  ScrollView,
  NativeSyntheticEvent,
  NativeScrollEvent,
  View,
  ScrollViewInstance
} from "react-native";

import { useRouter } from "expo-router";
import { useState, useRef } from "react";
import Button from "../../../components/atomicUI/Button";
import { OnboardingSplash1 } from "../../../components/onboarding/OnboardingSplash1";
import WaveHeader from "@/components/onboarding/WaveHeader";

//splash screens are one large animated scroll view
import {
  SafeAreaView,
  useSafeAreaInsets
} from "react-native-safe-area-context";
import { useTheme } from "../../../context/ThemeContext";
import React from "react";
import { Text, StyleSheet } from "react-native";

type Props = {
  onClose: () => void;
};

export default function OnboardingSplashScreen({ onClose }: Props) {
  const { colours, theme } = useTheme();

  const screenSize = useWindowDimensions(); //so we can work on many different display sizes
  const scrollRef = useRef<ScrollViewInstance>(null); //scroll ref
  const [step, setStep] = useState(1);

  const RELALTIVE_SIZE = 0.9; //how big should the splash be relative to the screen
  const ITEM_SIZE = screenSize.width * RELALTIVE_SIZE;
  const ITEM_GAP = 4;            // space between slides (was 40)
  const ITEM_VERTICAL_PAD = 40; 
  const INTERVAL = ITEM_SIZE + ITEM_GAP;
  const SIDE_PADDING = (screenSize.width - ITEM_SIZE) / 2; //centers items

  const { width, height } = useWindowDimensions();
  const waveHeight = Math.max(140, Math.min(height * 0.2, 220));

  const router = useRouter();

  function onScroll(scrollEvent: NativeSyntheticEvent<NativeScrollEvent>) {
    const next =
      Math.round(scrollEvent.nativeEvent.contentOffset.x / INTERVAL) + 1;
    setStep(next);
  }

  function onNextPressed() {
    //close the modal to go to sign-on
    onClose ? onClose() : router.push("/");
  }

  return (
    <SafeAreaView style={[theme.screen, { flex: 1 }]}>
      <View style={{ flex: 1 }}>
        <WaveHeader height={waveHeight} />

        <View style={[styles.textBlock, { paddingTop: 24 }]}>
          <Text style={[theme.h6, { color: colours.primary }]}>Welcome to</Text>
          <Text style={[theme.h2, styles.title, { color: colours.primary }]}>
            your Mpowered plan
          </Text>
          <Text
            style={[
              theme.body,
              styles.subtitle,
              { color: colours.primary, marginVertical: 40 }
            ]}
          >
            Knowledge. Choice. Connection.
          </Text>
        </View>

        <ScrollView
          ref={scrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={INTERVAL}
          snapToAlignment="start"
          decelerationRate="fast"
          onScroll={onScroll}
          scrollEventThrottle={16}
          style={[{ flex: 1 }, theme.screen]}
          contentContainerStyle={{
            paddingHorizontal: SIDE_PADDING,
            paddingVertical: ITEM_VERTICAL_PAD,
            columnGap: ITEM_GAP
          }}
        >
          <OnboardingSplash1
            width={200}
            source={require('../../../assets/onboardingVideos/assessments.mp4')}
            isActive={step == 1}
            caption="Track your pain and its impacts weekly"
          />
          <OnboardingSplash1
            width={200}
            source={require('../../../assets/onboardingVideos/assessments.mp4')}
            isActive={step == 2}
            caption="Easily share your pain logs to your healthcare professionals"
          />

          <OnboardingSplash1
            width={200}
            source={require('../../../assets/onboardingVideos/assessments.mp4')}
            isActive={step == 2}
            caption="Share your plan with family, friends and carers"
          />



        </ScrollView>
        <View style={{ marginVertical: 40 }}>
          <Button
            label="Next"
            onPress={onNextPressed}
            buttonType="roundButton"
          ></Button>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  topWrap: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0
  },
  textBlock: {
    paddingHorizontal: 32,
    gap: 6
  },
  title: {
    fontWeight: "500"
  },
  subtitle: {
    marginTop: 12
  },
  buttonWrap: {
    alignItems: "center",
    marginTop: "auto",
    paddingBottom: 32
  }
});
