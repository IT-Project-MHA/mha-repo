import { StyleSheet, Text, View} from "react-native";
import Button from "../../../components/Button";
import { useTheme } from "../../../context/ThemeContext";


export default function Tab() {
    const {mode, setMode, theme} = useTheme();

  return (
    <View style={styles.container}>
        <Text>HOME</Text>
        <Text> </Text>
        <Text> </Text>
      <Button
	    label="light mode"
	    onPress={() => setMode('light')}
        buttonType="primaryButton"
      />
      <Button
	    label="dark mode"
	    onPress={() => setMode('dark')}
        buttonType="secondaryButton"
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