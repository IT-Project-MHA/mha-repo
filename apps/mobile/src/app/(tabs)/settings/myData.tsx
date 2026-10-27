/**
 * My Data page, where users can delete their data, which deletes all their health data making
 * their account a 'support person' account.
 * 
 * Users can also view the privacy policy (currently a placeholder to be updated by client).
 */
import { View, Text, ScrollView, Alert } from 'react-native';
import { useTheme } from '../../../../context/ThemeContext';
import ButtonWithIcon from '../../../../components/atomicUI/ButtonWithIcon';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useUser } from '../../../../context/AuthorisationContext';
import ConfirmModal from '../../../../components/atomicUI/ConfirmModal';
import * as WebBrowser from 'expo-web-browser';
import { apiDeleteMyData, apiErrorMessage } from '@/api/settings_api_helpers';

export default function Screen() {
  const {theme} = useTheme();
  // re-reads users role from the server so tabs update when data is deleted (becomes support account)
  const { refreshUserType } = useUser();
  // move user to new screen once data is deleted
  const router = useRouter();

  /**
   * Link to privacy policy (to be updated by client)
   */
  const PRIVACY_URL = 'https://s2.q4cdn.com/175719177/files/doc_presentations/Placeholder-PDF.pdf';
  const openPrivacy = () => WebBrowser.openBrowserAsync(PRIVACY_URL);
    
  const [pending, setPending] = useState< 'delete' | null>(null);
  const [deleting, setDeleting] = useState(false);

  /**
   * When user selects delete in confirm modal.
   */
  const handleConfirmations = async () => {
    if (pending !== 'delete' || deleting) return;
      setPending(null);
      setDeleting(true);
    try {
      // deletes assessments, appointments, prescriptions, support people and the profile.
      const hadData = await apiDeleteMyData();
      // the profile is gone, so the server now gives a different role. Updating the context
      // changes which tabs the user sees (e.g. the patient tabs disappear)
      await refreshUserType();
        Alert.alert(
          hadData ? 'Data deleted' : 'Nothing to delete',
          hadData
          ? 'Your health data has been deleted. Your account is now a support person account.'
          : 'You have no health data stored.',
          [{ text: 'OK', onPress: () => hadData && router.replace('/carePlanner') }]
        );
    } catch (e) {
      Alert.alert('Could not delete your data', apiErrorMessage(e));
    } finally {
      setDeleting(false);
    }
    };

  return (
   
    <ScrollView stickyHeaderIndices={[0]}>
      <View style={theme.header}>
        <Text style={[theme.h4, theme.leftText, theme.fontOnSurface]}>My Data</Text>
      </View>

      <Text> </Text>
      
      <View style={[theme.sectionContainer, theme.centerItems]}>

      <ButtonWithIcon
	        label="Delete my Data"
	        onPress={() => setPending('delete')}
          buttonType="transparentButton"
          name="trash-bin-outline"
        />

       <View style={theme.line}></View>

      <ButtonWithIcon
	        label="Privacy Policy"
	        onPress={openPrivacy}
          buttonType="transparentButton"
          name="arrow-up-right-box-outline"
        />

      </View>

      <ConfirmModal
        visible={pending === 'delete'}
        title="Are you sure you want to delete your data?"
        message="This will permanently delete your data."
        confirmLabel="Delete"
        cancelLabel='go back'
        onConfirm={handleConfirmations}
        onCancel={() => setPending(null)}
      />


    <View style={theme.bottomGap}/>

    </ScrollView>
  );
}

