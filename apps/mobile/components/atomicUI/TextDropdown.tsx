 import React, { useState } from 'react';
  import { StyleSheet } from 'react-native';
  import { Dropdown } from 'react-native-element-dropdown';
  import { useTheme, ColourSet } from '../../context/ThemeContext';

  const data = [
    { label: 'Size 1', value: 1 },
    { label: 'Size 2', value: 1.5 },
    { label: 'Size 3', value: 2 },
  ];

  const DropdownComponent = () => {
    const [value] = useState(null);
    const {colours, setFontScale, theme}= useTheme();
    const styles = createStyles(colours);

    return (
      <Dropdown
        style={styles.dropdown}
        placeholderStyle={[theme.small, styles.text]}
        selectedTextStyle={[theme.small, styles.text]}
        inputSearchStyle={[theme.small, styles.text]}
        data={data}
        minHeight={300}
        labelField="label"
        valueField="value"
        placeholder="Select Size"
        value={value}
        onChange={item => {setFontScale(item.value);}}
        mode= 'modal'
      />
    );
  };

  export default DropdownComponent;


function createStyles(colours: ColourSet){
    return StyleSheet.create({
    dropdown: {
      height: 50,
      marginTop:10,
      borderBottomColor: colours.onSurface,
      borderBottomWidth: 1,
      width: '90%',    
    },
    inputSearchStyle: {
      height: 10,
    },
    text: {
      color: colours.onSurface,
    }
})
};