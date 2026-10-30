/** Component tests for the editAppointment screen in carePlanner.
 * Tests cover:
 *    - a missing appointment shows the not-found message
 *    - renders the saved details of the appointment being edited
 *    - saving with changed value calls the API and goes back
 *    - changing the date to the past shows the past error and does not save
 *    - clearing the date shows the mandatory-fields error and does not save
 *    - a failed save shows the error and stays on the page
 */

import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react-native';

const mockRouter = { push: jest.fn(), back: jest.fn(), replace: jest.fn() };
const mockApiSaveAppointment = jest.fn();

let mockParams: any = { id: 'a1' };
let mockAppointments: any[] = [];
let mockPickedDate: Date | undefined = new Date('2000-01-01T00:00:00');
let mockPickedTime = { hours: 10, minutes: 0 };

jest.mock('expo-router', () => ({
  useRouter: () => mockRouter,
  useLocalSearchParams: () => mockParams,
}));
jest.mock('../../../context/AppointmentContext', () => ({
  useAppointment: () => ({ appointments: mockAppointments }),
}));
jest.mock('../../../constants/dropdownOptions', () => ({
  DEFAULT_HEALTH_SERVICE: 'General Practitioner',
  useHealthServices: () => [
    { value: 'General Practitioner', label: 'General Practitioner' },
    { value: 'Physiotherapist', label: 'Physiotherapist' },
  ],
}));
jest.mock('../../api/care_planner_api_helpers', () => ({
  apiSaveAppointment: (...a: any[]) => mockApiSaveAppointment(...a),
  apiErrorMessage: (_error: unknown, fallback: string) => fallback,
}));
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));
jest.mock('../../../components/atomicUI/DateInput', () => {
  const React = require('react');
  const { Pressable, Text } = require('react-native');
  return {
    __esModule: true,
    default: ({ onChange, placeholder }: any) =>
      React.createElement(Pressable, { onPress: () => onChange(mockPickedDate) },
        React.createElement(Text, null, placeholder)),
  };
});
jest.mock('../../../components/atomicUI/TimeInput', () => {
  const React = require('react');
  const { Pressable, Text } = require('react-native');
  return {
    __esModule: true,
    default: ({ onChange, placeholder }: any) =>
      React.createElement(Pressable, { onPress: () => onChange({ hours: 10, minutes: 0 }) },
        React.createElement(Text, null, placeholder)),
  };
});

import Screen from '../../app/(tabs)/carePlanner/editAppointment';

const appointment = {
  id: 'a1',
  scheduled_date: '3000-01-01T10:00:00Z',
  doctor: 'Dr',
  health_service: 'Physiotherapist',
  supportPeople: [],
  questions: [],
};

beforeEach(() => {
  mockParams = { id: 'a1' };
  mockAppointments = [appointment];
  mockPickedDate = new Date('2000-01-01T00:00:00');
  mockPickedTime = { hours: 10, minutes: 0 };
  mockApiSaveAppointment.mockResolvedValue({ id: 'a1' });
});
afterEach(() => jest.clearAllMocks());


test('a missing appointment shows the not-found message', async () => {
  mockAppointments = [];
  await act(async () => { await render(<Screen />); });
  expect(screen.getByText('This appointment could not be found.')).toBeTruthy();
});

test('renders the saved details of the appointment being edited', async () => {
  await act(async () => { await render(<Screen />); });
  expect(screen.getByDisplayValue('Dr')).toBeTruthy();
  expect(screen.getByText('Physiotherapist')).toBeTruthy();
});

test('saving with changed value calls the API and goes back', async () => {
  await act(async () => { await render(<Screen />); });
  await act(async () => { await fireEvent.press(screen.getByText('Physiotherapist')); });
  await act(async () => { await fireEvent.press(screen.getByText('General Practitioner')); });
  await act(async () => { await fireEvent.press(screen.getByText('Save')); });
  expect(mockApiSaveAppointment).toHaveBeenCalledWith('a1', {
    scheduledDate: undefined, // date should not be sent, kept the same
    doctor: 'Dr',
    healthService: 'General Practitioner',
  });
  expect(mockRouter.back).toHaveBeenCalled();
});

test('changing the date to the past shows the past error and does not save', async () => {
  await act(async () => { await render(<Screen />); });
  await fireEvent.press(screen.getByText('Pick appointment date'));
  await act(async () => { await fireEvent.press(screen.getByText('Save')); });
  expect(screen.getByText('Appointment cannot be in the past')).toBeTruthy();
  expect(mockApiSaveAppointment).not.toHaveBeenCalled();
});

test('clearing the date shows the mandatory-fields error and does not save', async () => {
  mockPickedDate = undefined;
  await act(async () => { await render(<Screen />); });
  await fireEvent.press(screen.getByText('Pick appointment date'));
  await act(async () => { await fireEvent.press(screen.getByText('Save')); });
  expect(screen.getByText('Please fill in all mandatory fields')).toBeTruthy();
  expect(mockApiSaveAppointment).not.toHaveBeenCalled();
});

test('a failed save shows the error and stays on the page', async () => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
  mockApiSaveAppointment.mockRejectedValue(new Error('network'));
  await act(async () => { await render(<Screen />); });
  await act(async () => { await fireEvent.press(screen.getByText('Save')); });
  expect(screen.getByText('Your appointment could not be saved, please try again')).toBeTruthy();
  expect(mockRouter.back).not.toHaveBeenCalled();
});
