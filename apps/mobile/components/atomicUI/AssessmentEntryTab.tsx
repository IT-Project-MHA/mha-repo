import React from "react";
import { Text, View, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@react-native-vector-icons/ionicons";
import { useTheme } from "../../context/ThemeContext";
import { formatDate } from "../../constants/date";

type AssessmentEntryProps = {
    title: string;
    onButtonPress: () => void;
    completedAt?: string | null; // ISO datetime
}

export default function AssessmentEntryTab({title, onButtonPress, completedAt}: AssessmentEntryProps) {
    const { theme, colours } = useTheme();
    return(
        <Pressable style={styles.row} onPress={onButtonPress} accessibilityRole="button">
            <View style={styles.info}>
                <Text style={[theme.h6, theme.fontOnSurface]}>{title}</Text>
                {!!completedAt && (
                    <Text style={[theme.body, theme.fontOnSurface]}>Updated on {formatDate(new Date(completedAt))}</Text>
                )}
            </View>
            <Ionicons name="chevron-forward-outline" size={16} color={colours.onSurface} />
        </Pressable>
    )
}

const styles = StyleSheet.create({
    row: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        paddingBlock: 18,
        width: "85%",
        alignSelf: "center",
    },
    info: {
        flex: 1,
        gap: 4,
    },
});

export {AssessmentEntryTab}
