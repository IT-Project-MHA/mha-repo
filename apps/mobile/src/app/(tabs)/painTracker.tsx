/**
 * Home screen for 'Patients' and 'Both' users (exclusive support people do not have this screen)
 */

//we want some buttons in here that take us to assessments

import { View, Text, StyleSheet } from 'react-native';

export default function Tab() {
  return (
    <View style={styles.container}>
      <Text>PAIN TRACKER</Text>
      <Text>This section is the homescreen for patients & users who are both patients and support persons</Text>
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