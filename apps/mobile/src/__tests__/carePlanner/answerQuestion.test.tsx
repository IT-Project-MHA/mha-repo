/** Component tests for the answerQuestion screen in carePlanner.
 * Tests cover:
 *    - renders the question and, without the doctor's permission, the get-permission button
 *    - typing an answer updates the question in the appointment, without saving it yet
 *    - leaving the page saves a typed answer
 *    - signature canvas:
 *        - Get doctor's permission opens the canvas with its cancel/clear/save controls
 *        - Save and Clear read and clear the signature on the canvas
 *        - saving a signature gives the doctor's permission and closes the canvas
 *        - a signature that fails to save shows an error and keeps the canvas open
 *        - a blank signature shows a message until the doctor starts drawing
 *        - a saved signature is shown on the canvas when viewed
 *        - cancelling takes back permission, straight away with no recordings,
 *          or after asking first when recordings would be deleted
 */

import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react-native';

const mockUpdateQuestion = jest.fn();
const mockUpdateAppointment = jest.fn();
const mockFindAppointment = jest.fn();
const mockApiSaveAnswer = jest.fn();
const mockDoctorPermission = jest.fn();
const mockReadSignature = jest.fn();
const mockClearSignature = jest.fn();

let mockCanvasProps: any = null;

let mockParams: any = { id: 'a1', index: '0' };
jest.mock('expo-router', () => ({
  useLocalSearchParams: () => mockParams,
}));
jest.mock('../../../context/AppointmentContext', () => ({
  useAppointment: () => ({
    findAppointment: mockFindAppointment,
    updateAppointment: mockUpdateAppointment,
    updateQuestion: mockUpdateQuestion,
  }),
}));
jest.mock('../../api/care_planner_api_helpers', () => ({
  apiSaveAnswer: (...a: any[]) => mockApiSaveAnswer(...a),
  apiErrorMessage: (_error: unknown, fallback: string) => fallback,
}));
jest.mock('../../api/django-API', () => ({
  apiAppointmentAnswerRecording: jest.fn(() => 'https://example.test/recording'),
  apiAppointmentDoctorPermission: (...a: any[]) => mockDoctorPermission(...a),
}));
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));
jest.mock('react-native-signature-canvas', () => {
  const React = require('react');
  return {
    __esModule: true,
    default: React.forwardRef((props: any, ref: any) => {
      mockCanvasProps = props;
      React.useImperativeHandle(ref, () => ({
        readSignature: mockReadSignature,
        clearSignature: mockClearSignature,
      }));
      return null;
    }),
  };
});
jest.mock('expo-audio', () => ({
  useAudioPlayer: () => ({ play: jest.fn(), pause: jest.fn(), seekTo: jest.fn() }),
  useAudioPlayerStatus: () => ({ playing: false, currentTime: 0, duration: 0 }),
  useAudioRecorder: () => ({ uri: null }),
  useAudioRecorderState: () => ({ isRecording: false, durationMillis: 0 }),
  RecordingPresets: { HIGH_QUALITY: { ios: {} } },
  AudioQuality: { MEDIUM: 0 },
}));

import Screen from '../../app/(tabs)/carePlanner/answerQuestion';

const appointment = {
  id: 'a1',
  doctorPermission: false,
  questions: [{ id: 'q1', text: 'placeholder question', answer: '', recording: undefined }],
};

beforeEach(() => {
  mockParams = { id: 'a1', index: '0' };
  mockFindAppointment.mockReturnValue(appointment);
  mockApiSaveAnswer.mockResolvedValue({ id: 'ans1' });
  mockDoctorPermission.mockResolvedValue({});
  mockCanvasProps = null;
});
afterEach(() => jest.clearAllMocks());

test('renders the question and the get-permission button without permission', async () => {
  await act(async () => { await render(<Screen />); });
  expect(screen.getByText('placeholder question')).toBeTruthy();
  expect(screen.getByText('Type answer')).toBeTruthy();
  expect(screen.getByText('Record answer')).toBeTruthy();
  expect(screen.getByText("Get doctor's permission")).toBeTruthy();
});

test('typing an answer updates the question in the appointment without saving it yet', async () => {
  await act(async () => { await render(<Screen />); });
  await act(async () => {
    await fireEvent.changeText(screen.getByPlaceholderText('answer'), 'placeholder answer');
  });
  expect(mockUpdateQuestion).toHaveBeenCalledWith('a1', 0, { answer: 'placeholder answer' });
  expect(mockApiSaveAnswer).not.toHaveBeenCalled();
});

test('leaving the page saves a typed answer', async () => {
  await act(async () => { await render(<Screen />); });
  await act(async () => {
    await fireEvent.changeText(screen.getByPlaceholderText('answer'), 'placeholder answer');
  });
  await act(async () => { await screen.unmount(); });
  expect(mockApiSaveAnswer).toHaveBeenCalledWith('q1', undefined, { text: 'placeholder answer' });
});

describe('signature canvas', () => {
  // renders the screen and opens the signature canvas
  const openCanvas = async (buttonLabel = "Get doctor's permission") => {
    await act(async () => { await render(<Screen />); });
    await act(async () => {
      await fireEvent.press(screen.getByText(buttonLabel));
    });
  };

  test("Get doctor's permission opens the signature canvas controls", async () => {
    await act(async () => { await render(<Screen />); });
    await act(async () => {
      await fireEvent.press(screen.getByText("Get doctor's permission"));
    });
    expect(screen.getByText('Cancel')).toBeTruthy();
    expect(screen.getByText('Clear')).toBeTruthy();
    expect(screen.getByText('Save')).toBeTruthy();
  });

  test('Save and Clear read and clear the signature on the canvas', async () => {
    await openCanvas();
    await act(async () => { await fireEvent.press(screen.getByText('Save')); });
    expect(mockReadSignature).toHaveBeenCalledTimes(1);
    await act(async () => { await fireEvent.press(screen.getByText('Clear')); });
    expect(mockClearSignature).toHaveBeenCalledTimes(1);
  });

  test("saving a signature gives the doctor's permission and closes the canvas", async () => {
    await openCanvas();
    await act(async () => { await mockCanvasProps.onOK('data:image'); });
    expect(mockDoctorPermission).toHaveBeenCalledWith('update', {
      id: 'a1',
      doctor_signature: 'data:image',
    });
    expect(mockUpdateAppointment).toHaveBeenCalledWith('a1', {
      doctorPermission: true,
      doctorSignature: 'data:image',
    });
    expect(screen.queryByText('Save')).toBeNull();
  });

  test('a signature that fails to save shows an error and keeps the canvas open', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    mockDoctorPermission.mockRejectedValue(new Error('placeholder error'));
    await openCanvas();
    await act(async () => { await mockCanvasProps.onOK('data:image'); });
    expect(screen.getByText("The doctor's signature could not be saved, please try again")).toBeTruthy();
    expect(mockUpdateAppointment).not.toHaveBeenCalled();
    expect(screen.getByText('Save')).toBeTruthy();
  });

  test('saving a blank signature shows a message until the doctor starts drawing', async () => {
    await openCanvas();
    await act(async () => { await mockCanvasProps.onEmpty(); });
    expect(screen.getByText("You can't save an empty signature.")).toBeTruthy();
    expect(mockDoctorPermission).not.toHaveBeenCalled();
    await act(async () => { await mockCanvasProps.onBegin(); });
    expect(screen.queryByText("You can't save an empty signature.")).toBeNull();
  });

  test('a saved signature is shown on the canvas when viewed', async () => {
    mockFindAppointment.mockReturnValue({
      ...appointment,
      doctorPermission: true,
      doctorSignature: 'data:image',
    });
    await openCanvas("View doctor's signature");
    expect(mockCanvasProps.dataURL).toBe('data:image');
  });

  test('cancelling with permission but no recordings takes back permission straight away', async () => {
    mockFindAppointment.mockReturnValue({ ...appointment, doctorPermission: true });
    await openCanvas("View doctor's signature");
    await act(async () => { await fireEvent.press(screen.getByText('Cancel')); });
    expect(mockDoctorPermission).toHaveBeenCalledWith('delete', { id: 'a1' });
    expect(mockUpdateAppointment).toHaveBeenCalledWith('a1', {
      doctorPermission: false,
      doctorSignature: undefined,
      questions: [{ ...appointment.questions[0], recording: undefined }],
    });
  });

  test('cancelling with recordings asks first, then deletes the recordings', async () => {
    mockFindAppointment.mockReturnValue({
      ...appointment,
      doctorPermission: true,
      questions: [{ ...appointment.questions[0], recording: 'file:///placeholder.m4a' }],
    });
    await openCanvas("View doctor's signature");
    await act(async () => { await fireEvent.press(screen.getByText('Cancel')); });
    expect(screen.getByText("Are you sure you want to take back the doctor's permission?")).toBeTruthy();
    expect(mockDoctorPermission).not.toHaveBeenCalled();
    await act(async () => { await fireEvent.press(screen.getByText('Delete')); });
    expect(mockDoctorPermission).toHaveBeenCalledWith('delete', { id: 'a1' });
    expect(mockUpdateAppointment).toHaveBeenCalledWith('a1', {
      doctorPermission: false,
      doctorSignature: undefined,
      questions: [{ ...appointment.questions[0], recording: undefined }],
    });
  });
});
