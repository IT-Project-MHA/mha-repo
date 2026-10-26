/**
 * Accessibility page
 *
 * User can change theme and font size.
 * High contrast and text size are saved to the server (via ThemeContext),
 * dark mode is device only.
 */
import { View, Text, ScrollView } from 'react-native';
import { useTheme } from '../../../../context/ThemeContext';
import TextDropdown from '../../../../components/atomicUI/TextDropdown'
import Toggle from '../../../../components/atomicUI/Toggle';

export default function Tab() {
    const { theme, setMode, setHighContrast, isDark, isHC } = useTheme();

    /**
     * function that runs when the theme toggle is pressed
     * light mode -> dark mode
     */
    // dark mode: device only, the API has no field for it
    const toggleColour = () => setMode(isDark ? (isHC ? 'lightHC' : 'light') : (isHC ? 'darkHC' : 'dark'));

    /**
     * function that runs when the contrast toggle is pressed
     * Normal constrast -> high contrast
     */
    // high contrast: applied now and saved to the server
    const toggleContrast = () => setHighContrast(!isHC);

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
