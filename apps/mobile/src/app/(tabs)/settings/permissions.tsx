/**
 * NOT IMPLEMENTED ! :(
 */
import { View, Text, ScrollView } from 'react-native';
import { useTheme } from '../../../../context/ThemeContext';
import Toggle from '../../../../components/atomicUI/Toggle'
import { useState } from 'react';

export default function Screen() {
  const {theme} = useTheme();
  const [toggleOn, setToggleOn] = useState(false);

  // all toggles in this doc are dependant on this (to be changed!)
  // so toggling one toggles all
  const onToggle = () => setToggleOn(prev => !prev); // turns it on

  return (
    <ScrollView stickyHeaderIndices={[0]}>
      <View style={theme.header}>
        <Text style={[theme.h4, theme.leftText, theme.fontOnSurface]}>Permissions</Text>
      </View>
      <Text> </Text>

    <View style={[theme.container]}>
      <View style={theme.row}>
        <Text style={[theme.h6, theme.leftText, theme.fontOnSurface]}>Microphone</Text>
          <Toggle
            onToggle={onToggle}
            switchOn={toggleOn}
          />
      </View>

      <Text> </Text>

      <View style={theme.line}/>
      <Text> </Text>

      <View style={theme.row}>
      <Text style={[theme.h6, theme.leftText, theme.fontOnSurface]}>Notifications</Text>
        <Toggle
            onToggle={onToggle}
            switchOn={toggleOn}
          />
      </View>
      <Text> </Text>

      <View style={[theme.row]}>
        <Text style={[theme.body, theme.leftText, theme.fontOnSurface]}>Weekly Assesment Reminders</Text>
          <Toggle
            onToggle={onToggle}
            switchOn={toggleOn}
          />
      </View>

      <View style={[theme.row]}>
        <Text style={[theme.body, theme.leftText, theme.fontOnSurface]}>Appointment Reminders</Text>
         <Toggle
            onToggle={onToggle}
            switchOn={toggleOn}
          />
      </View>
      
    </View>
    <View style={theme.bottomGap}/>
    </ScrollView>
  );
}