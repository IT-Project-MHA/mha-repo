/**
 * Home screen for exclusive Support people (all users have access to this screen)
 */
import { View, Text, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import Button from '../../../../components/Button';
import { useTheme } from '../../../../context/ThemeContext';

export default function Screen() {
    const {setMode } = useTheme();

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Select theme' }} /> 

      <Text>Theme preferences page</Text>
      <Text> </Text>
  
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