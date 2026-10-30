/**
 * Button with an icon that stays fixed at the bottom of the screen, above the nav bar
 */
import { View, StyleSheet } from 'react-native';
import ButtonWithIcon from './ButtonWithIcon';
import { useTheme } from '../../context/ThemeContext';
import { IoniconsIconName } from '@react-native-vector-icons/ionicons';
import { TAB_BAR_HEIGHT, TAB_BAR_BOTTOM } from '../../src/app/(tabs)/_layout';

const SPACE_ABOVE_TAB_BAR = 30; // gap between button and nav bar

// space to add below the scroll content so the last card can scroll clear of the button
export const STICKY_BUTTON_GAP = 62;

type Props = {
  label: string;
  onPress: () => void;
  name: IoniconsIconName;
  disabled?: boolean;
};

export default function StickyButtonWithIcon({label, onPress, name, disabled}: Props) {
  const { colours } = useTheme();

  return (
    <View
      pointerEvents="box-none"
      style={styles.container}
    >
      <ButtonWithIcon
        label={label}
        onPress={onPress}
        buttonType="roundButton"
        name={name}
        textStyle={{ color: colours.onTertiary }}
        disabled={disabled}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: TAB_BAR_BOTTOM,
    marginBottom: TAB_BAR_HEIGHT + SPACE_ABOVE_TAB_BAR,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
});
