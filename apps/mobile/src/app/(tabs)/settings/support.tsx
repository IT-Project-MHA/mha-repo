/**
 * Support page, providing MHA contact details,
 * Details are hardcoded to be always available.
 */
import React, { View, Text, ScrollView } from "react-native";
import { useTheme } from "../../../../context/ThemeContext";

export default function Tab() {
  const { theme, colours } = useTheme();

  return (
    <ScrollView stickyHeaderIndices={[0]}>
      <View style={theme.header}>
        <Text style={[theme.h4, theme.leftText, {color: colours.onBackground}]}>
          Support
        </Text>
      </View>

      <Text> </Text>

      <View style={theme.clearContainer}>
        <Text style={[theme.body, theme.leftText, {color: colours.onBackground}]}>
          Contact us at:{" "}
        </Text>
        <Text> </Text>
        <Text style={[theme.body, theme.centerText, {color: colours.onBackground}]}>
          info@muscha.org
        </Text>

        <Text> </Text>
        <View style={theme.line}></View>
      </View>

      <View style={theme.clearContainer}>
        <Text style={[theme.body, theme.leftText, {color: colours.onBackground}]}>
          B.A.M Helpline:{" "}
        </Text>
        <Text style={theme.xSmall}> </Text>
        <Text style={[theme.xSmall, theme.leftText, {color: colours.onBackground}]}>
          Call the team Monday to Friday 9am – 9pm or email
          helpline@muscha.org{" "}
        </Text>
        <Text> </Text>
        <Text style={[theme.body, theme.centerText, {color: colours.onBackground}]}>
          1800 263 265
        </Text>
        <Text> </Text>

        <View style={theme.line}></View>
      </View>

      <View style={theme.bottomGap} />
    </ScrollView>
  );
}
