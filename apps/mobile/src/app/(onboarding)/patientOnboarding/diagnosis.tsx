/**
 * asks for "Your sex"
 * options ["Female", "Male", "Prefer not to say"]
 * uses the multiple choice framework
 * continue takes us to yearOfBirth page
 */


import { View, Text } from 'react-native';
import { useTheme } from "../../../../context/ThemeContext";
import { useRouter } from 'expo-router';
import { MultipleChoice } from '../../../../components/answerFields/MultipleChoice';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Page() {
  const router = useRouter();
  const { theme } = useTheme();
  const user = "user"



  return (
    <SafeAreaView style={theme.screen}>
      
      <Text style={theme.text}>Do you have a musculoskeletal (for example arthritis, back pain, gout) or chronic pain diagnosis from your doctor?</Text>
      <View>
        <MultipleChoice 
        questionOptions={["Yes, I have", "No, I haven't"]}
        onSubmit={()=>{router.navigate('/(onboarding)/patientOnboarding/dropDownConditions')}}
        />
      </View>
      <Text style={theme.text}> No diagnosis? No problem! You know your body and how you feel so being Health MPowered is for you :)</Text>
    </SafeAreaView>
  );
}

