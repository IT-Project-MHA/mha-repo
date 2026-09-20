import { StyleSheet, Text, View} from "react-native";
import Button from "../../../components/Button";
import { useTheme } from "../../../context/ThemeContext";


export default function Tab() {
    const {mode, setMode, theme} = useTheme();

  return (
    <View style={styles.container}>
      <Text>Tab [Home|Settings]</Text>
      <Button
	    label="dark mode"
	    onPress={() => setMode('dark')}
      buttonType="secondaryButton"
      />
      <Button
	    label="light mode"
	    onPress={() => setMode('lightHC')}
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