/**
 * asks for "Your sex"
 * options ["Female", "Male", "Prefer not to say"]
 * uses the multiple choice framework
 * continue takes us to yearOfBirth page
 */


import { View, Text } from 'react-native';
import { useTheme } from "../../../context/ThemeContext";
import { useRouter } from 'expo-router';
import { MultipleChoice } from '../../../components/answerFields/MultipleChoice';

export default function Page() {
  const router = useRouter();
  const { theme } = useTheme();
  const user = "user"



  return (
    <View style={theme.screen}>
      <Text style={theme.text}>Hello {user}</Text>
      <Text style={theme.text}>A few quick questions so we can make things more relevant for you</Text>
      <View>
        <MultipleChoice 
        questionOptions={["Female", "Male", "Prefer not to say"]}
        onSubmit={()=>{router.navigate('/(onboarding)/sexSelect')}}
        />
      </View>
    </View>
  );
}

