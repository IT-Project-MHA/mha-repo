/**
 * Legal page, where use can view the terms and conditions and the privacy policy.
 * 
 */
import { View, Text, ScrollView} from 'react-native';
import { useTheme } from '../../../../context/ThemeContext';
import ButtonWithIcon from '../../../../components/atomicUI/ButtonWithIcon';
import * as WebBrowser from 'expo-web-browser';


export default function Screen() {
  const {theme} = useTheme();

  /**
   * Using a placeholder link for demonstration purposes. When the client 
   * updates up with the PDF we can put it in a google drive, etc. (lots of options)
   * 
   * Client will also be able to update this themselves.
   */
  const TERMS_URL = 'https://s2.q4cdn.com/175719177/files/doc_presentations/Placeholder-PDF.pdf';
  const openTerms = () => WebBrowser.openBrowserAsync(TERMS_URL);
  
  const PRIVACY_URL = 'https://s2.q4cdn.com/175719177/files/doc_presentations/Placeholder-PDF.pdf';
  const openPrivacy = () => WebBrowser.openBrowserAsync(PRIVACY_URL);
  
  return (
    <ScrollView stickyHeaderIndices={[0]}>
      <View style={theme.header}>
        <Text style={[theme.h4, theme.leftText, theme.fontOnSurface]}>Legal</Text>
      </View>
    
    <Text> </Text>

    <View style={[theme.container, theme.centerItems]}>
      <ButtonWithIcon
	          label="Privacy Policy"
	          onPress={openPrivacy}
            buttonType="transparentButton"
            name="arrow-up-right-box-outline"
          />

      <View style ={theme.line}/>
      <ButtonWithIcon
	          label="Terms & Conditions"
	          onPress={openTerms}
            buttonType="transparentButton"
            name="arrow-up-right-box-outline"
          />
      </View>
    <View style={theme.bottomGap}/>
    </ScrollView>
  );
}
