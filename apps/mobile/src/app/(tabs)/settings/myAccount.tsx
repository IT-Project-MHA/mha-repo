/**
 * My account page, where the user can view/change their details, as well as health conditions.
 */
import { View, Text, ScrollView } from 'react-native';
import { useTheme } from '../../../../context/ThemeContext';
import ButtonWithIcon from '../../../../components/atomicUI/ButtonWithIcon';
import { useState } from 'react';
import ConfirmModal from '../../../../components/atomicUI/ConfirmModal';
import AboutMeModal from '../../../../components/atomicUI/AboutMeModal';
import TextButton from '../../../../components/atomicUI/TextButton';
import MyConditionsModal from '../../../../components/atomicUI/MyConditionsModal';
import { useUser } from '../../../../context/AuthorisationContext';

export default function Screen() {
  const {theme} = useTheme();
  const {setUserType} = useUser();
  const [pending, setPending] = useState< 'logout' | 'delete' | 'editAboutMe' | 'editMyConditions' | null>(null); // modal visibility triggered by pending state

  /**
   * PLACEHOLDERS to be replaced by API calls
   */
  const placeholderDetails = {
    name: 'Jane Doe',
    sex: 'Female',
    email: 'janedoe@awesome.com',
    phone: '+61 348 985 216',
    primaryCondition: 'Osteoperosis',
    otherConditions: 'Arthritis', // How many other conditions, 10 max?
  };

  /**
   * Handles confirmations (when user clicks confirm in a modal) whilst in pending states.
   */
  const handleConfirmations = () => {
    if (pending === 'delete'){
      // API call for deleting account
    } else if (pending === 'logout'){
        setUserType('Undefined') // should trigger log in / onboarding
    } else if (pending === 'editAboutMe'){
      // changes should be checked for validity before save can happen
      // save changes to backend 
    } else if (pending === 'editMyConditions'){
      // changes should be checked for validity before save can happen
      // save changes to backend 
    }
    setPending(null);
  };

  /**
   * Renders screen, which include user details (with option to edit with modal), user conditions (with option to edit with modal)
   * as well as the option to delete account and log out, both of which trigger confirm modals that ask the user
   * to confirm their decision.
   */
  return (
    <ScrollView stickyHeaderIndices={[0]}>
      <View style={theme.header}>
        <Text style={[theme.h4, theme.leftText, theme.fontOnSurface]}>My Account</Text>
      </View>

      <Text> </Text>
      
      <View style={theme.container}>
        <Text> </Text>
        <Text style={[theme.h5, theme.leftText, theme.fontOnSurface]}>About Me</Text>

        <Text> </Text>

        <View style={theme.line}></View>

        <Text> </Text>
        <Text style={[theme.body, theme.leftText, theme.fontOnSurface]}>{placeholderDetails.name}</Text>
        <Text style={theme.body}> </Text>
        <Text style={[theme.body, theme.leftText, theme.fontOnSurface]}>{placeholderDetails.sex}</Text>
        <Text style={theme.body}> </Text>
        <Text style={[theme.body, theme.leftText, theme.fontOnSurface]}>{placeholderDetails.phone}</Text>
        <Text style={theme.body}> </Text>
        <Text style={[theme.body, theme.leftText, theme.fontOnSurface]}>{placeholderDetails.email}</Text>
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
        <Text> </Text>
        <Text style={[theme.h5, theme.leftText, theme.fontOnSurface]}>My Conditions</Text>
        <Text> </Text>
        <View style={theme.line}></View>
        <Text> </Text>
        <Text style={[theme.h6, theme.leftText, theme.fontOnSurface]}>Primary Condition </Text>
        <Text style={theme.body}> </Text>
        <Text style={[theme.body, theme.leftText, theme.fontOnSurface]}>{placeholderDetails.primaryCondition} </Text>
        <Text> </Text>

        {placeholderDetails.otherConditions !== null && (
          <View>
          <Text style={[theme.h6, theme.leftText, theme.fontOnSurface]}>Other Conditions</Text>
          <Text style={theme.body}> </Text>
          <Text style={[theme.body, theme.leftText, theme.fontOnSurface]}>{placeholderDetails.otherConditions}</Text>
          </View>
        )}
        
        
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

      <AboutMeModal
        visible={pending === 'editAboutMe'}
        initialValues = {placeholderDetails}
        onConfirm={handleConfirmations}
        onCancel={() => setPending(null)}
      />

      <MyConditionsModal
        visible={pending === 'editMyConditions'}
        initialValues = {placeholderDetails}
        onConfirm={handleConfirmations}
        onCancel={() => setPending(null)}
      />

      </View>

      <View style={theme.bottomGap}/>
    
    </ScrollView>
  );
}
