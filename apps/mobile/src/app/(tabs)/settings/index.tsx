/**
 * Every user can access this screen and uses it to navigate to other pages within settings.
 * 
 */
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Button from '../../../../components/Button';
import { useRouter } from 'expo-router';
import ToggleButton from '../../../../components/ToggleButton'
import { useTheme, ColourSet } from '../../../../context/ThemeContext';


export default function Screen() {
  const router = useRouter();
  const {colours} = useTheme();
  const styles = createStyles(colours);

  return (
    <ScrollView style={styles.screen}>
      <Text> </Text>

      <View style={styles.container}>
        <Button
	        label="My Account"
	        onPress={() => router.navigate('/settings/myAccount')}
          buttonType="primaryButton"
        />
        <Text> </Text>
        <Button
	        label="My Data"
	        onPress={() => router.navigate('/settings/myData')}
          buttonType="primaryButton"
        />
        <Text> </Text>
        <Button
	        label="My Connections"
	        onPress={() => router.navigate('/settings/myConnections')}
          buttonType="primaryButton"
        />
        <Text> </Text>
        <Button
	        label="Accesibility"
	        onPress={() => router.navigate('/settings/accesibility')}
          buttonType="primaryButton"
        />
        <Text> </Text>
        <Button
	        label="Permissions"
	        onPress={() => router.navigate('/settings/permissions')}
          buttonType="primaryButton"
        />
      </View>

      <Text> </Text>

      <View style={styles.container}>
        <View style={styles.row}> 
          <Button
	          label="Legal"
	          onPress={() => router.navigate('/settings/legal')}
            buttonType="primaryButton"
          />
        </View>
        <Text> </Text>
        <View style={styles.row}>
          <Button
	          label="Support"
	          onPress={() => router.navigate('/settings/support')}
            buttonType="primaryButton"
          />
        </View>
      </View>
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

    shadowColor: '#2a2727',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 4,
    
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  screen: {
    backgroundColor: colours.background,
  },

})
};

