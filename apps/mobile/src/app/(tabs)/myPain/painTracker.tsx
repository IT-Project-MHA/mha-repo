/**
 * Home screen for 'Patients' and 'Both' users (exclusive support people do not have this screen)
 */

//we want some buttons in here that take us to assessments

import { View, ScrollView, Text, StyleSheet } from 'react-native';
import { AssessmentEntryTab } from "../../../../components/atomicUI/AssessmentEntryTab";
import Button from "../../../../components/atomicUI/Button";
import { useRouter } from 'expo-router';
import { useTheme, ColourSet } from '../../../../context/ThemeContext';
import { apiUser, apiAssessment, apiMyPain, apiMyMovement, apiMyPersonalCare, apiMySocialHealth, apiMyManagement} from '@/api/django-API';

async function retrieveUserName() {
    const [user] = await apiUser('select');
    return user.display_name;
}

async function FindCurrAssessment(lastMonday: string) {
  const [assessment] = await apiAssessment('select', {week_starting: lastMonday});
  return assessment;
}

// async function loadCategory(assessment: any, category: string) {
//   let category = away api
// }

export default function Tab() {
  const router = useRouter();
  const { theme } = useTheme();

  const lastMonday = new Date();


  FindLastMonday(lastMonday);
  let lastMondayParseable = lastMonday.toISOString().split('T')[0];
  const currAssessment = FindCurrAssessment(lastMondayParseable);
  if (currAssessment == null) {
    apiAssessment('create', {week_starting: lastMondayParseable});
   }

  const userName =  retrieveUserName();
  let timeMessage = "day";
  var time = (new Date()).getHours();
  if (time >= 5 && time < 12) {
    timeMessage = "morning";
  } else if (time >= 12 && time < 17) {
    timeMessage = "afternoon";
  } else if (time >= 17 || time < 5) {
    timeMessage = "evening";
  }
  
  let buttonFunction = () => {
    router.navigate('../AssessmentTemp');
  }

  let welcomeString = "Good " + timeMessage + ", " + userName;
  let nCompleted = 0; //backend call
  let lastMondayString = (lastMonday.getDate().toString() + '/' + (lastMonday.getMonth() + 1).toString());

  return (
    <ScrollView>
      <View style={theme.header}>
        <Text style={[theme.fontOnBackground, theme.h6, theme.centerText]}>{welcomeString}</Text>
        <Text style={[theme.fontOnBackground, theme.h3, theme.centerText]}>Let's build your MPowered plan.</Text>
        <Text style={[theme.fontOnBackground, theme.body, theme.centerText]}>
          You've completed {nCompleted}/5 assessments this week.
        </Text>
      </View>
      <View style={[theme.sectionContainer, theme.centerItems]}>
        <Text style={[theme.fontOnSurface, theme.h5]}>
          Assessments for week of {lastMondayString}
        </Text>
        <AssessmentEntryTab onButtonPress={buttonFunction} assessment={currAssessment} assessmentCall={apiMyPain}></AssessmentEntryTab>
        <AssessmentEntryTab onButtonPress={buttonFunction} assessment={currAssessment} assessmentCall={apiMyMovement}></AssessmentEntryTab>
        <AssessmentEntryTab onButtonPress={buttonFunction} assessment={currAssessment} assessmentCall={apiMyPersonalCare}></AssessmentEntryTab>
        <AssessmentEntryTab onButtonPress={buttonFunction} assessment={currAssessment} assessmentCall={apiMySocialHealth}></AssessmentEntryTab>
        <AssessmentEntryTab onButtonPress={buttonFunction} assessment={currAssessment} assessmentCall={apiMyManagement}></AssessmentEntryTab>
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

function createStyles(colours: ColourSet){
    return StyleSheet.create({
})
};