/**
 * Segmented control component in pill shape
 */
import React, { useEffect, useRef, useState } from "react";
import { View, Text, Pressable, Animated, StyleProp, ViewStyle, LayoutChangeEvent } from "react-native";
import { useTheme } from "../../context/ThemeContext";

type Props = {
    values: string[]; // labels per segment e.g. ['1M', '3M', 'All']
    selectedIndex: number; // index of the currently selected segment
    onChange: (index: number) => void;
    radius?: number; // how round it is
    style?: StyleProp<ViewStyle>;
};

// gap between the track and the selected segment
const INSET = 3;

/**
 * Segmented control component in pill shape that uses an animated highlight
 * - highlight is one view that slides to the selected segment
 * - segments share the track width equally, so any number of values works
 */
export default function SegmentedPill({ values, selectedIndex, onChange, style, radius = 80,}: Props) {
    const { theme, colours, fontScale } = useTheme();
    const innerRadius = Math.max(0, radius - INSET); // the highlight sits inside the track, so its radius is smaller by the inset
    const [trackWidth, setTrackWidth] = useState(0);
    const segmentWidth = trackWidth > 0 ? (trackWidth - INSET * 2) / values.length : 0;
    const translateX = useRef(new Animated.Value(0)).current; // how far the highlight is shifted right of the first segment in pixels
    const lastWidth = useRef(0); // the segment width the highlight was last positioned for

    // moves the highlight to the selected segment when selection changes
    useEffect(() => {
        if (segmentWidth === 0) return;
        const target = selectedIndex * segmentWidth;
        if (lastWidth.current !== segmentWidth) {
            translateX.setValue(target);
            lastWidth.current = segmentWidth;
        } else {
            Animated.spring(translateX, {
                toValue: target,
                useNativeDriver: true,
                speed: 20,
                bounciness: 4,
            }).start();
        }
    }, [selectedIndex, segmentWidth, translateX]);

    // measures component width to determine track width
    const onLayout = (e: LayoutChangeEvent) => setTrackWidth(e.nativeEvent.layout.width);

    return (
        <View
            accessibilityRole="tablist"
            onLayout={onLayout}
            style={[style, {
                flexDirection: "row", 
                padding: INSET, 
                borderRadius: 
                radius, 
                backgroundColor: colours.tertiary,
                minHeight: 40 * fontScale,
                paddingVertical: 8 * fontScale,
                alignItems: "center",
                justifyContent: "center",
            },
               
            ]}
        >
            {/* 
            * Renders sliding highlight, drawn behind the labels 
            */}
            {segmentWidth > 0 && (
                <Animated.View
                    pointerEvents="none"
                    style={{
                        position: "absolute",
                        top: INSET,
                        bottom: INSET,
                        left: INSET,
                        width: segmentWidth,
                        borderRadius: innerRadius,
                        backgroundColor: colours.ex3,
                        transform: [{ translateX }],
                        minHeight: 30 * fontScale,
                        paddingVertical: 8 * fontScale,
                    }}
                />
            )}

            {/**
             * Loops over the labels in 'values' returning a pressable segment for each label.
             */}
            {values.map((label, i) => {
                const active = i === selectedIndex;
                return (
                    <Pressable
                        key={label}
                        onPress={() => onChange(i)}
                        accessibilityRole="tab"
                        accessibilityState={{ selected: active }}
                        style={{
                            flex: 1,
                            alignItems: "center",
                            justifyContent: "center",
                            minHeight: 40 * fontScale,
                            paddingVertical: 8 * fontScale,
                        }}
                    >
                        <Text
                            numberOfLines={1}
                            style={[
                                theme.small,
                                {color: colours.onSurface, textAlign: 'center'},
                                { fontWeight: active ? "600" : "400" },
                            ]}
                        >
                            {label}
                        </Text>
                    </Pressable>
                );
            })}
        </View>
    );
}