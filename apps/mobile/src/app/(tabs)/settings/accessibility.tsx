/**
 * Accessibility page
 *
 * User can change colour themes and font size.
 * High contrast and text size are saved to the server (via ThemeContext),
 * Dark mode is device only.
 */
import React, { View, Text, ScrollView } from "react-native";
import { useTheme } from "../../../../context/ThemeContext";
import TextDropdown from "../../../../components/atomicUI/TextDropdown";
import Toggle from "../../../../components/atomicUI/Toggle";

export default function Tab() {
  const { theme, setMode, setHighContrast, isDark, isHC, colours } = useTheme();

  /**
   * Function that runs when the theme toggle is pressed
   * light mode -> dark mode
   *
   * Dark mode is device only, and will change based on the phones settings.
   */
  const toggleColour = () =>
    setMode(isDark ? (isHC ? "lightHC" : "light") : isHC ? "darkHC" : "dark");

  /**
   * Function that runs when the contrast toggle is pressed
   *
   * High contrast mode preference is applied and saved to server.
   */
  const toggleContrast = () => setHighContrast(!isHC);

  return (
    <ScrollView stickyHeaderIndices={[0]}>
      <View style={theme.header}>
        <Text style={[theme.h4, theme.leftText, {color: colours.onSurface}]}>
          Accessibility
        </Text>
      </View>

      <Text> </Text>
      <View style={theme.sectionContainer}>
        <View style={theme.row}>
          <Text style={[theme.body, theme.leftText, {color: colours.onSurface}]}>
            Dark Mode
          </Text>
          <Toggle onToggle={toggleColour} switchOn={isDark} />
        </View>

        <Text> </Text>
        <View style={theme.line} />
        <Text> </Text>

        <View style={theme.row}>
          <Text style={[theme.body, theme.leftText, {color: colours.onSurface}]}>
            High Contrast
          </Text>
          <Toggle onToggle={toggleContrast} switchOn={isHC} />
        </View>

        <Text> </Text>
        <View style={theme.line} />

        <Text> </Text>

        <Text style={[theme.body, theme.leftText, {color: colours.onSurface}]}>
          Adjust Text Size
        </Text>

        <View style={theme.centerItems}>
          <TextDropdown />
        </View>
      </View>

      <View style={theme.bottomGap} />
    </ScrollView>
  );
}
