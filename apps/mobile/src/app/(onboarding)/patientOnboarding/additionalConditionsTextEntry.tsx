/**
 * last page of patient flow. If support person flag then go to there, else go to home
 * asks for name
 * directs to terms and conditions page
 * FIX: allow skip
 */


import { View, Text } from 'react-native';
import { PhoneField } from '../../../../components/onboarding/PhoneField';
import { useTheme } from "../../../../context/ThemeContext";
import { TextEntry } from '../../../../components/answerFields/TextEntry';
import { useRouter } from 'expo-router';

export default function Page() {
  const router = useRouter();
  const { theme } = useTheme();
  function handleSubmit(){
    //FIX: if statement for support onboarding
    router.navigate("/(tabs)/myHealth")
  }
  return (
    <View style={theme.screen}>
      <Text style={theme.text}>Do you have any other conditions?</Text>
      <View style={theme.container}>
        <TextEntry 
        onSubmit={handleSubmit}
        placeholder='Type conditions or symptoms that you know'
        />
      </View>
    </View>
  );
}

