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
import Button from '../../../components/atomicUI/Button';

export default function Page() {
  const router = useRouter();
  const { theme } = useTheme();
  const user = "user"



  return (
    <View style={theme.screen}>
      
      <Text style={theme.text}>I think I need to import something for this</Text>
      <View>
      </View>
      <Button
      label='Continue'
      onPress={()=>{}}
      buttonType='primaryButton'
      />
    </View>
  );
}

