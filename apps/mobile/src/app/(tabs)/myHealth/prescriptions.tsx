/**
 */
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Button from '../../../../components/atomicUI/Button';
import { useRouter } from 'expo-router';
import { useTheme, ColourSet } from '../../../../context/ThemeContext';
import { useState } from 'react';
import AddPrescriptionModal from '../../../../components/atomicUI/AddPrescriptionModal';

type Prescription = {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
}

export default function Screen() {
  const router = useRouter();
  const { theme, colours } = useTheme();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [pending, setPending] = useState< 'addPrescription' | 'editPrescription' | null>(null); // modal visibility triggered by pending state


  /**
   * Handles confirmations (when user clicks confirm in a modal) whilst in pending states.
   */
  const handleConfirmations = () => {
    
    // add prescription from modal
    setPending(null);
  };

  return (
    <ScrollView stickyHeaderIndices={[0]}>
      <View style={theme.header}>
        <Text style={[theme.h4, theme.leftText, theme.fontOnSurface]}>My Prescriptions</Text>
      </View>

       {prescriptions.length === 0 ? (
            <View>
              <View style={theme.centerItems}>

                <Text style={[theme.body, theme.leftItems, theme.fontOnSurface]}> </Text>
                <Text style={[theme.body, theme.leftItems, theme.fontOnSurface]}>Your prescriptions list is empty.</Text>
                <Text style={[theme.body, theme.leftItems, theme.fontOnSurface]}> </Text>

                <Button
	                label="Add Prescriptions"
	                onPress={() => setPending('addPrescription')}
                  buttonType="roundButton"
                  fontColour={colours.onTertiary}
                   />

                <Text style={theme.xSmall}> </Text>

            </View>
            </View>
        ) : (
            <View>
                <Text style={[theme.small, theme.leftItems, theme.fontOnSurface]}>You can:</Text>
                <Text style={theme.xSmall}> </Text>

                <Text style={theme.body}> </Text>
                <Text style={theme.body}> </Text>
            </View> 
    )}

    <AddPrescriptionModal
        visible={pending === 'addPrescription'}
        title="Are you sure you want to log out?"
        message="You'll need to sign in again to access your account."
        onConfirm={handleConfirmations}
        onCancel={() => setPending(null)}
      />

    </ScrollView>

  );
}

function createStyles(colours: ColourSet){
    return StyleSheet.create({
})
};