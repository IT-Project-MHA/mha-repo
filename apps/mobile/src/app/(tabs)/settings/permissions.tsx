import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme, ColourSet } from '../../../../context/ThemeContext';
import { useRouter } from 'expo-router';


export default function Screen() {
  const {colours, theme} = useTheme();
  const router = useRouter();
  const styles = createStyles(colours);

  return (
    <ScrollView stickyHeaderIndices={[0]}>
      <View style={theme.header}>
        <Text style={[theme.h4, theme.leftText]}>Permissions</Text>
      </View>

    <View style={theme.bottomGap}/>

    </ScrollView>
  );
}

function createStyles(colours: ColourSet){
    return StyleSheet.create({  
      container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
})
};
