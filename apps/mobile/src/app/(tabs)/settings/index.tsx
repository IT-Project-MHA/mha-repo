/**
 * Every user can access this screen and uses it to navigate to other pages within settings.
 */
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import ButtonWithIcon from '../../../../components/atomicUI/ButtonWithIcon';
import { useRouter } from 'expo-router';
import { useTheme, ColourSet } from '../../../../context/ThemeContext';

export default function Screen() {
  const router = useRouter();
  const { theme } = useTheme();

  return (
    <ScrollView>
      <Text> </Text>
      <View style={[theme.container, theme.centerItems]}>
        
        <ButtonWithIcon
	        label="My Account"
	        onPress={() => router.navigate('/settings/myAccount')}
          buttonType="transparentButton"
          name="chevron-forward-outline"
        />

        <View style={theme.line}
        />
      
        <ButtonWithIcon
	        label="My Data"
	        onPress={() => router.navigate('/settings/myData')}
          buttonType="transparentButton"
          name="chevron-forward-outline"
        />

        <View style={theme.line}
        />
     
        <ButtonWithIcon
	        label="My Connections"
	        onPress={() => router.navigate('/settings/myConnections')}
          buttonType="transparentButton"
          name="chevron-forward-outline"
        />

         <View style={theme.line}
        />
      
   
        <ButtonWithIcon
	        label="Accessibility"
	        onPress={() => router.navigate('/settings/accessibility')}
          buttonType="transparentButton"
          name="chevron-forward-outline"
        />

        <View style={theme.line}
        />
       
        <ButtonWithIcon
	        label="Permissions"
	        onPress={() => router.navigate('/settings/permissions')}
          buttonType="transparentButton"
          name="chevron-forward-outline"
        />

      </View>

      <Text> </Text>
      <Text> </Text>

      <View style={[theme.container, theme.centerItems]}>
          <ButtonWithIcon
	          label="Legal"
	          onPress={() => router.navigate('/settings/legal')}
            buttonType="transparentButton"
            name="chevron-forward-outline"
          />

          <View style={theme.line}
          />
        
          <ButtonWithIcon
	          label="Support"
	          onPress={() => router.navigate('/settings/support')}
            buttonType="transparentButton"
            name="chevron-forward-outline"
          />
      </View>

      <View style={theme.bottomGap}/>

    </ScrollView>
  );
}

function createStyles(colours: ColourSet){
    return StyleSheet.create({
})
};

