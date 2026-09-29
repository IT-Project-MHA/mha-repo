/**
 * Every user can access this screen and uses it to navigate to other pages within settings.
 * 
 */
import { View, Text, StyleSheet } from 'react-native';
import Button from '../../../../components/Button';
import { useRouter } from 'expo-router';


export default function Screen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text> </Text>

      <Button
	    label="Themes"
	    onPress={() => router.navigate('/settings/themePref')}
      buttonType="primaryButton"
      />

      <Text> </Text>

      <Button
	    label="Select user type (for testing)"
	    onPress={() => router.navigate('/settings/userType')}
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