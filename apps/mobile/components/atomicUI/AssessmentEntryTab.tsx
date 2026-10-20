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
    return(
        <SafeAreaView style={[theme.clearContainer, {flexDirection: "row"}, {padding: 5}]}>
            <View style={{justifyContent: "flex-start"}}>
                {/* build the box in here, around everything else */}
                <Text style={theme.fontOnSurface}>title here</Text>
                <Text style={theme.fontOnSurface}>optional - last completed</Text>
            </View>
            <View style={{justifyContent: "flex-end"}}>
                <Button label="Record->" onPress={onButtonPress} buttonType="borderedTransparentButton"/>
            </View>
        </SafeAreaView>
    )
}

export {AssessmentEntryTab}