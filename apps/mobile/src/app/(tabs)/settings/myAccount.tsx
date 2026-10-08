/**
 * My account page, where the user can view/change their details, as well as health conditions.
 *
 * Not implemented: API conenct
 * This page has not been connected to the apo
 */
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme, ColourSet } from '../../../../context/ThemeContext';
import ButtonWithIcon from '../../../../components/ButtonWithIcon';
import { useState } from 'react';
import ConfirmModal from '../../../../components/ConfirmModal';
import AboutMeModal from '../../../../components/AboutMeModal';
import TextButton from '../../../../components/TextButton';
import MyConditionsModal from '../../../../components/MyConditionsModal';


export default function Screen() {
  const {theme} = useTheme();
  const [pending, setPending] = useState< 'logout' | 'delete' | 'editAboutMe' | 'editMyConditions' | null>(null);

  const handleConfirmations = () => {
    if (pending === 'delete'){
      // API call for deleting account
    } else if (pending === 'logout'){
      // user type = undefined
      // trigger login / onboarding
    } 
    setPending(null);
  };
  
  /* PatientProfile:
- select: id, or filter by user (returns own profile & profiles of patients user supports)
- create: has_diagnosis, other_conditions, assigned_gender_at_birth, birth_year, pain_types[]
    - user is set to the user's own, only one profile per user
- update: id NN, has_diagnosis, other_conditions, assigned_gender_at_birth, birth_year,
          pain_types[]
    - id cannot be changed
- delete: id NN */

  /**
   *   const name = await apiUser('select', {
    'name' : display_name,
  })

  const sex = await apiPatientProfile('select', {
    'sex' : assigned_gender_at_birth,
  })

  const phone = await apiUser('select', {
    'phone' : phone_number,
  })

  const email = await apiUser('select', {
    'email' : email,
  })
   */
  return (
   
    <ScrollView stickyHeaderIndices={[0]}>
      <View style={theme.header}>
        <Text style={[theme.h4, theme.leftText, theme.fontOnSurface]}>My Account</Text>
      </View>

      <Text> </Text>
      
      <View style={theme.container}>
        <Text style={[theme.h3, theme.leftText, theme.fontOnSurface]}>About Me </Text>

        <Text> </Text>

        <View style={theme.line}></View>

        <Text> </Text>
        <Text style={[theme.body, theme.leftText, theme.fontOnSurface]}>name</Text>
        <Text style={[theme.body, theme.leftText, theme.fontOnSurface]}>sex</Text>
        <Text style={[theme.body, theme.leftText, theme.fontOnSurface]}>phone number</Text>
        <Text style={[theme.body, theme.leftText, theme.fontOnSurface]}>email</Text>
        <Text> </Text>

        <View style={[theme.rightItems]}>
        <TextButton
	        label="Edit Details"
	        onPress={() => setPending('editAboutMe')}
          />
      </View>
      </View>

      <Text> </Text>
      <Text> </Text>

      <View style={theme.container}>
        <Text style={[theme.h3, theme.leftText, theme.fontOnSurface]}>My Conditions </Text>
        <Text> </Text>
        <View style={theme.line}></View>
        <Text> </Text>
        <Text style={[theme.h6, theme.leftText, theme.fontOnSurface]}>Primary Condition </Text>
        <Text style={[theme.body, theme.leftText, theme.fontOnSurface]}>Osteoperiosis </Text>
        <Text> </Text>
        <Text style={[theme.h6, theme.leftText, theme.fontOnSurface]}>Other Conditions </Text>
        <Text style={[theme.body, theme.leftText, theme.fontOnSurface]}>Arthritis </Text>
        
        <View style={[theme.rightItems]}>
        <TextButton
	        label="Edit Details"
	        onPress={() => setPending('editMyConditions')}
          />
        </View> 
      </View>

      <Text> </Text>
      <Text> </Text>

      <View style={[theme.container, theme.centerItems]}>
      <ButtonWithIcon
	        label="Log Out"
	        onPress={() => setPending('logout')}
          buttonType="transparentButton"
          name="person-outline"
        />
      </View>
  
      <Text> </Text>
      
      <View style={[theme.clearContainer, theme.centerItems]}>
      <ButtonWithIcon
	        label="Delete my account"
	        onPress={() => setPending('delete')}
          buttonType="transparentButton"
          name="trash-bin-outline"
        />
        <View style={theme.line}></View>

        <ConfirmModal
        visible={pending === 'delete'}
        title="Are you sure you want to delete your account?"
        message="This will permanently delete your account and data."
        confirmLabel="Delete"
        cancelLabel='go back'
        onConfirm={handleConfirmations}
        onCancel={() => setPending(null)}
      />

      <ConfirmModal
        visible={pending === 'logout'}
        title="Are you sure you want to log out?"
        message="You'll need to sign in again to access your account."
        confirmLabel="Log out"
        cancelLabel='go back'
        onConfirm={handleConfirmations}
        onCancel={() => setPending(null)}
      />

      <MyConditionsModal
      /**
       * <AboutMeModal
        visible={pending === 'editAboutMe'}
        name = {name}
        sex = {sex}
        phone = {phone}
        email = {email}
        onConfirm={handleConfirmations}
        onCancel={() => setPending(null)}
      />
       */
        visible={pending === 'editMyConditions'}
        title="Edit my conditions!?"
        message="You'll need to sign in again to access your account."
        confirmLabel="Log out"
        cancelLabel='go back'
        onConfirm={handleConfirmations}
        onCancel={() => setPending(null)}
      />

      </View>

      <View style={theme.bottomGap}/>
    
    </ScrollView>
  );
}
function createStyles(colours: ColourSet){
    return StyleSheet.create({  
      floatingContainer: {
        position: 'absolute', // Forces the view to float
        bottom: 30,           // Distance from bottom of the screen
        right: 30,            // Distance from right side of the screen
        zIndex: 999,          // Ensures it sits on top of other elements
  },
})
};
