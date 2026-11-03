/**
 * last page of patient flow. Allows user to enter other conditions
 */
import {
  Text,
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet
} from "react-native";
import { useTheme, ColourSet } from "../../../../context/ThemeContext";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { useOnboardingStore } from "../../../store/onboardingStorage";
import { TextInput, List, IconButton } from "react-native-paper";

const MAX_LENGTH_CONDITION = 100;

const hasCondition = (list: string[], text: string) => list.some((c) => c.toLowerCase() === text.toLowerCase());

export default function Page() {
  const router = useRouter();
  const { theme, colours } = useTheme();
  const styles = createStyles(colours);

  const setUserOnboaring = useOnboardingStore((s) => s.set);
  const { set, reset, ...answers } = useOnboardingStore.getState();
  const health = useOnboardingStore((s) => s.health);

  const [conditions, setConditions] = useState<string[]>([]);
  const [newCondition, setNewCondition] = useState("");

  // appends the typed condition to the list (ignores blanks and duplicates)
  const addCondition = () => {
    const value = newCondition.trim();
    if (!value) return;
    if (!hasCondition(conditions, value)) {
      setConditions((prev) => [...prev, value]);
    }
    setNewCondition("");
  };

  const removeCondition = (index: number) =>
    setConditions((prev) => prev.filter((_, i) => i !== index));

  const handleSubmit = () => {
    // include anything typed but not yet added
    const pending = newCondition.trim();
    const final =
      pending && !hasCondition(conditions, pending)
        ? [...conditions, pending]
        : conditions;

    // saved as newline-separated text
    if (health) {
      setUserOnboaring({
        health: { ...health, other_conditions: final.join("\n") }
      });
    }
    router.navigate("/(onboarding)/accountCreatedSplashScreen");
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
      >
        <View style={[theme.header, theme.leftText]}>
          <Text style={[theme.h5, { color: colours.onSurface }]}>
            Do you have any other conditions?
          </Text>
        </View>

        <View style={theme.layoutContainer}>
          <View style={styles.fieldWrap}>
            <TextInput
              mode="outlined"
              value={newCondition}
              onChangeText={setNewCondition}
              onSubmitEditing={addCondition}
              returnKeyType="done"
              autoCapitalize="sentences"
              placeholder="Type a condition or symptom"
              maxLength={MAX_LENGTH_CONDITION}
              textColor={colours.onSurface}
              outlineColor={colours.secondary}
              activeOutlineColor={colours.primary}
              placeholderTextColor={colours.onSurface}
              outlineStyle={styles.outline}
              style={[styles.field, { fontSize: theme.h6.fontSize }]}
              contentStyle={styles.fieldContent}
              right={
                <TextInput.Icon
                  icon="plus"
                  onPress={addCondition}
                  accessibilityLabel="Add condition"
                />
              }
            />

            {conditions.map((item, index) => (
              <View style={{ padding: 10 }}>
                <List.Item
                  key={`${item}-${index}`}
                  title={item}
                  titleNumberOfLines={0}
                  titleStyle={[theme.body, { color: colours.onSurface }]}
                  style={styles.conditionItem}
                  right={() => (
                    <View style={{ left: 27 }}>
                      <IconButton
                        icon="close"
                        iconColor={colours.onSurface}
                        onPress={() => removeCondition(index)}
                        accessibilityLabel={`Remove ${item}`}
                        size={20}
                      />
                    </View>
                  )}
                />
              </View>
            ))}
          </View>

          <Pressable onPress={handleSubmit} style={styles.button}>
            <Text style={[theme.h6, { color: colours.onSurface }]}>Submit</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function createStyles(colours: ColourSet) {
  return StyleSheet.create({
    fieldWrap: { width: "80%", alignSelf: "center", marginBottom: 24 },
    field: {
      height: 60,
      backgroundColor: "transparent"
    },
    fieldContent: {
      height: 60,
      paddingVertical: 0,
      paddingLeft: 40,
      textAlignVertical: "center"
    },
    outline: {
      borderRadius: 100,
      borderWidth: 2
    },
    conditionItem: {
      paddingVertical: 0,
      borderBottomWidth: 1,
      borderBottomColor: colours.ex3
    },
    button: {
      height: 60,
      width: "80%",
      alignSelf: "center",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 100,
      backgroundColor: colours.primary
    }
  });
}
