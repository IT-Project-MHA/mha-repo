/**
 * page to enter the phone number of the connection
 * 
 */

import { View, Text } from 'react-native';
import { PhoneField } from '../../../../components/onboarding/PhoneField';
import { useTheme } from "../../../../context/ThemeContext";
import { useRouter } from 'expo-router';



export default function Page() {
  const { theme } = useTheme();
  const router = useRouter();

  function addconnectionNumber(connection: string){
    
    //router
    router.navigate("/(tabs)");
  }

  return (
    <View style={theme.container}>
      <Text style={theme.text}>Enter your connections mobile phone number</Text>

      <PhoneField
      onSubmit={addconnectionNumber}
      />
      
    </View>
  );
}

