import React from "react";
import { Text, View, StyleSheet} from "react-native";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";
import { useTheme } from "../../context/ThemeContext";
import Button from "../atomicUI/Button";
import { AssessmentProps } from "../baseComponents/Assessment";

type AssessmentEntryProps = {
    onButtonPress: () => void;
    assessment: Promise<any>;
    assessmentCall: (operation: any, values: any) => Promise<any>;
    props?: AssessmentProps;
}

async function loadAssessmentCategory(assessmentEnter: any, assessmentCall: (operation: any, values: any) => Promise<any>) {
  let temp = assessmentCall('select', {assessment: assessmentEnter});
  if (temp == null) {
    return assessmentCall('create', {assessment: assessmentEnter})
  } else {
    return temp;
  }
}

export default function AssessmentEntryTab({onButtonPress, assessment, assessmentCall, props}: AssessmentEntryProps) {
    const { theme } = useTheme();
    const category = loadAssessmentCategory(assessment, assessmentCall);
    let completeString;
    if (completeString == null) {
        // nothing
    } else {
        completeString = "Updated on " + "19" + " " + "October" + " " + "2026"; // split up into backend call
    }
    return(
        <SafeAreaView style={[theme.outlinedContainer, {flexDirection: "row", padding: 5, width: '70%', justifyContent: "space-between"}]}>
            <View>
                {/* build the box in here, around everything else */}
                <Text style={[theme.h6, theme.fontOnSurface]}>{props?.title}</Text>
                <Text style={[theme.fontOnSurfaceDull]}>{completeString}</Text>
            </View>
            <View>
                <Button label="Record" onPress={onButtonPress} buttonType="roundedTertiaryButton"/>
            </View>
        </SafeAreaView>
    )
}

export {AssessmentEntryTab}