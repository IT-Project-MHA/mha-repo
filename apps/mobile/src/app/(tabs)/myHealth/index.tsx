/**
 * 'Patients' and 'Both' users can access this screen (exclusive support people can not)
 *
 * My Heath index should include:
 *  - My Records
 *      – includes: chart & history section
 *      – chart: graph where you can select time periods and it shows scores
 *      – history: select based on time frame
 *  – My Prescriptions
 *  – My Pain Profile
 */
import React, { View, Text, StyleSheet, ScrollView } from "react-native";
import ButtonWithIcon from "../../../../components/atomicUI/ButtonWithIcon";
import { useRouter } from "expo-router";
import { useTheme, ColourSet } from "../../../../context/ThemeContext";
import AveragePainChart from "../../../../components/graphics/averagePainChart";

export default function Screen() {
  const router = useRouter();
  const { theme, colours } = useTheme();

  return (
    <ScrollView stickyHeaderIndices={[0]}>
      <View style={theme.header}>
        <Text
          style={[theme.h4, theme.leftText, { color: colours.onBackground }]}
        >
          My Health
        </Text>
        <Text style={[theme.leftText, theme.small, {color: colours.onBackground, marginVertical: 10}]}>
          Your progress, in one place.
        </Text>
      </View>

      {/** My Pain summary */}
      <View style={[theme.sectionContainer]}>
        <Text
          style={[
            theme.h5,
            theme.leftText,
            { color: colours.onSurface, marginVertical: 15 }
          ]}
        >
          My Pain Summary
        </Text>
        <View style={theme.line} />

        <View style={{ padding: 15 }}>
          <AveragePainChart />
        </View>

        <View
          style={[
            theme.layoutContainer,
            theme.centerItems,
            { marginBottom: 15 }
          ]}
        >
          <ButtonWithIcon
            label="My Pain Profile"
            onPress={() => router.navigate("/myHealth/painProfile")}
            buttonType="roundButton"
            name="chevron-forward-outline"
            textStyle={{ color: colours.onTertiary }}
          />
        </View>
      </View>

      {/* My Health Tracking History */}
      <View style={theme.sectionSeparation}/>
      <View style={[theme.sectionContainer]}>
        <Text
          style={[
            theme.h5,
            theme.leftText,
            { color: colours.onSurface, marginVertical: 15 }
          ]}
        >
          My Health Tracking History
        </Text>
        <View style={theme.line} />

        <View style={{ padding: 15 }}>
          <Text style={[theme.small, { color: colours.onSurface }]}>
            View your assessment history and generate a graph of your pain over
            time.
          </Text>
        </View>

        <View
          style={[
            theme.layoutContainer,
            theme.centerItems,
            { marginBottom: 15 }
          ]}
        >
          <ButtonWithIcon
            label="My Assessment Records"
            onPress={() => router.navigate("/myHealth/healthTracking")}
            buttonType="roundButton"
            name="chevron-forward-outline"
            textStyle={{ color: colours.onTertiary }}
          />
        </View>
      </View>

      

      {/* My Prescriptions */}
      <View style={theme.sectionSeparation}/>
      <View style={[theme.sectionContainer]}>
        <Text
          style={[
            theme.h5,
            theme.leftText,
            { color: colours.onSurface, marginVertical: 15 }
          ]}
        >
          My Prescriptions
        </Text>
        <View style={theme.line} />

        <View style={{ padding: 15 }}>
          <Text style={[theme.small, { color: colours.onSurface }]}>
            View your active prescriptions and recommended dosages.
          </Text>
        </View>

        <View
          style={[
            theme.layoutContainer,
            theme.centerItems,
            { marginBottom: 15 }
          ]}
        >
          <ButtonWithIcon
            label="My Prescriptions"
            onPress={() => router.navigate("/myHealth/prescriptions")}
            buttonType="roundButton"
            name="chevron-forward-outline"
            textStyle={{ color: colours.onTertiary }}
          />
        </View>
      </View>
 
      <View style={theme.bottomGap} />
      <View style={theme.bottomGap} />
    </ScrollView>
  );
}

function createStyles(colours: ColourSet) {
  return StyleSheet.create({});
}
