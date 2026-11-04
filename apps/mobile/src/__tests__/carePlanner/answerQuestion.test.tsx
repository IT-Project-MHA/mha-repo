/** Component tests for the answerQuestion screen in carePlanner.
 * The signature canvas and expo-audio are not thoroughly tested.
 * Tests cover:
 *    - without the doctor's permission, the get-permission button is shown instead of recording
 *    - with permission and no recording, the record button is shown
 *    - with permission and a recording, the play and delete buttons are shown instead of record
 *    - Get doctor's permission opens the signature controls, and Cancel closes them again
 *    - Delete recording asks first, then removes the recording from the answer
 *    - typing an answer updates the question in the appointment
 *    - Save answer appears once the answer is typed and saves it trimmed
 *    - leaving with a saved or untouched answer does not ask
 *    - leaving with an unsaved answer asks first, and saving carries on leaving
 *    - Keep editing stays on the page with the answer still unsaved
 *    - a failed answer save shows the error
 */

import React from 'react';
import { screen, fireEvent, act } from '@testing-library/react-native';
import { actRender, expectText, expectNoText, actPress } from '../../helpers/testHelpers';

const mockUpdateQuestion = jest.fn();
const mockFindAppointment = jest.fn();
const mockApiSaveAnswer = jest.fn();
const mockDispatch = jest.fn();

let mockParams: any = { id: 'a1', index: '0' };
let mockNavigationListeners: Record<string, (event: any) => any> = {};

jest.mock('expo-router', () => ({
  useLocalSearchParams: () => mockParams,
  useNavigation: () => ({
    addListener: (event: string, listener: (event: any) => any) => {
      mockNavigationListeners[event] = listener;
      return () => {};
    },
    dispatch: (...a: any[]) => mockDispatch(...a),
  }),
}));
jest.mock('../../../context/AppointmentContext', () => ({
  useAppointment: () => ({
    findAppointment: mockFindAppointment,
    updateAppointment: jest.fn(),
    updateQuestion: mockUpdateQuestion,
  }),
}));
jest.mock('../../api/care_planner_api_helpers', () => ({
  apiSaveAnswer: (...a: any[]) => mockApiSaveAnswer(...a),
  apiErrorMessage: (_error: unknown, fallback: string) => fallback,
}));
jest.mock('../../api/django-API', () => ({
  apiAppointmentAnswerRecording: jest.fn(() => 'https://example.test/recording'),
  apiAppointmentDoctorPermission: jest.fn(),
}));
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));
jest.mock('react-native-signature-canvas', () => ({ __esModule: true, default: () => null }));
jest.mock('expo-audio', () => ({
  useAudioPlayer: () => ({ play: jest.fn(), pause: jest.fn(), seekTo: jest.fn(), replace: jest.fn() }),
  useAudioPlayerStatus: () => ({ playing: false, currentTime: 0, duration: 0 }),
  useAudioRecorder: () => ({}),
  useAudioRecorderState: () => ({ isRecording: false, durationMillis: 0 }),
  RecordingPresets: { HIGH_QUALITY: { ios: {} } },
  AudioQuality: { MEDIUM: 0 },
  requestRecordingPermissionsAsync: jest.fn(),
  setAudioModeAsync: jest.fn(),
}));

import Screen from '../../app/(tabs)/carePlanner/answerQuestion';

const question = { id: 'q1', text: 'placeholder question', answer: '', recording: undefined };

const appointmentWith = (doctorPermission: boolean, recording?: string) =>
  mockFindAppointment.mockReturnValue({
    id: 'a1',
    doctorPermission,
    questions: [{ ...question, recording }],
  });

beforeEach(() => {
  mockParams = { id: 'a1', index: '0' };
  appointmentWith(false);
  mockApiSaveAnswer.mockResolvedValue({ id: 'ans1' });
  mockNavigationListeners = {};
});
afterEach(() => jest.clearAllMocks());

// leaves the page, returns the navigation event
const leavePage = async () => {
  const event = { preventDefault: jest.fn(), data: { action: { type: 'GO_BACK' } } };
  await act(async () => { await mockNavigationListeners.beforeRemove(event); });
  return event;
};

// types in the answer box
const typeAnswer = (text: string) =>
  act(async () => { await fireEvent.changeText(screen.getByPlaceholderText('answer'), text); });

test('without permission, the get-permission button is shown instead of recording', async () => {
  await actRender(<Screen />);
  expectText('placeholder question');
  expectText('Type answer');
  expectText('Record answer');
  expectText("Get doctor's permission");
  expectNoText('Record');
  expectNoText('Play recording');
});

test('with permission and no recording, the record button is shown', async () => {
  appointmentWith(true);
  await actRender(<Screen />);
  expectText('Record');
  expectText("View doctor's signature");
  expectNoText("Get doctor's permission");
  expectNoText('Play recording');
});

test('with permission and a recording, the play and delete buttons are shown', async () => {
  appointmentWith(true, 'file:///placeholder.m4a');
  await actRender(<Screen />);
  expectText('Play recording');
  expectText('Delete recording');
  expectNoText('Record');
});

test("Get doctor's permission opens the signature controls, and Cancel closes them", async () => {
  await actRender(<Screen />);
  await actPress("Get doctor's permission");
  expectText('Cancel');
  expectText('Clear');
  expectText('Save');
  expectNoText("Get doctor's permission");
  await actPress('Cancel');
  expectText("Get doctor's permission");
  expectNoText('Clear');
});

test('Delete recording asks first, then removes the recording from the answer', async () => {
  appointmentWith(true, 'file:///placeholder.m4a');
  await actRender(<Screen />);
  await actPress('Delete recording');
  expectText('Are you sure you want to delete the recording?');
  expect(mockApiSaveAnswer).not.toHaveBeenCalled();
  await actPress('Delete');
  expect(mockUpdateQuestion).toHaveBeenCalledWith('a1', 0, { recording: undefined });
  expect(mockApiSaveAnswer).toHaveBeenCalledWith('q1', undefined, { recording: null });
  expectNoText('Are you sure you want to delete the recording?');
});

test('typing an answer updates the question in the appointment', async () => {
  await actRender(<Screen />);
  await typeAnswer('placeholder answer');
  expect(mockUpdateQuestion).toHaveBeenCalledWith('a1', 0, { answer: 'placeholder answer' });
  expect(mockApiSaveAnswer).not.toHaveBeenCalled();
});

test('Save answer appears once the answer is typed and saves it trimmed', async () => {
  await actRender(<Screen />);
  expectNoText('Save answer');
  await typeAnswer('  placeholder answer  ');
  expect(mockApiSaveAnswer).not.toHaveBeenCalled();
  await actPress('Save answer');
  expect(mockApiSaveAnswer).toHaveBeenCalledTimes(1);
  expect(mockApiSaveAnswer).toHaveBeenCalledWith('q1', undefined, { text: 'placeholder answer' });
  expectNoText('Save answer');
});

test('leaving with a saved or untouched answer does not ask', async () => {
  await actRender(<Screen />);
  expect((await leavePage()).preventDefault).not.toHaveBeenCalled();
  await typeAnswer('placeholder answer');
  await actPress('Save answer');
  expect((await leavePage()).preventDefault).not.toHaveBeenCalled();
  expect(mockApiSaveAnswer).toHaveBeenCalledTimes(1);
});

test('leaving with an unsaved answer asks first, and saving carries on leaving', async () => {
  await actRender(<Screen />);
  await typeAnswer('  placeholder answer  ');
  const event = await leavePage();
  expect(event.preventDefault).toHaveBeenCalled();
  expectText('Save your answer before leaving?');
  expect(mockApiSaveAnswer).not.toHaveBeenCalled();
  await actPress('Save and leave');
  expect(mockApiSaveAnswer).toHaveBeenCalledWith('q1', undefined, { text: 'placeholder answer' });
  expect(mockDispatch).toHaveBeenCalledWith(event.data.action);
  expectNoText('Save your answer before leaving?');
});

test('Keep editing stays on the page with the answer still unsaved', async () => {
  await actRender(<Screen />);
  await typeAnswer('placeholder answer');
  await leavePage();
  await actPress('Keep editing');
  expectNoText('Save your answer before leaving?');
  expectText('Save answer');
  expect(mockApiSaveAnswer).not.toHaveBeenCalled();
  expect(mockDispatch).not.toHaveBeenCalled();
});

test('a failed answer save shows the error', async () => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
  mockApiSaveAnswer.mockRejectedValue(new Error('network'));
  await actRender(<Screen />);
  await typeAnswer('placeholder answer');
  await actPress('Save answer');
  expectText('Your answer could not be saved, please try again');
});
