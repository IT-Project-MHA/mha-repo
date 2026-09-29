/**
 * Every user can access this screen
 */
import { View, Text, StyleSheet } from 'react-native';
import Button from '../../../components/Button';
import { useTheme } from '../../../context/ThemeContext';
import { useUser } from '../../../context/AuthorisationContext';
import { UserType } from '../../../constants/userType';

export default function Tab() {
  const {setMode } = useTheme();
  const {setUserType} = useUser();

  return (
    <View style={styles.container}>
      <Text>SETTINGS</Text>
      <Text> </Text>
      <Button
	    label="light mode"
	    onPress={() => setMode('light')}
      buttonType="primaryButton"
      />
      <Text> </Text>
      <Button
	    label="dark mode"
	    onPress={() => setMode('dark')}
      buttonType="primaryButton"
      />
      <Text> </Text>
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
