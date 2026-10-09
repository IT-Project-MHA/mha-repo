/**
 * Modal which presents information of user support people and users the user supports
 * 
 * change logic will be implemented with api:
 *  - user should be able to remove support people / remove themselves as a support person by pressing 'edit details'
 *  - user can change support person permissions
 */
import React from "react";
import {Modal, View, Text, Pressable, StyleSheet, ScrollView} from 'react-native'
import { useTheme, ColourSet } from "../context/ThemeContext";
import { Checkbox } from 'expo-checkbox';
import { useState, useEffect, useRef } from "react";

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
    addRecords: "Add records to appointments"
}

const permissionsLabelsImSupporting: Record<keyof Permissions, string> ={
    viewAppointments: "View their appointments",
    addQuestions: "Add questions to their appointments",
    addRecords: "Add records to their appointments"

}

const PeopleModal = ({visible, name, role, phone, permissions, onChange, onCancel} : Props) => {
    const { theme, colours } = useTheme();
    const styles = createStyles(colours);
    const [checked, setChecked] = useState<Permissions>(permissions); // monitors check box's for permissions
    const last = useRef({role, name, phone});

    /**
     * prevents glitch where modal rerenders on fadeout and probs become undefined
     * (this is an issue as the rendering is dependant on conditions)
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


  return (
    <Modal
        visible = {visible}
        transparent = {true} // display app in background
        animationType="fade"
        onRequestClose={onCancel} // considers tapping out of frame a 'cancel' scenario
    > 

    <View style={styles.backgroundColour}/>             
    
    <Pressable style={styles.modalView} onPress={onCancel}> 
        
        <Pressable
            style={[styles.card, { backgroundColor: colours.surface}]}
            onPress={() => {}}
            >
            <ScrollView>
            
          <Text style={[theme.h4, theme.leftItems, theme.fontOnSurface]}>{show.name}</Text>

          <Text> </Text>
        
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

            {show.role === 'Support Person' ? (
                <>
                <Text style={[theme.xSmall, theme.leftItems, theme.fontOnSurface]}>{show.name} can:</Text>
                <Text style={theme.xSmall}> </Text>
                
                {(Object.keys(permissionsLabels) as (keyof Permissions)[]).map((key)=>(
                <Pressable
                    key={key}
                    style={[theme.leftItems, theme.row]}
                    onPress={onChange}
                >
                <Checkbox
                    style={styles.checkbox}
                    value={checked[key]}
                    onValueChange={() => toggle(key)}
                    color={checked[key] ? colours.primary: undefined}
                    />

                <Text style={[theme.small, theme.fontOnSurface]}>{permissionsLabels[key]}</Text>
                </Pressable>
            ))}
        </>
        ) : (
            <>
                <Text style={[theme.small, theme.leftItems, theme.fontOnSurface]}>You can:</Text>
                <Text style={theme.xSmall}> </Text>
                
                {(Object.keys(permissionsLabels) as (keyof Permissions)[]).map((key)=>(
                <View style={theme.leftItems}>
                    <Text style={[theme.small, theme.fontOnSurface]}>• {permissionsLabelsImSupporting[key]}</Text>
                    <Text style={theme.xSmall}> </Text>
                </View>
                ))}
            </> 
    )}

            <Text> </Text>

          </ScrollView>
        </Pressable>
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
          padding: 24,
          maxHeight: 400,
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