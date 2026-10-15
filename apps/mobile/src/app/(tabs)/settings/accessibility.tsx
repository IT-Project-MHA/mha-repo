/**
 * Accessibility page
 * 
 * User can change theme and font size
 * 
 */
import { View, Text, ScrollView } from 'react-native';
import { useTheme } from '../../../../context/ThemeContext';
import TextDropdown from '../../../../components/atomicUI/TextDropdown'
import Toggle from '../../../../components/atomicUI/Toggle';

export default function Tab() {
    const {theme, setMode, isDark, isHC} = useTheme();

    /**
     * function that runs when the theme toggle is pressed
     * light mode -> dark mode
     */
    const toggleColour = () => {
            if (isDark){
                setMode(!isHC ? 'light' : 'lightHC');
            }else{
                setMode(!isHC ? 'dark' : 'darkHC');
            } 
    };

    /**
     * function that runs when the contrast toggle is pressed
     * Normal constrast -> high contrast
     */
    const toggleContrast = () => {
            if (isDark){
                setMode(!isHC ? 'darkHC' : 'dark');
            }else{
                setMode(!isHC ? 'lightHC' : 'light');
            } 
    };

  return (
    <ScrollView stickyHeaderIndices={[0]}>
      <View style={theme.header}>
        <Text style={[theme.h4, theme.leftText, theme.fontOnSurface]}>Accessibility</Text>
      </View>

    <Text> </Text>
    <View style={theme.sectionContainer}>

      <View style={theme.row}>
        <Text style={[theme.body, theme.leftText, theme.fontOnSurface]}>Dark Mode</Text>
        <Toggle
          onToggle={toggleColour}
          switchOn={isDark}
        />
      </View>

      <Text> </Text>
      <View style={theme.line}/>
      <Text> </Text>
      
      <View style={theme.row}>
        <Text style={[theme.body, theme.leftText, theme.fontOnSurface]}>High Contrast</Text>
        <Toggle
          onToggle={toggleContrast}
          switchOn={isHC}
        />
      </View>

      <Text> </Text>
      <View style={theme.line}/>
 
      <Text> </Text>

      <Text style={[theme.body, theme.leftText, theme.fontOnSurface]}>Adjust Text Size</Text>

      <View style={theme.centerItems}>
      <TextDropdown/>
    </View>
    </View>

    <View style={theme.bottomGap}/>

    </ScrollView>
  );
}
