import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Button from '../../../../components/atomicUI/Button';
import { useTheme, ColourSet } from '../../../../context/ThemeContext';
import { useEffect, useState } from 'react';
import AddPrescriptionModal, {PrescriptionDetails} from '../../../../components/atomicUI/AddPrescriptionModal';
import { apiPrescription } from '@/api/django-API';
import {makeUser} from '@/api/my_health_api_helpers';

export default function Screen() {
  const { theme, colours } = useTheme();
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [saving, setSaving] = useState(false); 
  const [pending, setPending] = useState< 'addPrescription' | 'editPrescription' |  null>(null);  // modal visibility triggered by pending state
  // load prescriptions
  const loadPrescriptions = () => 
    apiPrescription('select')
    .then(setPrescriptions)
    .catch((e) => console.log('failed to load', e?.message, e?.status, e?.data));


  // loads the data after initial
  useEffect(() => {
    loadPrescriptions();
  },[]);

  // creates list of active prescriptions
  const activePrescriptions = prescriptions.filter((p)=> !(p.stopped_on));

  /**
   * Handles adding the prescription after confirmation from the modal
   */
  const handleAddPrescription = async (values: PrescriptionDetails) => {
    if (saving) return;
      setSaving(true);
    try {
      await apiPrescription('create', values);
      await loadPrescriptions();
      setPending(null);
    } catch (e:any) {
      console.log('create failed', e?.name, e?.message)
  } finally{
    setSaving(false);
  }
};

  return (
    <ScrollView stickyHeaderIndices={[0]}>
      <View style={theme.header}>
        <Text style={[theme.h4, theme.leftText, theme.fontOnSurface]}>My Prescriptions</Text>
      </View>

      <Button
        label="Make User"
        onPress={() => makeUser('0413975375', 'Hello', 'hello@hotmail.com')}
        buttonType="roundButton"
        fontColour={colours.onTertiary}
        />
      
      {/**
       * 
       * if user has no prescriptions, they are prompted to add one
       * adding a prescription triggers a prescription modal
       * 
       * if the user has >0 prescriptions, they can view their prescriptions in list form, click to 
       * view more information on their prescription in a modal, edit their prescription in a modal, 
       * and remove their prescription
       * 
       */}
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
          // fully implemented will have buttons with prescription names which triggers a modal with
          // full information and option to edit details
          <View>
            {activePrescriptions.map((p) => (
              <View key={p.id}>
                <Text>{p.name}</Text>


              </View>
            ))}
            
            <Button
                  label="Add new Prescription"
                  onPress={() => setPending('addPrescription')}
                  buttonType="roundButton"
                  fontColour={colours.onTertiary}
                   />
            </View>
           )}
    
    <AddPrescriptionModal
        visible={pending === 'addPrescription'}
        title="Add Prescription"
        onConfirm={handleAddPrescription}
        onCancel={() => setPending(null)}
      />
    </ScrollView>

  );
}

function createStyles(colours: ColourSet){
    return StyleSheet.create({
})
};