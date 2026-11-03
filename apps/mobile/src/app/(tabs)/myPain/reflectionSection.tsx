import { useEffect, useState } from "react";
import { Pressable, Text, StyleSheet } from "react-native";
import { Ionicons } from "@react-native-vector-icons/ionicons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Question } from "../../../../components/baseComponents/Question";
import { apiAssessment } from "@/api/django-API";
import { apiErrorMessage } from "@/api/care_planner_api_helpers";
import { useTheme } from "../../../../context/ThemeContext";

const SECTION_NAME = "My reflection this week"

const MAX_REFLECTION_LENGTH = 300;

export default function ReflectionSection() {
    const { assessmentId } = useLocalSearchParams<{ assessmentId?: string }>();
    const router = useRouter();
    const { colours, theme } = useTheme();

    // undefined while loading, null if there is none
    const [saved, setSaved] = useState<string | null | undefined>(undefined);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!assessmentId) {
            setSaved(null);
            return;
        }
        apiAssessment('select', { id: assessmentId })
            .then((assessment: any) => setSaved(assessment?.reflection ?? null))
            .catch((e: any) => {
                console.warn("Could not load the saved reflection", e);
                setSaved(null);
            });
    }, [assessmentId]);

    const goBack = () => router.navigate('/(tabs)/myPain');

    const saveReflection = async (reflection: string) => {
        setError(null);
        try {
            if (!assessmentId) {
                throw new Error("No assessment to save the reflection to");
            }
            await apiAssessment('update', { id: assessmentId, reflection: reflection || null });
            goBack();
        } catch (saveError) {
            console.error("Failed to save the reflection", saveError);
            setError(apiErrorMessage(saveError, "Your reflection could not be saved, please try again"));
        }
    };

    if (saved === undefined) {
        return null;
    }

    return (
        <SafeAreaView style={{flex: 1}}>
            <Pressable style={styles.backButton} onPress={goBack} accessibilityRole="button" hitSlop={8}>
                <Ionicons name="arrow-back" size={28} color={colours.onBackground} />
                <Text style={[theme.h6, theme.fontOnBackground]}> Back</Text>
            </Pressable>
            <Question
                section={SECTION_NAME}
                title="Notes"
                detail="Write down any reflections on your pain experience and management this week"
                questionType="TextEntry"
                maxLength={MAX_REFLECTION_LENGTH}
                numberOfLines={5}
                optional
                placeholder="Type your reflection or notes here"
                initialAnswer={saved ?? undefined}
                onSubmit={saveReflection}
                error={error} />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
});
