/**
 * Every user can access this screen
 */
import { View, Text, StyleSheet } from 'react-native';
import Button from '../../../../components/Button';
import { useTheme } from '../../../../context/ThemeContext';
import { useUser } from '../../../../context/AuthorisationContext';
import { UserType } from '../../../../constants/userType';
import { useRouter } from 'expo-router';


export default function Tab() {
  const {setUserType} = useUser();
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text>SETTINGS</Text>

       <Button
	    label="patient mode"
	    onPress={() => setUserType(UserType.patient)}
      buttonType="primaryButton"
      />
      <Text> </Text>
       <Button
	    label="support person mode"
	    onPress={() => setUserType(UserType.supportPerson)}
      buttonType="primaryButton"
      />
      <Text> </Text>
      <Button
	    label="both mode"
	    onPress={() => setUserType(UserType.both)}
      buttonType="primaryButton"
      />
      <Text> </Text>
      <Button
	    label="Themes"
	    onPress={() => router.navigate('/settings/themePref')}
      buttonType="primaryButton"
      />

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});