import React from "react";
import { Text, View, StyleSheet} from "react-native";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";
import { useTheme } from "../../context/ThemeContext";
import Button from "../atomicUI/Button";
import { AssessmentProps } from "../baseComponents/Assessment";

type AssessmentEntryProps = {
    onButtonPress: () => void;
    props?: AssessmentProps;
}

export default function AssessmentEntryTab({onButtonPress, props}: AssessmentEntryProps) {
    const { theme } = useTheme();
    let completeString;
    if (true /*backend call */) {
        completeString = "Updated on " + "19" + " " + "October" + " " + "2026"; // split up into backend call
    } else {
        completeString = "";
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