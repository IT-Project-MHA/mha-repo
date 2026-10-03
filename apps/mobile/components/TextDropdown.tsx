 import React, { useState } from 'react';
  import { StyleSheet } from 'react-native';
  import { Dropdown } from 'react-native-element-dropdown';
  import { useTheme, ColourSet } from '../context/ThemeContext';


  const data = [
    { label: 'Size 1', value: 1 },
    { label: 'Size 2', value: 1.5 },
    { label: 'Size 3', value: 2 },
    { label: 'Size 4', value: 2.5 },
  ];

  const DropdownComponent = () => {
    const [value] = useState(null);
    const {colours, setFontScale }= useTheme();
    const styles = createStyles(colours);

    return (
      <Dropdown
        style={styles.dropdown}
        placeholderStyle={styles.placeholderStyle}
        selectedTextStyle={styles.selectedTextStyle}
        inputSearchStyle={styles.inputSearchStyle}
        data={data}
        maxHeight={300}
        labelField="label"
        valueField="value"
        placeholder="Select Size"
        value={value}
        onChange={item => {setFontScale(item.value);}}
      />
    );
  };

  export default DropdownComponent;


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

    shadowColor: colours.tertiary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 4,
  },

  line: {
    height: 3,
    backgroundColor: colours.onBackground,
    width: '89%',
    borderRadius: 300,
    //marginHorizontal: 20,
  },
  row: {
    flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        alignSelf: 'stretch',
    },
    dropdown: {
      margin: 16,
      height: 50,
      borderBottomColor: 'gray',
      borderBottomWidth: 0.5,
      width: '20%',
    },
    icon: {
      marginRight: 5,
    },
    placeholderStyle: {
      fontSize: 16,
    },
    selectedTextStyle: {
      fontSize: 16,
    },
    inputSearchStyle: {
      height: 0,
    },
})
};