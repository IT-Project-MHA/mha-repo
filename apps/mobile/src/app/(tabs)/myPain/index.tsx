/**
 * Home screen for patients.
 */
import { Fragment, useCallback, useState } from "react";
import { View, ScrollView, Text, StyleSheet } from "react-native";
import { ProgressBar } from "react-native-paper";
import { AssessmentEntryTab } from "../../../../components/atomicUI/AssessmentEntryTab";
import TextButton from "../../../../components/atomicUI/TextButton";
import { RoutePath, useFocusEffect, useRouter } from "expo-router";
import { useTheme, ColourSet } from "../../../../context/ThemeContext";
import { toApiDate, weekRangeLabel } from "../../../../constants/date";
import {
  apiUser,
  apiAssessment,
  apiMyPain,
  apiMyMovement,
  apiMyPersonalCare,
  apiMySocialHealth,
  apiMyManagement
} from "@/api/django-API";
import { useSafeAreaInsets } from "react-native-safe-area-context";

async function retrieveUserName() {
  const [user] = await apiUser("select");
  return user.display_name;
}

async function FindCurrAssessment(lastMonday: string) {
  const [assessment] = await apiAssessment("select", {
    week_starting: lastMonday
  });
  return assessment;
}

// Gets this week's assessment, creating it if the user hasn't started one yet.
async function GetOrCreateCurrAssessment() {
  const currentDate = new Date();
  FindLastMonday(currentDate);
  const lastMonday = toApiDate(currentDate);
  const currAssessment = await FindCurrAssessment(lastMonday);
  if (currAssessment != null) {
    return currAssessment;
  }
  return apiAssessment("create", { week_starting: lastMonday });
}

// async function loadCategory(assessment: any, category: string) {
//   let category = away api
// }

export default function Tab() {
  const router = useRouter();
  const { theme, colours } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = createStyles(colours, insets.bottom);

  const lastMonday = new Date();

  const timeMessage = SetTimeMessage(lastMonday);

  FindLastMonday(lastMonday);

  const [userName, setUserName] = useState("");

  let openAssessment = async (pathname: RoutePath) => {
    try {
      const currAssessment = await GetOrCreateCurrAssessment();
      router.navigate({
        pathname,
        params: { assessmentId: currAssessment.id }
      });
    } catch (e) {
      console.warn("Could not load this week's assessment", e);
    }
  };

  let reflectionFunction = () =>
    openAssessment("/(tabs)/myPain/reflectionSection");
  let painSectionFunction = () => openAssessment("/(tabs)/myPain/painSection");
  let movementSectionFunction = () =>
    openAssessment("/(tabs)/myPain/movementSection");
  let personalCareSectionFunction = () =>
    openAssessment("/(tabs)/myPain/personalCareSection");
  let socialHealthSectionFunction = () =>
    openAssessment("/(tabs)/myPain/socialHealthSection");
  let managementSectionFunction = () =>
    openAssessment("/(tabs)/myPain/managementSection");

  const sections = [
    { title: "My Pain", onPress: painSectionFunction, call: apiMyPain },
    {
      title: "My Movement",
      onPress: movementSectionFunction,
      call: apiMyMovement
    },
    {
      title: "My Personal Care",
      onPress: personalCareSectionFunction,
      call: apiMyPersonalCare
    },
    {
      title: "My Social Health",
      onPress: socialHealthSectionFunction,
      call: apiMySocialHealth
    },
    {
      title: "My Management",
      onPress: managementSectionFunction,
      call: apiMyManagement
    }
  ];

  // list of completion dates by title {sectionTitle: completionDate}
  const [completedAt, setCompletedAt] = useState<Record<string, string>>({});
  // sets completedAt
  useFocusEffect(
    // reload when page is accessed
    useCallback(() => {
      retrieveUserName()
        .then(setUserName)
        .catch((e) => console.warn("Could not load the user's name", e));
      const loadCompleted = async () => {
        try {
          const currAssessment = await FindCurrAssessment(
            toApiDate(lastMonday)
          );
          // if an assessment id doesn't exist, then no section has been opened
          if (currAssessment == null) {
            setCompletedAt({});
            return;
          }
          const records = await Promise.all(
            sections.map(({ call }) =>
              call("select", { assessment: currAssessment.id })
            )
          );
          setCompletedAt(
            Object.fromEntries(
              sections.flatMap(({ title }, i) => {
                // takes records[section][0] (API call returned as an array)
                const done = records[i][0]?.completed_at;
                return done ? [[title, done]] : [];
              })
            )
          );
        } catch (e) {
          console.warn("Could not load which sections are done", e);
        }
      };
      loadCompleted();
    }, [])
  );

  let welcomeString = "Good " + timeMessage + (userName ? ", " + userName : ""); // no comma when loading
  let nCompleted = Object.keys(completedAt).length;
  let weekLabel = weekRangeLabel(toApiDate(lastMonday));

  return (
    <ScrollView
      stickyHeaderIndices={[0]}
      contentContainerStyle={styles.content}
    >
      <View style={theme.header}>
        <Text
          style={[theme.h4, theme.leftText, { color: colours.onBackground }]}
        >
          {welcomeString}
        </Text>
        <Text
          style={[
            theme.leftText,
            theme.small,
            { color: colours.onBackground, marginTop: 10 }
          ]}
        >
          Let's build your MPowered plan.
        </Text>
        <View style={{ paddingHorizontal: 20 }}>
          <ProgressBar
            progress={nCompleted / sections.length}
            color={colours.tertiary}
            style={{
              height: 15,
              borderRadius: 30,
              backgroundColor: colours.ex3,
              marginTop: 16
            }}
          />
        </View>
      </View>
      
      <View style={[theme.layoutContainer, theme.centerItems]}>
      <Text style={[theme.fontOnBackground, theme.body]}>
        You've completed {nCompleted}/{sections.length} assessments this week
        {nCompleted === sections.length ? "! 🔥" : "."}
      </Text>
      </View>

      <View style={[theme.sectionContainer, theme.centerItems]}>
        <View style={[theme.layoutContainer, theme.leftItems, {marginVertical: 15}]}>
          <Text style={[theme.fontOnSurface, theme.h5]}>{weekLabel}</Text>
        </View>

        <View style={theme.line}/>

        {sections.map((section, index) => (
          <Fragment key={section.title}>
            {index > 0 && <View style={theme.line} />}
            <AssessmentEntryTab
              title={section.title}
              onButtonPress={section.onPress}
              completedAt={completedAt[section.title]}
            />
          </Fragment>
        ))}

        <View
          style={[theme.layoutContainer, theme.rightItems, {marginVertical: 15}]}
        >
          <TextButton
            label="Add a reflection for this week"
            fontColour={colours.onSurface}
            onPress={reflectionFunction}
          />
        </View>
      </View>
    </ScrollView>
  );
}

export function FindLastMonday(currDate: Date) {
  currDate.setDate(currDate.getDate() - ((currDate.getDay() + 6) % 7));
  return;
}

export function SetTimeMessage(currTime: Date) {
  let timeMessage = "day";
  var time = new Date().getHours();
  if (time >= 5 && time < 12) {
    timeMessage = "morning";
  } else if (time >= 12 && time < 17) {
    timeMessage = "afternoon";
  } else if (time >= 17 || time < 5) {
    timeMessage = "evening";
  }
  return timeMessage;
}

function createStyles(colours: ColourSet, bottomInset: number) {
  return StyleSheet.create({
    content: {
      paddingBottom: 120 + bottomInset,
      gap: 30
    }
  });
}
