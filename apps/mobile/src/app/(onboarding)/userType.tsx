/**
 * This page contains a multi-select question.
 * It asks for user-type, i.e. patient or support person, or both.
 * Inserted between terms of service and sexSelect
 */


import { View, Text, ScrollView } from 'react-native';
import { useTheme } from "../../../context/ThemeContext";
import { useRouter } from 'expo-router';
import { MultiSelect } from '../../../components/answerFields/MultiSelect';

export default function Page() {
  const router = useRouter();
  const { theme } = useTheme();
  const user = "user"

  const USER_TYPES = ["For myself","To support someone else who uses the app"]; //patient equivalent text, support person equivalent text

  function setUserType(selection: string[]){
    //this function sets the user type based on selection, and navigates to the appropriate page

    //the selection is in order of pressed, so check both
    let flag=false;
    for(let i=0; i<selection.length; i++){
      
      if(selection[i]==USER_TYPES[0]) //means, we have selected "Patient" equivalent text
      {
        //set the "Patient" flag in pseudo account storage
        flag=true;
        
      }
      if(selection[i]==USER_TYPES[1]) //support person
      {
        //set the "support person" flag in pseudo account storage

      }
    }
    //navigation
    //if patient tagged, do that first.
    //support person onboarding is tacked on after phone number verification, with a check to the pseudo-account flag
    if(flag)
    {
      //navigates to sexSelect
      router.navigate('/(onboarding)/patientOnboarding/sexSelect');
    }else{
      //navigate to phone number. Also catches any weird error
      router.navigate('/(onboarding)/supportPersonOnboarding/supportPersonOnboarding');
    }
    //()=>{router.navigate('/(onboarding)/additionalConditionsTextEntry')}
  }
  return (
    <View style={theme.screen}>
      
      <Text style={theme.text}>How do you plan to use the app?</Text>
      <ScrollView
      showsVerticalScrollIndicator={false}
      >
        <MultiSelect
        questionOptions={USER_TYPES}
        headingText='You can select both'
        onSubmit={setUserType}
        MIN_SELECTIONS={1}
        MAX_SELECTIONS={USER_TYPES.length+1}
        />
      </ScrollView>
    </View>
  );
}

