/** Component tests for the viewAnswer screen in carePlanner.
 * Support persons without add-answer permission read the doctor's answer here.
 * Tests cover:
 *    - a missing question shows the not-found message
 *    - a typed answer is shown, with no recording
 *    - a recording shows the play button, with no typed answer
 */

import React from 'react';
import { render, screen, act } from '@testing-library/react-native';

const mockFindAppointment = jest.fn();

let mockParams: any = { id: 'a1', index: '0' };

jest.mock('expo-router', () => ({
  useLocalSearchParams: () => mockParams,
}));
jest.mock('../../../context/AppointmentContext', () => ({
  useAppointment: () => ({ findAppointment: mockFindAppointment }),
}));
jest.mock('../../api/django-API', () => ({
  apiAppointmentAnswerRecording: jest.fn(() => 'https://example.test/recording'),
}));
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));
jest.mock('expo-audio', () => ({
  useAudioPlayer: () => ({ play: jest.fn(), pause: jest.fn(), seekTo: jest.fn() }),
  useAudioPlayerStatus: () => ({ playing: false, currentTime: 0, duration: 0 }),
}));

import Screen from '../../app/(tabs)/carePlanner/viewAnswer';

const appointmentWith = (question: any) => ({ id: 'a1', questions: [question] });

beforeEach(() => {
  mockParams = { id: 'a1', index: '0' };
});
afterEach(() => jest.clearAllMocks());

test('a missing question shows the not-found message', async () => {
  mockFindAppointment.mockReturnValue({ id: 'a1', questions: [] });
  await act(async () => { await render(<Screen />); });
  expect(screen.getByText('This question could not be found.')).toBeTruthy();
});

test('a typed answer is shown, with no recording', async () => {
  mockFindAppointment.mockReturnValue(
    appointmentWith({ text: 'placeholder Q', answer: 'placeholder A', recording: undefined }),
  );
  await act(async () => { await render(<Screen />); });
  expect(screen.getByText('View Answer')).toBeTruthy();
  expect(screen.getByText('placeholder Q')).toBeTruthy();
  expect(screen.getByText('placeholder A')).toBeTruthy();
  expect(screen.getByText('No recording added')).toBeTruthy();
});

test('a recording shows the play button, with no typed answer', async () => {
  mockFindAppointment.mockReturnValue(
    appointmentWith({ text: 'placeholder Q', answer: '', recording: 'file:///answer.m4a' }),
  );
  await act(async () => { await render(<Screen />); });
  expect(screen.getByText('No answer added')).toBeTruthy();
  expect(screen.getByText('Play recording')).toBeTruthy();
});
