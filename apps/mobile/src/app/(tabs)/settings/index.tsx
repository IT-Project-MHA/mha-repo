/**
 * Every user can access this screen and uses it to navigate to other pages within settings.
 * 
 */
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import ButtonWithIcon from '../../../../components/ButtonWithIcon';
import { useRouter } from 'expo-router';
import { useTheme, ColourSet } from '../../../../context/ThemeContext';

export default function Screen() {
  const router = useRouter();
  const {colours} = useTheme();
  const styles = createStyles(colours);

  return (
    <ScrollView>
      <Text> </Text>
      <View style={styles.container}>
        <ButtonWithIcon
	        label="My Account"
	        onPress={() => router.navigate('/settings/myAccount')}
          buttonType="transparentButton"
          textType="textOnBackground"
          name="chevron-forward-outline"
          colour={colours.onBackground}
        />

        <View style={styles.line}
        />
      
        <ButtonWithIcon
	        label="My Data"
	        onPress={() => router.navigate('/settings/myData')}
          buttonType="transparentButton"
          textType="textOnBackground"
          name="chevron-forward-outline"
          colour={colours.onBackground}
        />

        <View style={styles.line}
        />
     
        <ButtonWithIcon
	        label="My Connections"
	        onPress={() => router.navigate('/settings/myConnections')}
          buttonType="transparentButton"
          textType="textOnBackground"
          name="chevron-forward-outline"
          colour={colours.onBackground}
        />

        <View style={styles.line}
        />
   
        <ButtonWithIcon
	        label="Accesibility"
	        onPress={() => router.navigate('/settings/accesibility')}
          buttonType="transparentButton"
          textType="textOnBackground"
          name="chevron-forward-outline"
          colour={colours.onBackground}
        />

        <View style={styles.line}
        />
       
        <ButtonWithIcon
	        label="Permissions"
	        onPress={() => router.navigate('/settings/permissions')}
          buttonType="transparentButton"
          textType="textOnBackground"
          name="chevron-forward-outline"
          colour={colours.onBackground}
        />

        <View style={styles.line}
        />

      </View>

      <Text> </Text>
      <Text> </Text>

      <View style={styles.container}>
          <ButtonWithIcon
	          label="Legal"
	          onPress={() => router.navigate('/settings/legal')}
            buttonType="transparentButton"
            textType="textOnBackground"
            name="chevron-forward-outline"
            colour={colours.onBackground}
          />

          <View style={styles.line}
          />
        
          <ButtonWithIcon
	          label="Support"
	          onPress={() => router.navigate('/settings/support')}
            buttonType="transparentButton"
            textType="textOnBackground"
            name="chevron-forward-outline"
            colour={colours.onBackground}
          />

          <View style={styles.line}
        />
      
      </View>

      <Text> 

      </Text>
      <Text> </Text>
      <Text> </Text>
      <Text> </Text>
      <Text> </Text>
      <Text> </Text>
      <Text> </Text>
      <Text> </Text>
      <Text> </Text>
      <Text> </Text>
      <Text> </Text>
      <Text> </Text>
      <Text> </Text>
      <Text> </Text>
      <Text> </Text>
      <Text> </Text>
      <Text> </Text>
    </ScrollView>
  );
}
function createStyles(colours: ColourSet){
    return StyleSheet.create({
        
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colours.surface,
    paddingBlock: 30, //lit
    alignSelf: 'center',
    width: '85%', // of page

    borderRadius: 28,
    borderTopWidth: 0,     
    borderBottomWidth: 0, 
 
    overflow: 'hidden',

    shadowColor: colours.tertiary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 4,
  },

  line: {
    height: 3,
    backgroundColor: colours.onBackground,
    width: '89%',
    borderRadius: 300,
    //marginHorizontal: 20,
  }
})
};

