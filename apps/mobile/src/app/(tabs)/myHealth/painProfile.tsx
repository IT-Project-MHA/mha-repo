/**
 */
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import ButtonWithIcon from '../../../../components/atomicUI/ButtonWithIcon';
import { useRouter } from 'expo-router';
import { useTheme, ColourSet } from '../../../../context/ThemeContext';

export default function Screen() {
  const router = useRouter();
  const { theme } = useTheme();

  return (
    <ScrollView stickyHeaderIndices={[0]}>
      <View style={theme.header}>
        <Text style={[theme.h4, theme.leftText, theme.fontOnSurface]}>My Pain Profile</Text>
      </View>

      {/**
       * 
       */}

    </ScrollView>

  );
}

function createStyles(colours: ColourSet){
    return StyleSheet.create({
})
};
