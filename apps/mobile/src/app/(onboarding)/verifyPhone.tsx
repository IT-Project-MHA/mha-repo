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
import Button from '../../../components/atomicUI/Button';


export default function Page() {
  const router = useRouter();
  const { theme } = useTheme();


  function smsVerifier(code: string){
    //on success,we go to the userType selection page

    router.navigate("/(onboarding)/userType");
  }
  return (
    <View style={theme.screen}>
      <Text style={theme.text}>Verify your mobile</Text>
      <View style={theme.container}>
        <NumberEntry 
        onSubmit={smsVerifier}
        UPPER_BOUND={9999}
        LOWER_BOUND={0}
        MAX_lENGTH_NUM={4}
        />
      </View>
      <Text style={theme.text}>We've sent a code to FIX: ADD THEIR PHONE NUMBER HERE</Text>

      {/**resend or change phone number code is sent to */}
      <Button
      label="I didn't recieve a code"
      onPress={()=>{/**FIX: implement */}}
      buttonType='secondaryButton'
      />

    </View>
  );
}

