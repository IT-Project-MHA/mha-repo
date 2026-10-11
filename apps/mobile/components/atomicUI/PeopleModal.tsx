/**
 * Modal which presents information of user support people and users the user supports
 * 
 * change logic will be implemented with api:
 *  - user should be able to remove support people / remove themselves as a support person
 *  - user can change support person permissions
 */
import {Modal, View, Text, Pressable, StyleSheet, ScrollView} from 'react-native'
import { useTheme, ColourSet } from "../../context/ThemeContext";
import { Checkbox } from 'expo-checkbox';
import { useState, useEffect, useRef } from "react";
import ConfirmModal from './ConfirmModal';
import TextWithIconButton from './TextWithIconButton'

type Props = {
    visible: boolean;
    name: string;
    role: string;
    phone: string;
    permissions: Permissions;
    onChange: () => void; //manage changing permissions with api
    onCancel: () => void;
}

export type Permissions = {
    viewAppointments: boolean,
    addQuestions: boolean,
    addRecords: boolean,
}

const permissionsLabels: Record<keyof Permissions, string> ={
    viewAppointments: "View my appointments",
    addQuestions: "Add questions to my appointments",
    addRecords: "Add records to my appointments"
}

const permissionsLabelsImSupporting: Record<keyof Permissions, string> ={
    viewAppointments: "View their appointments",
    addQuestions: "Add questions to their appointments",
    addRecords: "Add records to their appointments"

}

const PeopleModal = ({visible, name, role, phone, permissions, onChange, onCancel} : Props) => {
    const { theme, colours } = useTheme();
    const styles = createStyles(colours);
    const [pending, setPending] = useState< 'removeConnection' | 'removeSupportPerson' | 'addSupportPerson' | null>(null);
    const [checked, setChecked] = useState<Permissions>(permissions); // monitors check box's for permissions
    const last = useRef({role, name, phone});

    /**
     * prevents glitch where modal rerenders on fadeout and probs become undefined
     * (this is an issue as the rendering is dependant on conditions regarding data)
     * 
     */
    if (visible) last.current = {name, role, phone};
    const show = last.current;

    // resets to the checked boxes when the modal opens
    useEffect( () => {
        if (visible) setChecked(permissions)
    }, [visible]);

    /**
     * toggles permission between true and false in the checked state for check box
     * @param key defines the key of permissions, so key must be one of the permissions defined in Permissions
     */
    const toggle = (key: keyof Permissions) => setChecked((prev) => ({...prev, [key]: !prev[key]}))

    /**
    * Handles confirmations (when user clicks confirm in a modal) whilst in pending states.
    */
    const handleConfirmations = () => {
        if (pending === 'removeConnection'){
            // API call for removing self as support person
        } else if (pending === 'removeSupportPerson'){
            // API call for removing support person
        } else if (pending === 'addSupportPerson'){
            // API call for adding support person?
        }
        setPending(null);
        };


  return (
    <Modal
        visible = {visible}
        transparent = {true} // display app in background
        animationType="fade"
        onRequestClose={onCancel} // considers tapping out of frame a 'cancel' scenario
    > 

    <View style={styles.backgroundColour}/>             
    
    <Pressable style={styles.modalView} onPress={onCancel}
        // makes the background a button so you can click out by pressing outside of the modal
     > 
        
        <Pressable
            style={[styles.card, { backgroundColor: colours.surface}]}
            onPress={() => {}}
            >
            <ScrollView>
            
            <Text style={[theme.h4, theme.leftItems, theme.fontOnSurface]}>{show.name}</Text>

            <Text> </Text>

            {/** 
             * printing name, contact and role of users 'connections'
             */}
            <View style={theme.row}>
                <Text style={[theme.body, theme.leftItems, theme.fontOnSurface]}>Role:</Text>
                <Text style={[theme.body, theme.leftItems, theme.fontOnSurface]}>{show.role}</Text>
            </View>

            <Text> </Text>

            <View style={theme.row}>
                <Text style={[theme.body, theme.leftItems, theme.fontOnSurface]}>Contact:</Text>
                <Text style={[theme.body, theme.leftItems, theme.fontOnSurface]}>{show.phone}</Text>
            </View>

            <Text> </Text>
            <Text style={[theme.h6, theme.leftItems, theme.fontOnSurface]}>Permissions</Text>
            <Text style={theme.xSmall}> </Text>
                
            {/** 
             * manages rendering the permissions of the support person / person user supports
             * 
             * for support people, user can change permissions by checking/unchecking the check box
             * 
             * for people the user supports, they can only see the permissions that the patient has given them.
             */}
            {show.role === 'Support Person' ? (
                <View>
                <View>
                <Text style={[theme.xSmall, theme.leftItems, theme.fontOnSurface]}>{show.name} can:</Text>
                <Text style={theme.xSmall}> </Text>
                
                {(Object.keys(permissionsLabels) as (keyof Permissions)[]).map((id)=>(
                <Pressable
                    key={id}
                    style={[theme.leftItems, theme.row]}
                    onPress={onChange}
                >
                <Checkbox
                    style={styles.checkbox}
                    value={checked[id]}
                    onValueChange={() => toggle(id)}
                    color={checked[id] ? colours.primary: undefined}
                    />
                <Text style={[theme.small, theme.fontOnSurface]}>{permissionsLabels[id]}</Text>
                </Pressable>
            ))}
            </View>
                <Text style={theme.body}> </Text>
                <Text style={theme.body}> </Text>
                <View style={[theme.leftText, theme.boxContainer]}>
                    <TextWithIconButton
	                    label="Remove Support Person"
	                    onPress={() => setPending('removeSupportPerson')}
                        iconName="trash-bin-outline"
                    />
                </View>
            </View>
        ) : (
            <View>
                <Text style={[theme.small, theme.leftItems, theme.fontOnSurface]}>You can:</Text>
                <Text style={theme.xSmall}> </Text>

                {(Object.keys(permissionsLabels) as (keyof Permissions)[]).filter(id => checked[id]).map((id)=>(
                    // goes through a list with .map
                    // only renders if checked[key] === true, due to .filter(id => checked[id])
                    <View key={id} style={theme.leftItems}>
                    <View>
                        <Text style={[theme.small, theme.fontOnSurface]}>• {permissionsLabelsImSupporting[id]}</Text>  
                        <Text style={[theme.small, theme.fontOnSurface]}> </Text>  
                        </View>    
                    </View>
                ))}
                <Text style={theme.body}> </Text>
                <Text style={theme.body}> </Text>
                <View style={[theme.leftText, theme.boxContainer]}>
                    <TextWithIconButton
	                    label="Remove Connection"
	                    onPress={() => setPending('removeConnection')}
                        iconName="trash-bin-outline"
                    />
                </View>
            </View> 
    )}
          </ScrollView>
        </Pressable>

    <ConfirmModal
          visible={pending === 'removeConnection'}
          title="Are You Sure?"
          message={`Are you sure you want to remove ${show.name} as a connection?`}
          confirmLabel="Remove"
          cancelLabel='go back'
          onConfirm={handleConfirmations}
          onCancel={() => setPending(null)}
        />
    <ConfirmModal
          visible={pending === 'removeSupportPerson'}
          title="Are you Sure?"
          message={`Are you sure you want to remove ${show.name} as a Support Person?`}
          confirmLabel="Remove"
          cancelLabel='go back'
          onConfirm={handleConfirmations}
          onCancel={() => setPending(null)}
        />

    </Pressable>
    </Modal>
  );
}

export default PeopleModal;

function createStyles(colours: ColourSet){
    return StyleSheet.create({
        modalView: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            padding: 15,
        },
        card: {
          width: '100%',
          borderRadius: 28,
          padding: 26,
          paddingVertical:30,
          maxHeight: 600,
        },
        backgroundColour: {
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.6)'
        },
        checkbox: {
            margin: 8,
        },
    })};