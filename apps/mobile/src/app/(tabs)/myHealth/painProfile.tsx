/**
 */
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import ButtonWithIcon from '../../../../components/atomicUI/ButtonWithIcon';
import { useRouter } from 'expo-router';
import { useTheme, ColourSet } from '../../../../context/ThemeContext';

export default function Screen() {
  const router = useRouter();
  const { theme, colours } = useTheme();
  const styles = createStyles(colours);

  return (
    <ScrollView stickyHeaderIndices={[0]}>
      <View style={theme.header}>
        <Text style={[theme.h4, theme.leftText, theme.fontOnSurface]}>My Pain Profile</Text>
      </View>

      {/**
       *
       */}
      <Text> </Text>
      <View style={[theme.sectionContainer, styles.filledCard]}>
        <View style={styles.cardItem}>
          <Text style={[theme.h4, theme.fontOnSurface]}>About me</Text>
        </View>
        <View style={theme.line}/>
        <View style={styles.cardItem}>
          <Text style={[theme.h6, theme.fontOnSurface]}>Name</Text>
          <Text style={[theme.body, theme.fontOnSurface]}>Placeholder</Text>
        </View>
        <View style={styles.cardItem}>
          <Text style={[theme.h6, theme.fontOnSurface]}>Sex</Text>
          <Text style={[theme.body, theme.fontOnSurface]}>Placeholder</Text>
        </View>
        <View style={styles.cardItem}>
          <Text style={[theme.h6, theme.fontOnSurface]}>Age group</Text>
          <Text style={[theme.body, theme.fontOnSurface]}>Placeholder</Text>
        </View>
      </View>

      <View style={[theme.sectionContainer, styles.filledCard]}>
        <View style={styles.cardItem}>
          <Text style={[theme.h4, theme.fontOnSurface]}>My conditions</Text>
        </View>
        <View style={theme.line}/>
        <View style={styles.cardItem}>
          <Text style={[theme.h6, theme.fontOnSurface]}>Primary condition</Text>
          <Text style={[theme.body, theme.fontOnSurface]}>Placeholder</Text>
        </View>
        <View style={styles.cardItem}>
          <Text style={[theme.h6, theme.fontOnSurface]}>Other conditions</Text>
          <Text style={[theme.body, theme.fontOnSurface]}>Placeholder</Text>
        </View>
      </View>

      <View style={[theme.sectionContainer, styles.filledCard]}>
        <View style={styles.cardItem}>
          <Text style={[theme.h4, theme.fontOnSurface]}>My Pain</Text>
          <Text style={[theme.body, theme.fontOnSurface]}>Severity of my pain, pattern and location</Text>
        </View>
        <View style={theme.line}/>
        <View style={styles.cardItem}>
          <Text style={[theme.h6, theme.fontOnSurface]}>My Pain location</Text>
          <Text style={[theme.body, theme.fontOnSurface]}>Placeholder</Text>
        </View>
        <View style={styles.cardItem}>
          <Text style={[theme.h6, theme.fontOnSurface]}>My Current pain:</Text>
          <Text style={[theme.body, theme.fontOnSurface]}>Placeholder</Text>
        </View>
        <View style={styles.cardItem}>
          <Text style={[theme.h6, theme.fontOnSurface]}>Average pain (2 weeks):</Text>
          <Text style={[theme.body, theme.fontOnSurface]}>Placeholder</Text>
        </View>
        <View style={styles.cardItem}>
          <Text style={[theme.h6, theme.fontOnSurface]}>Worst pain:</Text>
          <Text style={[theme.body, theme.fontOnSurface]}>Placeholder</Text>
        </View>
        <View style={styles.cardItem}>
          <Text style={[theme.h6, theme.fontOnSurface]}>Mildest pain:</Text>
          <Text style={[theme.body, theme.fontOnSurface]}>Placeholder</Text>
        </View>
        <View style={styles.cardItem}>
          <Text style={[theme.h6, theme.fontOnSurface]}>Pain characteristics</Text>
          <Text style={[theme.body, theme.fontOnSurface]}>Placeholder</Text>
        </View>
      </View>


      <View style={[theme.sectionContainer, styles.filledCard]}>
        <View style={styles.cardItem}>
          <Text style={[theme.h4, theme.fontOnSurface]}>Impacts to Movement</Text>
        </View>
        <View style={theme.line}/>
        <View style={styles.cardItem}>
          <Text style={[theme.h6, theme.fontOnSurface]}>Average activity hour:</Text>
          <Text style={[theme.body, theme.fontOnSurface]}>Placeholder</Text>
        </View>
        <View style={styles.cardItem}>
          <Text style={[theme.h6, theme.fontOnSurface]}>General Movement:</Text>
          <Text style={[theme.body, theme.fontOnSurface]}>Placeholder</Text>
        </View>
        <View style={styles.cardItem}>
          <Text style={[theme.h6, theme.fontOnSurface]}>Walking:</Text>
          <Text style={[theme.body, theme.fontOnSurface]}>Placeholder</Text>
        </View>
        <View style={styles.cardItem}>
          <Text style={[theme.h6, theme.fontOnSurface]}>Lifting:</Text>
          <Text style={[theme.body, theme.fontOnSurface]}>Placeholder</Text>
        </View>
        <View style={styles.cardItem}>
          <Text style={[theme.h6, theme.fontOnSurface]}>Sitting:</Text>
          <Text style={[theme.body, theme.fontOnSurface]}>Placeholder</Text>
        </View>
        <View style={styles.cardItem}>
          <Text style={[theme.h6, theme.fontOnSurface]}>Standing:</Text>
          <Text style={[theme.body, theme.fontOnSurface]}>Placeholder</Text>
        </View>
      </View>

      <View style={[theme.sectionContainer, styles.filledCard]}>
        <View style={styles.cardItem}>
          <Text style={[theme.h4, theme.fontOnSurface]}>Impacts to Personal Care</Text>
        </View>
        <View style={theme.line}/>
        <View style={styles.cardItem}>
          <Text style={[theme.h6, theme.fontOnSurface]}>General Activities:</Text>
          <Text style={[theme.body, theme.fontOnSurface]}>Placeholder</Text>
        </View>
        <View style={styles.cardItem}>
          <Text style={[theme.h6, theme.fontOnSurface]}>Personal care (washing, dressing, etc):</Text>
          <Text style={[theme.body, theme.fontOnSurface]}>Placeholder</Text>
        </View>
        <View style={styles.cardItem}>
          <Text style={[theme.h6, theme.fontOnSurface]}>Sleeping:</Text>
          <Text style={[theme.body, theme.fontOnSurface]}>Placeholder</Text>
        </View>
      </View>

      <View style={[theme.sectionContainer, styles.filledCard]}>
        <View style={styles.cardItem}>
          <Text style={[theme.h4, theme.fontOnSurface]}>Impacts to Social Health</Text>
        </View>
        <View style={theme.line}/>
        <View style={styles.cardItem}>
          <Text style={[theme.h6, theme.fontOnSurface]}>Social life:</Text>
          <Text style={[theme.body, theme.fontOnSurface]}>Placeholder</Text>
        </View>
        <View style={styles.cardItem}>
          <Text style={[theme.h6, theme.fontOnSurface]}>Travelling:</Text>
          <Text style={[theme.body, theme.fontOnSurface]}>Placeholder</Text>
        </View>
        <View style={styles.cardItem}>
          <Text style={[theme.h6, theme.fontOnSurface]}>Mood:</Text>
          <Text style={[theme.body, theme.fontOnSurface]}>Placeholder</Text>
        </View>
        <View style={styles.cardItem}>
          <Text style={[theme.h6, theme.fontOnSurface]}>Relation with others:</Text>
          <Text style={[theme.body, theme.fontOnSurface]}>Placeholder</Text>
        </View>
        <View style={styles.cardItem}>
          <Text style={[theme.h6, theme.fontOnSurface]}>Enjoyment of life:</Text>
          <Text style={[theme.body, theme.fontOnSurface]}>Placeholder</Text>
        </View>
      </View>

      <View style={[theme.sectionContainer, styles.filledCard]}>
        <View style={styles.cardItem}>
          <Text style={[theme.h4, theme.fontOnSurface]}>My Current Management</Text>
        </View>
        <View style={theme.line}/>
        <View style={styles.cardItem}>
          <Text style={[theme.h6, theme.fontOnSurface]}>Medication:</Text>
          <Text style={[theme.body, theme.fontOnSurface]}>Placeholder</Text>
        </View>
        <View style={styles.cardItem}>
          <Text style={[theme.h6, theme.fontOnSurface]}>Exercise:</Text>
          <Text style={[theme.body, theme.fontOnSurface]}>Placeholder</Text>
        </View>
        <View style={styles.cardItem}>
          <Text style={[theme.h6, theme.fontOnSurface]}>Emotion:</Text>
          <Text style={[theme.body, theme.fontOnSurface]}>Placeholder</Text>
        </View>
      </View>


      <View style={theme.bottomGap}/>

    </ScrollView>

  );
}

function createStyles(colours: ColourSet){
    return StyleSheet.create({
      card: {
        gap: 12,
      },

      cardItem: {
        width: '85%',
        alignSelf: 'center',
      },

      filledCard: {
        gap: 12,
        marginBottom: 30,
      },
})
};
