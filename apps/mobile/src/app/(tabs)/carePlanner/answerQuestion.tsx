/**
 * Patients type or record the doctor's answer to a question from this screen, opened by pressing
 * a question on the appointment details page.
 */
import { useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Button from '../../../../components/atomicUI/Button';
import SignatureCanvas, { SignatureViewRef } from 'react-native-signature-canvas';
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

export default function Screen() {
  const { colours } = useTheme();
  const styles = createStyles(colours);
  const { colors: paperColours } = usePaperTheme();
  const { id, index } = useLocalSearchParams<{ id: string; index: string }>();
  const router = useRouter();
  const { appointments, updateAppointment } = useAppointment();
  const appointment = appointments.find((item) => item.id === id);
  const question = appointment?.questions[Number(index)];

  // starts with the saved answer, only saved to the appointment when save is pressed
  const [answer, setAnswer] = useState(question?.answer ?? '');
  // the signature canvas is shown in place of the doctor's permission button while signing
  const [signing, setSigning] = useState(false);
  const signatureRef = useRef<SignatureViewRef>(null);
  // stops the page scrolling while the doctor draws
  const [drawing, setDrawing] = useState(false);

  // changes this question only in the appointment
  const updateQuestion = (changes: Partial<AppointmentQuestion>) => {
    if (!appointment) return;
    updateAppointment(id, {
      questions: appointment.questions.map((item, itemIndex) =>
        itemIndex === Number(index) ? { ...item, ...changes } : item,
      ),
    });
  };

  // a blank answer is removed
  const save = () => {
    updateQuestion({ answer: answer.trim() || undefined });
    router.back();
  };

  // the doctor's permission covers the whole appointment, so it's shared by all its questions

  // opens the canvas, the saved signature is shown on it if the doctor has already signed
  const startSigning = () => setSigning(true);

  // closes the canvas and takes back the doctor's permission if it was given
  const cancelSigning = () => {
    setSigning(false);
    if (appointment?.doctorPermission) {
      updateAppointment(id, { doctorPermission: false, doctorSignature: undefined });
    }
  };

  // called by the canvas with the signature as an image after save is pressed, the canvas calls
  // onEmpty instead when nothing is drawn, so an empty canvas saves nothing
  const saveSignature = (signature: string) => {
    updateAppointment(id, { doctorPermission: true, doctorSignature: signature });
    setSigning(false);
  };

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} scrollEnabled={!drawing}>
        {!!question && <Text style={styles.question}>{question.text}</Text>}

        <Text style={styles.heading}>Type answer</Text>
        <TextInput
          style={[styles.field, styles.input, styles.answerInput]}
          value={answer}
          onChangeText={setAnswer}
          placeholder="answer"
          placeholderTextColor={paperColours.onSurfaceVariant}
          multiline
          numberOfLines={3}
        />

        <Text style={styles.heading}>Record answer</Text>
        {signing ? (
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
        ) : (
          <Button
            label={appointment?.doctorPermission ? "View doctor's signature" : "Get doctor's permission"}
            onPress={startSigning}
            buttonType="primaryButton"
          />
        )}
      </ScrollView>

      <View style={styles.bottomBar}>
        <Button label="Save" onPress={save} buttonType="primaryButton" />
      </View>
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
      paddingBottom: 16,
      gap: 12,
    },

    bottomBar: {
      paddingHorizontal: 16,
      marginBottom: 44,
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
