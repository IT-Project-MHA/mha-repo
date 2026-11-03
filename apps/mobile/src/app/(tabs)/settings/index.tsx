/**
 * Every user can access this screen and uses it to navigate to other pages within settings.
 */
import React, { View, Text, StyleSheet, ScrollView } from 'react-native';
import ButtonWithIcon from '../../../../components/atomicUI/ButtonWithIcon';
import { useRouter } from 'expo-router';
import { useTheme, ColourSet } from '../../../../context/ThemeContext';
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Screen() {
  const router = useRouter();
  const { theme, colours } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = createStyles(colours, insets.bottom);

  return (
    <ScrollView
            stickyHeaderIndices={[0]}
            contentContainerStyle={styles.content}
          >
      <View style={theme.header}>
        <Text style={[theme.h4, theme.leftText, {color: colours.onSurface}]}>Settings</Text>
        <Text style={[theme.leftText, theme.small, {color: colours.onBackground, marginVertical: 10}]}>
            Manage your account, privacy and support.
        </Text>
      </View>
      

      <View style={[theme.sectionContainer, theme.centerItems]}>
        
        <ButtonWithIcon
	        label="My Account"
	        onPress={() => router.navigate('/settings/myAccount')}
          buttonType="transparentButton"
          name="chevron-forward-outline"
          textStyle={{color: colours.onSurface}}
        />

        <View style={theme.line}
        />

        <ButtonWithIcon
	        label="Accessibility"
	        onPress={() => router.navigate('/settings/accessibility')}
          buttonType="transparentButton"
          name="chevron-forward-outline"
          textStyle={{color: colours.onSurface}}
        />
    
         <View style={theme.line}
        />
      
        <ButtonWithIcon
	        label="My Data"
	        onPress={() => router.navigate('/settings/myData')}
          buttonType="transparentButton"
          name="chevron-forward-outline"
          textStyle={{color: colours.onSurface}}
        />
   
        <View style={theme.line}
        />
       
        <ButtonWithIcon
	        label="Permissions"
	        onPress={() => router.navigate('/settings/permissions')}
          buttonType="transparentButton"
          name="chevron-forward-outline"
          textStyle={{color: colours.onSurface}}
        />

      </View>


      <View style={[theme.sectionContainer, theme.centerItems]}>
          <ButtonWithIcon
	          label="Legal"
	          onPress={() => router.navigate('/settings/legal')}
            buttonType="transparentButton"
            name="chevron-forward-outline"
            textStyle={{color: colours.onSurface}}
          />

          <View style={theme.line}
          />
        
          <ButtonWithIcon
	          label="Support"
	          onPress={() => router.navigate('/settings/support')}
            buttonType="transparentButton"
            name="chevron-forward-outline"
            textStyle={{color: colours.onSurface}}
          />
      </View>

    </ScrollView>
  );
}

function createStyles(
  colours: ColourSet,
  bottomInset: number
) {
  return StyleSheet.create({
    content: {
      paddingBottom: 120 + bottomInset,
      gap: 30
    },
  });
}
