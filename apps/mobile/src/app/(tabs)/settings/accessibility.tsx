/**
 * Accessibility page
 *
 * User can change colour themes and font size.
 * Dark mode, high contrast and text size are saved to the server (via ThemeContext).
 */
import React, { View, Text, ScrollView } from "react-native";
import { useTheme } from "../../../../context/ThemeContext";
import TextDropdown from "../../../../components/atomicUI/TextDropdown";
import Toggle from "../../../../components/atomicUI/Toggle";

export default function Tab() {
  const { theme, setDarkMode, setHighContrast, isDark, isHC, colours } = useTheme();

  /**
   * Function that runs when the theme toggle is pressed
   * light mode -> dark mode
   *
   * The dark mode preference is applied and saved to the server.
   */
  const toggleColour = () => setDarkMode(!isDark);

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

      <View style={theme.sectionContainer}>
        <View style={theme.row}>
          <Text style={[theme.body, theme.leftText, {color: colours.onSurface, marginVertical: 15}]}>
            Dark Mode
          </Text>
          <Toggle onToggle={toggleColour} switchOn={isDark} />
        </View>

        <View style={theme.line} />
    
        <View style={theme.row}>
          <Text style={[theme.body, theme.leftText, {color: colours.onSurface, marginVertical: 15}]}>
            High Contrast
          </Text>
          <Toggle onToggle={toggleContrast} switchOn={isHC} />
        </View>

        <View style={theme.line} />


        <Text style={[theme.body, theme.leftText, {color: colours.onSurface, marginTop: 15}]}>
          Adjust Text Size
        </Text>

        <View style={[theme.centerItems, theme.layoutContainer, {marginVertical: 15}]}>
          <TextDropdown />
        </View>
      </View>

      <View style={theme.bottomGap} />
    </ScrollView>
  );
}
