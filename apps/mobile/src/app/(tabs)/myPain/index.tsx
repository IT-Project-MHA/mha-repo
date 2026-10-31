/**
 * Home screen for 'Patients' and 'Both' users (exclusive support people do not have this screen)
 */

//we want some buttons in here that take us to assessments

import { View, ScrollView, Text, StyleSheet } from 'react-native';
import { AssessmentEntryTab } from "../../../../components/atomicUI/AssessmentEntryTab";
import Button from "../../../../components/atomicUI/Button";
import { RoutePath, useRouter } from 'expo-router';
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
  const { theme } = useTheme();

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

  let buttonFunction = () => openAssessment('/(tabs)/myPain/AssessmentTemp');
  let painSectionFunction = () => openAssessment('/(tabs)/myPain/painSection');

  let welcomeString = "Good " + timeMessage + ", " + userName;
  let nCompleted = 0; //backend call
  let weekLabel = weekRangeLabel(toApiDate(lastMonday));

  return (
    <ScrollView>
      <View style={[theme.header, theme.leftText]}>
        <Text style={[theme.fontOnBackground, theme.h6]}>{welcomeString}</Text>
        <Text style={[theme.fontOnBackground, theme.h4]}>Let's build your MPowered plan.</Text>
        <Text style={[theme.fontOnBackground, theme.body]}>
          You've completed {nCompleted}/5 assessments this week.
        </Text>
      </View>
      <View style={[theme.sectionContainer, theme.centerItems]}>
        <Text style={[theme.fontOnSurface, theme.h5]}>
          {weekLabel}
        </Text>
        <AssessmentEntryTab onButtonPress={painSectionFunction} /*</View>assessment={currAssessment}*/ assessmentCall={apiMyPain}>My Pain</AssessmentEntryTab>
        <AssessmentEntryTab onButtonPress={buttonFunction} /*assessment={currAssessment}*/ assessmentCall={apiMyMovement}></AssessmentEntryTab>
        <AssessmentEntryTab onButtonPress={buttonFunction} /*assessment={currAssessment}*/ assessmentCall={apiMyPersonalCare}></AssessmentEntryTab>
        <AssessmentEntryTab onButtonPress={buttonFunction} /*assessment={currAssessment}*/ assessmentCall={apiMySocialHealth}></AssessmentEntryTab>
        <AssessmentEntryTab onButtonPress={buttonFunction} /*assessment={currAssessment}*/ assessmentCall={apiMyManagement}></AssessmentEntryTab>
        <View style={theme.lineWithMargin}
        />
        <Button label="Add a reflection for this week" onPress={buttonFunction} buttonType={"roundedTertiaryButton"}></Button>
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