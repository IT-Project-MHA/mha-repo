/**
 * Home screen for 'Patients' and 'Both' users (exclusive support people do not have this screen)
 */

//we want some buttons in here that take us to assessments

import { View, ScrollView, Text, StyleSheet } from 'react-native';
import { AssessmentEntryTab } from "../../../components/atomicUI/AssessmentEntryTab";
import Button from "../../../components/atomicUI/Button";
import { useRouter } from 'expo-router';
import { useTheme, ColourSet } from '../../../context/ThemeContext';

export default function Tab() {
  const router = useRouter();
  const { theme } = useTheme();
  let userName = "Fitz"; //temp variable, API call
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

  let currMonday = new Date();
  currMonday.setDate(currMonday.getDate() - (currMonday.getDay()) % 7);

  let welcomeString = "Good " + timeMessage + ", " + userName;
  let nCompleted = 0;
  return (
    <ScrollView>
      <View style={theme.header}>
        <Text style={[theme.fontOnBackground, theme.h6, theme.centerText]}>{welcomeString}</Text>
        <Text style={[theme.fontOnBackground, theme.h3, theme.centerText]}>Let's build your MPowered plan.</Text>
        <Text style={[theme.fontOnBackground, theme.body, theme.centerText]}>
          You've completed {nCompleted}/5 assessments this week.
        </Text>
      </View>
      //graph
      <View style={[theme.sectionContainer, theme.centerItems]}>
        <Text style={[theme.fontOnSurface, theme.h5]}>
          Assessments for week of {currMonday.getDate()}/{currMonday.getMonth()}
        </Text>
        <AssessmentEntryTab onButtonPress={buttonFunction}></AssessmentEntryTab>
        <AssessmentEntryTab onButtonPress={buttonFunction}></AssessmentEntryTab>
        <AssessmentEntryTab onButtonPress={buttonFunction}></AssessmentEntryTab>
        <AssessmentEntryTab onButtonPress={buttonFunction}></AssessmentEntryTab>
        <AssessmentEntryTab onButtonPress={buttonFunction}></AssessmentEntryTab>
        <View style={theme.lineWithMargin}
        />
        <Button label="Add a reflection for this week" onPress={() => {
          return;
        }} buttonType={"borderedTransparentButton"}></Button>
        <Text style={[theme.fontOnBackground, theme.small, theme.centerText]}>Supported by ABBVIE</Text>
      </View>
      <View style={theme.bottomGap}/>
    </ScrollView>
  );
}

function createStyles(colours: ColourSet){
    return StyleSheet.create({
})
};