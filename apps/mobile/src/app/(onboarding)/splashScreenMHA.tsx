/**
 * First screen the user sees when they first open the app. Not shown again once onboarding is
 * complete, unless they clear their data.
 */
import React, { useEffect, useMemo, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  useWindowDimensions,
  Animated,
  Easing
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Path, Circle } from "react-native-svg";
import { useRouter } from "expo-router";

import Button from "../../../components/atomicUI/Button";
import { useTheme } from "../../../context/ThemeContext";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const DOT_COUNT = 16;
const DOT_AMPLITUDE = 10; // how far dots rise and fall
const SAMPLES = 16; // keyframes per cycle used to approximate a sine wave
const CYCLE_MS = 7000; // time for the dot ripple to travel one full wavelength

/**
 * builds a repeating wave comes down from the top of the page
 */
function buildTopWave(
  wavelength: number,
  amplitude: number,
  baseY: number,
  minWidth: number
) {
  const half = wavelength / 2;
  const segments = Math.ceil(minWidth / wavelength) * 2 + 2;
  const totalWidth = segments * half;
  let d = `M 0 0 L 0 ${baseY} Q ${half / 2} ${baseY - 2 * amplitude} ${half} ${baseY}`;
  for (let i = 2; i <= segments; i++) {
    d += ` T ${i * half} ${baseY}`; // T mirrors the previous control point, so the wave alternates
  }
  d += ` L ${totalWidth} 0 Z`;
  return { d, totalWidth };
}

type WaveLayerProps = {
  screenWidth: number;
  height: number;
  wavelength: number;
  amplitude: number;
  baseY: number; // where the wave's lower edge sits, measured from the top
  durationMs: number;
  reverse?: boolean;
  fill: string;
  opacity?: number;
};

/**
 * one wave layer that slides sideways
 */
function WaveLayer({
  screenWidth,
  height,
  wavelength,
  amplitude,
  baseY,
  durationMs,
  reverse,
  fill,
  opacity = 1
}: WaveLayerProps) {
  const shift = useRef(new Animated.Value(0)).current;

  const { d, totalWidth } = useMemo(
    () => buildTopWave(wavelength, amplitude, baseY, screenWidth + wavelength),
    [wavelength, amplitude, baseY, screenWidth]
  );

  useEffect(() => {
    shift.setValue(0);
    const loop = Animated.loop(
      Animated.timing(shift, {
        toValue: 1,
        duration: durationMs,
        easing: Easing.linear,
        useNativeDriver: true
      })
    );
    loop.start();
    return () => loop.stop();
  }, [shift, durationMs]);

  const translateX = shift.interpolate({
    inputRange: [0, 1],
    outputRange: reverse ? [-wavelength, 0] : [0, -wavelength]
  });

  return (
    <Animated.View
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: totalWidth,
        height,
        transform: [{ translateX }]
      }}
    >
      <Svg width={totalWidth} height={height}>
        <Path d={d} fill={fill} opacity={opacity} />
      </Svg>
    </Animated.View>
  );
}

type Props = {
  onClose?: () => void;
};

export default function OnboardingSplashScreen({ onClose }: Props) {
  const { colours, theme } = useTheme();
  const router = useRouter();
  const { width, height } = useWindowDimensions();

  const topHeight = Math.max(200, Math.min(height * 0.3, 300)); // height of the wave area
  const dotsY = topHeight * 0.82; // dots ripple around the lower edge of the waves

  const phase = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const ripple = Animated.loop(
      Animated.timing(phase, {
        toValue: 1,
        duration: CYCLE_MS,
        easing: Easing.linear,
        useNativeDriver: false // SVG props can't use the native driver
      })
    );
    ripple.start();
    return () => ripple.stop();
  }, [phase]);

  // each dot's y is a sine of (its position along the row minus time), so the ripple travels
  const dots = useMemo(() => {
    const inputRange = Array.from(
      { length: SAMPLES + 1 },
      (_, k) => k / SAMPLES
    );
    return Array.from({ length: DOT_COUNT }, (_, i) => ({
      x: ((i + 0.5) * width) / DOT_COUNT,
      r: 4 + (i % 3) * 1.5,
      fill: colours.primary,
      cy: phase.interpolate({
        inputRange,
        outputRange: inputRange.map(
          (t) => dotsY + Math.sin(i / 2.2 - 2 * Math.PI * t) * DOT_AMPLITUDE
        )
      })
    }));
  }, [colours.tertiary, colours.primary, phase, width, dotsY]);

  function onNextPressed() {
    onClose ? onClose() : router.push("/");
  }

  return (
    // no top edge, so the waves reach the very top of the screen
    <SafeAreaView
      style={[theme.screen, { flex: 1 }]}
      edges={["bottom", "left", "right"]}
    >
      <View style={styles.container}>
        {/* waves hanging from the top, each layer slides sideways at its own speed */}
        <View
          style={[styles.topWrap, { height: topHeight, overflow: "hidden" }]}
          pointerEvents="none"
        >
          <WaveLayer
            screenWidth={width}
            height={topHeight}
            wavelength={width * 0.9}
            amplitude={14}
            baseY={topHeight * 0.75}
            durationMs={11000}
            reverse
            fill={colours.secondary}
            opacity={0.5}
          />
          <WaveLayer
            screenWidth={width}
            height={topHeight}
            wavelength={width * 1.2}
            amplitude={12}
            baseY={topHeight * 0.55}
            durationMs={8000}
            fill={colours.tertiary}
          />

          {/* dots drawn on top of the waves */}
          <Svg width={width} height={topHeight} style={StyleSheet.absoluteFill}>
            {dots.map((d, i) => (
              <AnimatedCircle
                key={i}
                cx={d.x}
                cy={d.cy}
                r={d.r}
                fill={d.fill}
                opacity={0.9}
              />
            ))}
          </Svg>
        </View>

        <View style={[styles.textBlock, { paddingTop: topHeight + 24 }]}>
          <Text style={[theme.h6, { color: colours.primary }]}>Welcome to</Text>
          <Text style={[theme.h2, styles.title, { color: colours.primary }]}>
            your Mpowered plan
          </Text>
          <Text
            style={[theme.body, styles.subtitle, { color: colours.primary }]}
          >
            Knowledge. Choice. Connection.
          </Text>
        </View>

        <View style={styles.buttonWrap}>
          <Button
            label="Get started"
            onPress={onNextPressed}
            buttonType="roundButton"
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1 },
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
    paddingBottom: 32 }
});
