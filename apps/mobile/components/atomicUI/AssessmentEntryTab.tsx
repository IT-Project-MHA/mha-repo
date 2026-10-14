import React from "react";
import { Text, View, StyleSheet} from "react-native";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";
import { useTheme } from "../../context/ThemeContext";
import Button from "../atomicUI/Button";
import { AssessmentProps } from "../baseComponents/Assessment";

export default function AssessmentEntryTab() {
    return(
        <SafeAreaView style={{flexDirection: "row"}}>
            <View style={{flex: 5}}>
                {/* build the box in here, around everything else */}
                <Text>{properties.title}</Text>
                <Text>optional - last completed</Text>
            </View>
            <View style={{flex: 3}}>
                <Button label="Record->" onPress={() => {
                    //stuffinhere
                }} buttonType="borderedTransparentButton"/> // create an outline button
            </View>
        </SafeAreaView>
    )
}

export {AssessmentEntryTab}