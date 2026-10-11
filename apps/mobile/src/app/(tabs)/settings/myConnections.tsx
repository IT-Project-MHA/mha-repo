/**
 * My Connections
 * 
 * in this screen users can view their support people, who theyre supporting, and remove them.
 * 
 * not linked to api yet- for demonstration purposes rn
 */
import { View, Text, StyleSheet, ScrollView} from 'react-native';
import { useTheme, ColourSet } from '../../../../context/ThemeContext';
import ButtonWithIcon from '../../../../components/atomicUI/ButtonWithIcon';
import { useState } from 'react';
import TextButton from '../../../../components/atomicUI/TextButton';
import PeopleModal, {Permissions} from '../../../../components/atomicUI/PeopleModal';

type People ={
  id: string;
  name: string;
  role: string;
  phone: string;
  relationship: 'supportsMe' | 'imSupporting';
  permissions: Permissions;
};

const peoplePermissions: Permissions  = {
  viewAppointments: true,
  addQuestions: true,
  addRecords: true,
};

/**
 * examples of how data will be input
 */
const johnSmithPermissions: Permissions  = {
  viewAppointments: false,
  addQuestions: false,
  addRecords: true,
};
const susanPermissions: Permissions  = {
  viewAppointments: true,
  addQuestions: false,
  addRecords: true,
};
const underscoresPermissions: Permissions  = {
  viewAppointments: false,
  addQuestions: false,
  addRecords: true,
};

/**
 * these values will be retreived with API
 */
const placeholderPeople: People[] =[
  {id: '1', name: 'John Smith', role: 'Support Person', phone: '+61 254 973 921', relationship: 'supportsMe', permissions: johnSmithPermissions},
  {id: '2', name: 'Frida Kahlo', role: 'Support Person', phone: '+61 254 973 921', relationship: 'supportsMe', permissions: peoplePermissions},
  {id: '1', name: 'Susan Sontag', role: 'Im Supporting', phone: '+61 254 973 921', relationship: 'imSupporting', permissions: susanPermissions},
  {id: '2', name: 'Georgia OKeefe', role: 'Im Supporting', phone: '+61 254 973 921', relationship: 'imSupporting', permissions: peoplePermissions},
  {id: '3', name: 'Underscores', role: 'Im Supporting', phone: '+61 254 973 921', relationship: 'imSupporting', permissions: underscoresPermissions},
]
  

export default function Screen() {
  const {theme} = useTheme();
  const [people, setPeople] =useState<People[]>(placeholderPeople);
  const [selected, setselected] = useState<People | null >(null);
  const [pending, setPending] = useState< 'removeSupportPeople' | 'removeImSupporting' | null>(null);

  /**
   * This function manages rendering people of different relationship types.
   * @param title Title of the button, being the persons name.
   * @param relationship 'Support Person' or 'I'm Supporting'
   * @returns A styled list of people of a certain relationship to the user.
   */
  const renderSection = (title: string, relationship: People['relationship']) => {
    const peopleList = people.filter((by)=>by.relationship === relationship);
    
    return (
      <View style ={theme.layoutContainer}>
       <View>
          {peopleList.map((people,index) => (
            <View key={people.id} style={[[theme.layoutContainer,theme.centerItems]]}>
              {index > 0 && <View style={theme.line} />}
              <ButtonWithIcon
                label={people.name}
                onPress={()=> setselected(people)}
                buttonType='transparentButton'
                name="chevron-forward-outline"
                />
            </View>
            
          ))}
        </View>  
        </View>   
    );
  };

  /**
   * Returns screen displaying users support people and users that they support
   * 
   * By pressing edit details, user should be a able to remove people
   * 
   * By pressing on the name of a Support Person, user can see their details and update their permissions.
   */
  return (
   
    <ScrollView stickyHeaderIndices={[0]}>
      <View style={theme.header}>
        <Text style={[theme.h4, theme.leftText, theme.fontOnSurface]}>My Connections</Text>
      </View>
      <Text> </Text>
      
      <View style={[theme.sectionContainer]}>
        <Text> </Text>
        <Text style={[theme.h5, theme.leftText, theme.fontOnSurface]}>My Support People</Text>
        <Text> </Text>
        <View style={theme.line}></View>
        <Text> </Text>
        {renderSection('My Support People', 'supportsMe')}
  
        <View style={[theme.rightItems]}>
          <TextButton
	        label="Add Support Person"
	        onPress={() => setPending('removeSupportPeople')}
          />
        </View> 
          
      </View>

      <Text> </Text>
      <Text> </Text>

      <View style={theme.sectionContainer}>
        <Text> </Text>
        <Text style={[theme.h5, theme.leftText, theme.fontOnSurface]}>My Connections </Text>
        <Text> </Text>
        <View style={theme.line}></View>
        <Text> </Text>

        {renderSection('Im Supporting', 'imSupporting')}

        <View style={[theme.layoutContainer,theme.centerItems]}>
  
        </View>
      
      </View>

      <PeopleModal
        visible={selected !== null}
        name={selected?.name??''} // name or null
        role={selected?.role??''}
        phone={selected?.phone??''}
        permissions={selected?.permissions ?? peoplePermissions}
        onChange = {() => {}} // void atm, will deal with permission change logic
        onCancel={() => setselected(null)}
      />

      <View style={theme.bottomGap}/>

    </ScrollView>
  );
}

function createStyles(colours: ColourSet){
    return StyleSheet.create({  
})
};
