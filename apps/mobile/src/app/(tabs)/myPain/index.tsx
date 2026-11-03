/**
 * Home screen for 'Patients' and 'Both' users (exclusive support people do not have this screen)
 */

//we want some buttons in here that take us to assessments

import { Fragment, useCallback, useState } from 'react';
import { View, ScrollView, Text, StyleSheet } from 'react-native';
import { ProgressBar } from 'react-native-paper';
import { AssessmentEntryTab } from "../../../../components/atomicUI/AssessmentEntryTab";
import TextButton from "../../../../components/atomicUI/TextButton";
import { RoutePath, useFocusEffect, useRouter } from 'expo-router';
import { useTheme, ColourSet } from '../../../../context/ThemeContext';
import { toApiDate, weekRangeLabel } from '../../../../constants/date';
import { apiUser, apiAssessment, apiMyPain, apiMyMovement, apiMyPersonalCare, apiMySocialHealth, apiMyManagement} from '@/api/django-API';

async function retrieveUserName() {
    const [user] = await apiUser('select');
    return user.display_name;
}

async function FindCurrAssessment(lastMonday: string) {
  const [assessment] = await apiAssessment('select', {week_starting: lastMonday});
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
  return apiAssessment('create', {week_starting: lastMonday});
}

// async function loadCategory(assessment: any, category: string) {
//   let category = away api
// }

export default function Tab() {
  const router = useRouter();
  const { theme, colours } = useTheme();

  const lastMonday = new Date();

  const timeMessage = SetTimeMessage(lastMonday);

  FindLastMonday(lastMonday);

  const userName = "Fitz" //retrieveUserName();
  
  let openAssessment = async (pathname: RoutePath) => {
    try {
      const currAssessment = await GetOrCreateCurrAssessment();
      router.navigate({pathname, params: {assessmentId: currAssessment.id}});
    } catch (e) {
      console.warn("Could not load this week's assessment", e);
    }
  }

  let reflectionFunction = () => openAssessment('/(tabs)/myPain/reflectionSection');
  let painSectionFunction = () => openAssessment('/(tabs)/myPain/painSection');
  let movementSectionFunction = () => openAssessment('/(tabs)/myPain/movementSection');
  let personalCareSectionFunction = () => openAssessment('/(tabs)/myPain/personalCareSection');
  let socialHealthSectionFunction = () => openAssessment('/(tabs)/myPain/socialHealthSection');
  let managementSectionFunction = () => openAssessment('/(tabs)/myPain/managementSection');

  const sections = [
    { title: "My Pain", onPress: painSectionFunction, call: apiMyPain },
    { title: "My Movement", onPress: movementSectionFunction, call: apiMyMovement },
    { title: "My Personal Care", onPress: personalCareSectionFunction, call: apiMyPersonalCare },
    { title: "My Social Health", onPress: socialHealthSectionFunction, call: apiMySocialHealth },
    { title: "My Management", onPress: managementSectionFunction, call: apiMyManagement },
  ];

  // list of completion dates by title {sectionTitle: completionDate}
  const [completedAt, setCompletedAt] = useState<Record<string, string>>({});
  // sets completedAt
  useFocusEffect( // reload when page is accessed
    useCallback(() => {
      const loadCompleted = async () => {
        try {
          const currAssessment = await FindCurrAssessment(toApiDate(lastMonday));
          // if an assessment id doesn't exist, then no section has been opened
          if (currAssessment == null) {
            setCompletedAt({});
            return;
          }
          const records = await Promise.all(
            sections.map(({ call }) => call('select', { assessment: currAssessment.id })),
          );
          setCompletedAt(Object.fromEntries(
            sections.flatMap(({ title }, i) => {
              // takes records[section][0] (API call returned as an array)
              const done = records[i][0]?.completed_at;
              return done ? [[title, done]] : [];
            }),
          ));
        } catch (e) {
          console.warn("Could not load which sections are done", e);
        }
      };
      loadCompleted();
    }, []),
  );

  let welcomeString = "Good " + timeMessage + ", " + userName;
  let nCompleted = Object.keys(completedAt).length;
  let weekLabel = weekRangeLabel(toApiDate(lastMonday));

  return (
    <ScrollView>
      <View style={[theme.header, theme.leftText]}>
        <Text style={[theme.fontOnBackground, theme.h6]}>{welcomeString}</Text>
        <Text style={[theme.fontOnBackground, theme.h4]}>Let's build your MPowered plan.</Text>
        <ProgressBar
          progress={nCompleted / sections.length}
          color={colours.tertiary}
          style={{ height: 10, borderRadius: 7, backgroundColor: colours.ex3, marginVertical: 16 }}
        />
        <Text style={[theme.fontOnBackground, theme.body]}>
          You've completed {nCompleted}/{sections.length} assessments this week
          {nCompleted === sections.length ? "! 🔥" : "."}
        </Text>
      </View>
      <View style={[theme.sectionContainer, theme.centerItems]}>
        <Text style={[theme.fontOnSurface, theme.h5]}>
          {weekLabel}
        </Text>
        {sections.map((section, index) => (
          <Fragment key={section.title}>
            {index > 0 && <View style={theme.line} />}
            <AssessmentEntryTab title={section.title} onButtonPress={section.onPress} completedAt={completedAt[section.title]} />
          </Fragment>
        ))}
        <View style={{ width: '85%', alignSelf: 'center', alignItems: 'flex-end', marginBottom: 20 }}>
          <TextButton label="Add a reflection for this week" fontColour={colours.onSurface} onPress={reflectionFunction} />
        </View>
        <Text style={[theme.fontOnBackground, theme.small, theme.centerText]}>Supported by ABBVIE</Text>
      </View>
      <View style={theme.bottomGap}/>
    </ScrollView>
  );
}

export function FindLastMonday(currDate: Date) {
  currDate.setDate(currDate.getDate() - (currDate.getDay() + 6) % 7);
  return;
}

export function SetTimeMessage(currTime: Date) {
  let timeMessage = "day";
  var time = (new Date()).getHours();
  if (time >= 5 && time < 12) {
    timeMessage = "morning";
  } else if (time >= 12 && time < 17) {
    timeMessage = "afternoon";
  } else if (time >= 17 || time < 5) {
    timeMessage = "evening";
  }
  return timeMessage;
}

function createStyles(colours: ColourSet){
    return StyleSheet.create({
})
};