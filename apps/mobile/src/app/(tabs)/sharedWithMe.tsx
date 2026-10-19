/**
 * Home screen for exclusive Support people (all users have access to this screen)
 */
import { View, Text, StyleSheet } from 'react-native';

export default function Tab() {
  return (
    <View style={styles.container}>
      <Text>SHARED WITH ME</Text>
      <Text>This section is the homescreen for support people, and accessible by everyone</Text>
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