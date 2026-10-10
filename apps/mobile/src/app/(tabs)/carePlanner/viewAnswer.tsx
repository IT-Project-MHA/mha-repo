/**
 * Support persons without permission to add answers view the doctor's answer to a question on this
 * screen, opened by pressing a question on the shared appointment page. The typed answer can only
 * be read and the recording can only be played.
 */
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import Button from '../../../../components/atomicUI/Button';
import { useTheme, ColourSet } from '../../../../context/ThemeContext';
import { textLayout } from '../../../../constants/layout';
import { useAppointment } from '../../../../context/AppointmentContext';

// formats seconds as minutes:seconds, e.g. 83.6 as '1:23'
const formatTime = (seconds: number) => {
  const whole = Math.max(0, Math.floor(seconds));
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, '0')}`;
};

export default function Screen() {
  const { colours } = useTheme();
  const styles = createStyles(colours);
  const { id, index } = useLocalSearchParams<{ id: string; index: string }>();
  const { findAppointment } = useAppointment();
  const question = findAppointment(id)?.questions[Number(index)];

  const player = useAudioPlayer(question?.recording ?? null);
  const { playing, currentTime, duration } = useAudioPlayerStatus(player);
  // played to the end, so the next play starts from the beginning
  const finished = duration > 0 && currentTime >= duration - 0.1;
  // paused part way through, so the next play carries on
  const pausedPartWay = !playing && currentTime > 0 && !finished;
  // how far playback has got, or 0 if it will start from the beginning
  const timePlayed = playing || pausedPartWay ? currentTime : 0;

  // pauses while playing, carries on if paused part way, otherwise plays from the start
  const togglePlayback = () => {
    if (playing) {
      player.pause();
    } else if (pausedPartWay) {
      player.play();
    } else {
      player.seekTo(0);
      player.play();
    }
  };

  if (!question) {
    return (
      <View style={styles.screen}>
        <View style={styles.content}>
          <Text style={styles.body}>This question could not be found.</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.question}>{question.text}</Text>

        <Text style={styles.heading}>Answer</Text>
        {question.answer ? (
          <View style={styles.field}>
            <Text style={styles.input}>{question.answer}</Text>
          </View>
        ) : (
          <Text style={styles.body}>No answer added</Text>
        )}

        <Text style={styles.heading}>Recorded answer</Text>
        {question.recording ? (
          // the time left shows once the recording has loaded
          <Button
            label={
              (playing ? 'Pause' : pausedPartWay ? 'Resume recording' : 'Play recording') +
              (duration > 0 ? `\n${formatTime(timePlayed)}/${formatTime(duration)}` : '')
            }
            onPress={togglePlayback}
            buttonType="primaryButton"
            style={styles.tallButton}
            textStyle={styles.centredText}
          />
        ) : (
          <Text style={styles.body}>No recording added</Text>
        )}
      </ScrollView>
    </View>
  );
}

function createStyles(colours: ColourSet) {
  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colours.background,
    },

    content: {
      paddingHorizontal: 16,
      paddingTop: 24,
      paddingBottom: 60,
      gap: 12,
    },

    // twice the height of a one line button
    tallButton: {
      minHeight: 2 * 24 + 2 * 12,
      justifyContent: 'center',
    },

    centredText: {
      textAlign: 'center',
    },

    question: {
      ...textLayout,
      fontSize: 22,
      lineHeight: 28,
      color: colours.onBackground,
    },

    heading: {
      ...textLayout,
      color: colours.onBackground,
      marginTop: 8,
    },

    body: {
      fontSize: 16,
      lineHeight: 24,
      letterSpacing: 0.5,
      color: colours.onBackground,
    },

    input: {
      fontSize: 16,
      lineHeight: 24,
      color: colours.onSurface,
    },

    field: {
      backgroundColor: colours.surface,
      borderRadius: 8,
      padding: 12,
    },
  });
}
