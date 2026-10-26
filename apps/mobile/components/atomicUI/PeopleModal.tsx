/**
 * Modal which presents information of user support people and users the user supports
 * 
 * user can remove support people / remove themselves as a support person. 
 * 
 * Permissions are shown, as the API has no link-level permissions to change (add questions and record
 * answers are given for each appointment).
 * 
 */
import {Modal, View, Text, Pressable, StyleSheet, ScrollView} from 'react-native'
import { useTheme, ColourSet } from "../../context/ThemeContext";
import { useState, useEffect, useRef } from "react";
import ConfirmModal from './ConfirmModal';
import TextWithIconButton from './TextWithIconButton'

type Props = {
    visible: boolean;
    name: string;
    role: string;
    phone: string; // blank if not known
    viewAppointments: boolean; // can_view_appointments of the SupportLink
    onRemove: () => Promise<void>; // removes the connection with the api, shows its own errors
    onCancel: () => void;
}

const PeopleModal = ({visible, name, role, phone, viewAppointments, onRemove, onCancel} : Props) => {
    const { theme, colours } = useTheme();
    const styles = createStyles(colours);
    const [pending, setPending] = useState< 'removeConnection' | 'removeSupportPerson' | 'addSupportPerson' | null>(null);
    const last = useRef({role, name, phone, viewAppointments});

    /**
     * prevents glitch where modal rerenders on fadeout and probs become undefined
     * (this is an issue as the rendering is dependant on conditions regarding data)
     * 
     */
    if (visible) last.current = {name, role, phone, viewAppointments};
    const show = last.current;

    /**
    * Handles confirmations (when user clicks confirm in a modal) whilst in pending states.
    * Both confirmations remove the connection, the parent chooses how.
    */
    const handleConfirmations = async () => {
        setPending(null);
        await onRemove();
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

            {show.phone !== '' && (
                <>
                <Text> </Text>
                <View style={theme.row}>
                    <Text style={[theme.body, theme.leftItems, theme.fontOnSurface]}>Contact:</Text>
                    <Text style={[theme.body, theme.leftItems, theme.fontOnSurface]}>{show.phone}</Text>
                </View>
                </>
            )}

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
                <Text style={[theme.small, theme.leftItems, theme.fontOnSurface]}>
                    {show.viewAppointments ? '• View my appointments' : '• Only see appointments I share with them'}
                </Text>
                <Text style={theme.xSmall}> </Text>
                <Text style={[theme.xSmall, theme.leftItems, theme.fontOnSurface]}>
                    Adding questions and recording answers is set for each appointment.
                </Text>
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
                <Text style={[theme.small, theme.leftItems, theme.fontOnSurface]}>
                    {show.viewAppointments ? '• View their appointments' : '• Only see appointments they share with you'}
                </Text>
                <Text style={theme.xSmall}> </Text>
                <Text style={[theme.xSmall, theme.leftItems, theme.fontOnSurface]}>
                    Adding questions and recording answers is set for each appointment.
                </Text>
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