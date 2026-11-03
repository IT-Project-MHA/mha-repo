/**
 * creates a wave header inspired by the mha logo.
 */
import React, { useEffect, useMemo, useRef } from "react";
import {
  View,
  StyleSheet,
  useWindowDimensions,
  Animated,
  Easing
} from "react-native";
import Svg, { Path, Circle } from "react-native-svg";
import { useTheme } from "../../context/ThemeContext";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const DOT_COUNT = 16;
const DOT_AMPLITUDE = 10;
const SAMPLES = 16;
const CYCLE_MS = 7000;

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
  for (let i = 2; i <= segments; i++) d += ` T ${i * half} ${baseY}`;
  d += ` L ${totalWidth} 0 Z`; // closes the shape along the top edge
  return { d, totalWidth };
}

type WaveLayerProps = {
  screenWidth: number;
  height: number;
  wavelength: number;
  amplitude: number;
  baseY: number;
  durationMs: number;
  reverse?: boolean;
  fill: string;
  opacity?: number;
};

// renders individual wave
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

  // rebuilds path when input changes
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

  // x shift
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

/**
 * header component, with waves and dots rendered in layers.
 */
export default function WaveHeader({ height }: { height: number }) {
  const { colours } = useTheme();
  const { width } = useWindowDimensions();
  const dotsY = height * 0.82;
  const phase = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const ripple = Animated.loop(
      Animated.timing(phase, {
        toValue: 1,
        duration: CYCLE_MS,
        easing: Easing.linear,
        useNativeDriver: false
      })
    );
    ripple.start();
    return () => ripple.stop();
  }, [phase]);

  const dots = useMemo(() => {
    const inputRange = Array.from(
      { length: SAMPLES + 1 },
      (_, k) => k / SAMPLES
    );
    return Array.from({ length: DOT_COUNT }, (_, i) => ({
      x: ((i + 0.5) * width) / DOT_COUNT,
      r: 4 + (i % 3) * 1.5,
      cy: phase.interpolate({
        inputRange,
        outputRange: inputRange.map(
          (t) => dotsY + Math.sin(i / 2.2 - 2 * Math.PI * t) * DOT_AMPLITUDE
        )
      })
    }));
  }, [phase, width, dotsY]);

  return (
    <View style={{ height, overflow: "hidden" }} pointerEvents="none">
      <WaveLayer
        screenWidth={width}
        height={height}
        wavelength={width * 0.9}
        amplitude={14}
        baseY={height * 0.75}
        durationMs={11000}
        reverse
        fill={colours.primary}
        opacity={0.5}
      />
      <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
        {dots.map((d, i) => (
          <AnimatedCircle
            key={i}
            cx={d.x}
            cy={d.cy}
            r={d.r}
            fill={colours.primary}
            opacity={0.9}
          />
        ))}
      </Svg>
      <WaveLayer
        screenWidth={width}
        height={height}
        wavelength={width * 0.8}
        amplitude={14}
        baseY={height * 0.75}
        durationMs={11000}
        reverse
        fill={colours.secondary}
        opacity={0.5}
      />
      <WaveLayer
        screenWidth={width}
        height={height}
        wavelength={width * 1.5}
        amplitude={12}
        baseY={height * 0.55}
        durationMs={8000}
        fill={colours.tertiary}
        opacity={0.5}
      />
      <WaveLayer
        screenWidth={width}
        height={height}
        wavelength={width * 1}
        amplitude={12}
        baseY={height * 0.55}
        durationMs={8000}
        fill={colours.ex3}
        opacity={0.5}
      />
    </View>
  );
}
