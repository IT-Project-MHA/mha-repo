/**
 * Support persons without permission to add answers view the doctor's answer to a question on this
 * screen, opened by pressing a question on the shared appointment page. The typed answer can only
 * be read and the recording can only be played.
 */
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import Button from '../../../../components/atomicUI/Button';
import { useTheme, ColourSet } from '../../../../context/ThemeContext';
import { Typography } from '../../../../constants/textSize';
import { useAppointment } from '../../../../context/AppointmentContext';
import { apiAppointmentAnswerRecording } from '../../../api/django-API';

// formats seconds as minutes:seconds, e.g. 83.6 as '1:23'
const formatTime = (seconds: number) => {
  const whole = Math.max(0, Math.floor(seconds));
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, '0')}`;
};

export default function Screen() {
  const { colours, theme } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = createStyles(colours, theme, insets.bottom);
  const { id, index } = useLocalSearchParams<{ id: string; index: string }>();
  const { findAppointment } = useAppointment();
  const question = findAppointment(id)?.questions[Number(index)];

  // a saved recording is downloaded from the server, which needs the user's token
  const player = useAudioPlayer(
    question?.recording?.startsWith('http') && question.answerId
      ? apiAppointmentAnswerRecording('select', { id: question.answerId })
      : (question?.recording ?? null),
  );
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
          <Text style={[styles.body, theme.leftText]}>This question could not be found.</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScrollView stickyHeaderIndices={[0]} contentContainerStyle={styles.content}>
        <View style={[theme.header, styles.title]}>
          <Text style={[theme.h4, theme.leftText, theme.fontOnSurface]}>View Answer</Text>
        </View>
        <View style={[theme.sectionContainer, styles.card]}>
          <View style={styles.cardContent}>
            <Text style={styles.question}>{question.text}</Text>

            <Text style={styles.heading}>Typed answer</Text>
            {question.answer ? (
              <View style={styles.field}>
                <Text style={styles.input}>{question.answer}</Text>
              </View>
            ) : (
              <Text style={styles.body}>No answer added</Text>
            )}

            <View style={[theme.line, styles.answerDivider]} />

          <Text style={styles.heading}>Recorded answer</Text>
            {question.recording ? (
              // the time shows once the recording has loaded, kept short to fit on one line
              <Button
                label={
                  duration > 0
                    ? `${playing ? 'Pause' : pausedPartWay ? 'Resume' : 'Play'}  ` +
                      `${formatTime(timePlayed)}/${formatTime(duration)}`
                    : 'Play recording'
                }
                onPress={togglePlayback}
                buttonType="roundButton"
              />
            ) : (
              <Text style={styles.body}>No recording added</Text>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function createStyles(colours: ColourSet, text: Typography, bottomInset: number) {
  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colours.background,
    },

    content: {
      paddingBottom: 120 + bottomInset,
      gap: 38,
    },

    title: {
      marginBottom: -19,
    },

    card: {
      gap: 12,
    },

    cardContent: {
      width: '85%',
      alignSelf: 'center',
      gap: 12,
    },

    question: {
      ...text.h5,
      color: colours.onBackground,
    },

    answerDivider: {
      width: '100%',
      marginTop: 12,
    },

    heading: {
      ...text.h6,
      color: colours.onSurface,
      marginTop: 8,
    },

    body: {
      ...text.body,
      color: colours.onBackground,
    },

    input: {
      ...text.body,
      color: colours.onSurface,
    },

    field: {
      backgroundColor: colours.background,
      borderRadius: 8,
      padding: 12,
    },
  });
}
