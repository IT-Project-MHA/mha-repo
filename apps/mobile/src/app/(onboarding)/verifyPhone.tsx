/**
 * entry page for a texted phone code
 * 
 * button for submit
 * submits on field completion
 * submits on enter
 * 
 * clickable text for resending code
 * 
 * Assuming four digit code
 */


import { View, Text } from 'react-native';
import { useTheme } from "../../../context/ThemeContext";
import { NumberEntry } from '../../../components/answerFields/NumberEntry';
import { useRouter } from 'expo-router';
import { apiPatientProfile } from '../../api/django-API'

function smsVerifier(code: string){
  //on success, we create the account with all the gathered information
}
export default function Page() {
  const router = useRouter();
  const { theme } = useTheme();
  
  return (
    <View style={theme.screen}>
      <Text style={theme.text}> Your year of birth</Text>
      <View style={theme.container}>
        <NumberEntry 
        onSubmit={smsVerifier}
        UPPER_BOUND={9999}
        LOWER_BOUND={0}
        MAX_lENGTH_NUM={4}
        />
      </View>
    </View>
  );
}

