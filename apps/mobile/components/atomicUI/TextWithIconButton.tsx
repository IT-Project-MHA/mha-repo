/**
 * Button which generates a plain-text button, with an icon
 */
import { Text, TouchableOpacity, StyleSheet, View} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import {Ionicons, IoniconsIconName} from '@react-native-vector-icons/ionicons'

type ButtonType = "textButton";


/**
 * defines the required input on button creation
 * 
 * for example (as well as importing button and themeContext files):
 * 
 * <Button
        label="light mode"
        onPress={() => setMode('light')}
        iconName="person-outline"
    />
 */
type ButtonProps = {
  label: string;
  onPress: () => void;
  iconName: IoniconsIconName;
};

/**
 * 
 * @param label string that says what the button should say
 * @param onPress prescribes an action to the button when pressed
 * @returns  button that is styled to look like plain text
 */
const TextButton = ({label, onPress,iconName}: ButtonProps) => {
  const { theme, colours } = useTheme();

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      style={theme['textButton']}
      onPress={onPress}
    >
    <View style={styles.row}>
          <Text style={[theme.body, theme.fontOnSurface]}>{label}</Text>
            <Ionicons
                name={iconName}
                size={16}
                color={colours.onSurface}  
                style={styles.icon}
            />
    </View>
    </TouchableOpacity>
  );
};

export default TextButton;

const styles = StyleSheet.create({
    row: {
    flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        alignSelf: 'stretch',
    },
    // pins the icon to the right
    icon: {
        position: 'absolute', // absolute detaches it from the text
        right: 0,
    },
});