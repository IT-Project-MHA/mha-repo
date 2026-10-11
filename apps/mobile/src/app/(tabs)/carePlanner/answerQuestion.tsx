/**
 * Patients, or support persons allowed to add answers, type or record the doctor's answer to a
 * question from this screen, opened by pressing a question on the appointment details or shared
 * appointment page.
 */
import { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Alert } from 'react-native';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import Button from '../../../../components/atomicUI/Button';
import SignatureCanvas, { SignatureViewRef } from 'react-native-signature-canvas';
import {
  useAudioPlayer,
  useAudioPlayerStatus,
  useAudioRecorder,
  useAudioRecorderState,
  RecordingPresets,
  RecordingOptions,
  AudioQuality,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
} from 'expo-audio';
import { useTheme, ColourSet } from '../../../../context/ThemeContext';
import { textLayout } from '../../../../constants/layout';
import { useTheme as usePaperTheme } from 'react-native-paper';
import { useAppointment, AppointmentQuestion } from '../../../../context/AppointmentContext';

// hides the canvas's own clear & confirm buttons, this screen has its own
const SIGNATURE_STYLE = `
  .m-signature-pad { box-shadow: none; border: none; margin: 0; }
  .m-signature-pad--body { border: none; }
  .m-signature-pad--footer { display: none; margin: 0; }
  body, html { height: 100%; }
`;

// recordings stop automatically after 2 minutes
const MAX_RECORDING_SECONDS = 2 * 60;

// expo-audio high preset lowered to one channel at half the bit rate
const MEDIUM_QUALITY: RecordingOptions = {
  ...RecordingPresets.HIGH_QUALITY,
  numberOfChannels: 1,
  bitRate: 64000,
  ios: { ...RecordingPresets.HIGH_QUALITY.ios, audioQuality: AudioQuality.MEDIUM },
};

// formats seconds as minutes:seconds, e.g. 83.6 as '1:23'
const formatTime = (seconds: number) => {
  const whole = Math.max(0, Math.floor(seconds));
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, '0')}`;
};

export default function Screen() {
  const { colours } = useTheme();
  const styles = createStyles(colours);
  const { colors: paperColours } = usePaperTheme();
  const { id, index } = useLocalSearchParams<{ id: string; index: string }>();
  const navigation = useNavigation();
  const { findAppointment, updateAppointment, updateQuestion: updateAppointmentQuestion } =
    useAppointment();
  const appointment = findAppointment(id);
  const question = appointment?.questions[Number(index)];

  // starts with the saved answer, saved to the appointment as it is typed
  const [answer, setAnswer] = useState(question?.answer ?? '');
  // the signature canvas is shown in place of the doctor's permission button while signing
  const [signing, setSigning] = useState(false);
  const signatureRef = useRef<SignatureViewRef>(null);
  // stops the page scrolling while the doctor draws
  const [drawing, setDrawing] = useState(false);

  const recorder = useAudioRecorder(MEDIUM_QUALITY);
  const { isRecording, durationMillis } = useAudioRecorderState(recorder);
  // true from pressing record until the recording is submitted, including while it is paused
  const [recordingStarted, setRecordingStarted] = useState(false);
  const player = useAudioPlayer(question?.recording ?? null);
  const { playing, currentTime, duration } = useAudioPlayerStatus(player);

  // played to the end, so the next play starts from the beginning
  const finished = duration > 0 && currentTime >= duration - 0.1;
  // paused part way through, so the next play carries on
  const pausedPartWay = !playing && currentTime > 0 && !finished;

  // changes this question only in the appointment
  const updateQuestion = (changes: Partial<AppointmentQuestion>) =>
    updateAppointmentQuestion(id, Number(index), changes);

  // the box keeps exactly what is typed, the saved answer is trimmed and a blank one is removed
  const changeAnswer = (text: string) => {
    setAnswer(text);
    updateQuestion({ answer: text.trim() || undefined });
  };

  // asks for the microphone the first time, then records until submit is pressed or 2 minutes of
  // recording pass, pauses don't count towards the 2 minutes
  const startRecording = async () => {
    const { granted } = await requestRecordingPermissionsAsync();
    if (!granted) {
      Alert.alert('Microphone needed', 'Allow microphone access in settings to record the answer.');
      return;
    }
    player.pause();
    await setAudioModeAsync({ playsInSilentMode: true, allowsRecording: true });
    await recorder.prepareToRecordAsync();
    recorder.record();
    setRecordingStarted(true);
  };

  // record carries on a paused recording instead of starting a new one
  const togglePauseRecording = () => {
    if (isRecording) recorder.pause();
    else recorder.record();
  };

  // stops the recording and saves it to the question
  const submitRecording = async () => {
    setRecordingStarted(false);
    const uri = recorder.uri;
    await recorder.stop();
    if (uri) updateQuestion({ recording: uri });
    // lets playback use the loudspeaker again on iOS
    setAudioModeAsync({ allowsRecording: false });
  };

  // submits automatically after 2 minutes of recording, expo-audio's own time limit (forDuration)
  // keeps counting while paused so it isn't used
  useEffect(() => {
    if (recordingStarted && durationMillis >= MAX_RECORDING_SECONDS * 1000) submitRecording();
  }, [recordingStarted, durationMillis]);

  // leaving the page submits a recording in progress, saved straight to the appointment as the
  // page closes before the recording has stopped
  useEffect(
    () =>
      navigation.addListener('beforeRemove', () => {
        if (recordingStarted) submitRecording();
      }),
    [navigation, recordingStarted],
  );

  // how far playback has got, or 0 if it will start from the beginning
  const timePlayed = playing || pausedPartWay ? currentTime : 0;

  const deleteRecording = () => {
    player.pause();
    updateQuestion({ recording: undefined });
  };

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

  // opens the canvas, the saved signature is shown on it if the doctor has already signed
  const startSigning = () => setSigning(true);

  // closes the canvas and takes back the doctor's permission if it was given, which also deletes
  // the recordings of every question in the appointment
  const cancelSigning = () => {
    setSigning(false);
    if (appointment?.doctorPermission) {
      updateAppointment(id, {
        doctorPermission: false,
        doctorSignature: undefined,
        questions: appointment.questions.map((item) => ({ ...item, recording: undefined })),
      });
    }
  };

  // called by the canvas with the signature as an image after save is pressed, the canvas calls
  // onEmpty instead when nothing is drawn, so an empty canvas saves nothing
  const saveSignature = (signature: string) => {
    updateAppointment(id, { doctorPermission: true, doctorSignature: signature });
    setSigning(false);
  };

  // which buttons the record answer section shows, recording is only allowed once the doctor has
  // signed
  const recordingStep = signing ? 'signing'
    : !appointment?.doctorPermission ? 'needsPermission'
    : recordingStarted ? 'recording'
    : question?.recording ? 'recorded'
    : 'ready';

  const signatureButton = (
    <Button
      label={appointment?.doctorPermission ? "View doctor's signature" : "Get doctor's permission"}
      onPress={startSigning}
      buttonType="primaryButton"
    />
  );

  const renderRecordingSection = () => {
    switch (recordingStep) {
      case 'signing':
        return (
          <>
            <View style={styles.canvas}>
              <SignatureCanvas
                ref={signatureRef}
                dataURL={appointment?.doctorSignature}
                onOK={saveSignature}
                onEmpty={() => {}}
                onBegin={() => setDrawing(true)}
                onEnd={() => setDrawing(false)}
                webStyle={SIGNATURE_STYLE}
              />
            </View>
            <View style={styles.buttonRow}>
              <Button
                label="Cancel"
                onPress={cancelSigning}
                buttonType="secondaryButton"
                style={styles.rowButton}
              />
              <Button
                label="Clear"
                onPress={() => signatureRef.current?.clearSignature()}
                buttonType="secondaryButton"
                style={styles.rowButton}
              />
              <Button
                label="Save"
                onPress={() => signatureRef.current?.readSignature()}
                buttonType="primaryButton"
                style={styles.rowButton}
              />
            </View>
          </>
        );

      case 'needsPermission':
        return signatureButton;

      case 'recording':
        return (
          <>
            <Button
              label={
                (isRecording ? 'Pause' : 'Resume') +
                `\n${formatTime(durationMillis / 1000)}/${formatTime(MAX_RECORDING_SECONDS)}`
              }
              onPress={togglePauseRecording}
              buttonType="primaryButton"
              style={styles.tallButton}
              textStyle={styles.centredText}
            />
            {/* replaces the doctor's signature button while recording */}
            <Button label="Submit" onPress={submitRecording} buttonType="primaryButton" />
          </>
        );

      case 'recorded':
        return (
          <>
            {/* the time left shows once the recording has loaded */}
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
            <Button label="Delete recording" onPress={deleteRecording} buttonType="secondaryButton" />
            {signatureButton}
          </>
        );

      case 'ready':
        return (
          <>
            <Button
              label="Record"
              onPress={startRecording}
              buttonType="primaryButton"
              style={styles.tallButton}
            />
            {signatureButton}
          </>
        );
    }
  };

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} scrollEnabled={!drawing}>
        {!!question && <Text style={styles.question}>{question.text}</Text>}

        <Text style={styles.heading}>Type answer</Text>
        <TextInput
          style={[styles.field, styles.input, styles.answerInput]}
          value={answer}
          onChangeText={changeAnswer}
          placeholder="answer"
          placeholderTextColor={paperColours.onSurfaceVariant}
          multiline
          numberOfLines={3}
        />

        <Text style={styles.heading}>Record answer</Text>
        {renderRecordingSection()}
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
      paddingBottom: 60, // keeps the last button above the nav bar
      gap: 12,
    },

    // the signature is saved as an image, so the canvas stays white like paper in both themes
    canvas: {
      height: 200,
      borderRadius: 8,
      overflow: 'hidden',
      backgroundColor: '#ffffff',
    },

    buttonRow: {
      flexDirection: 'row',
      gap: 8,
    },

    // shares the row equally, the button types' side padding is too wide for three in a row
    rowButton: {
      flex: 1,
      paddingHorizontal: 0,
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

    // three lines of text plus the field's padding, typing starts at the top
    answerInput: {
      minHeight: 3 * 24 + 2 * 12,
      textAlignVertical: 'top',
    },
  });
}
