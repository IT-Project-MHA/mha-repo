/** Component tests for the createAppointment screen in carePlanner.
 * Tests cover:
 *    - renders the header, fields and default health service
 *    - Save with no date/time shows the mandatory-fields error
 *    - a date & time in the past shows the past error and does not save
 *    - the health service dropdown opens and a choice is selected
 *    - a valid submit saves the appointment, updates the draft and navigates to addSupportPerson
 */

import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react-native';

const mockRouter = { push: jest.fn(), back: jest.fn(), replace: jest.fn() };
const mockUpdateDraft = jest.fn();
const mockApiSaveAppointment = jest.fn();

let mockPickedDate = new Date('3000-01-01T00:00:00');
let mockPickedTime = { hours: 10, minutes: 0 };

const emptyDraft = {
  appointmentId: null,
  scheduledDate: null,
  doctor: '',
  healthService: null,
  supportPeople: [],
  questions: [],
};

jest.mock('expo-router', () => ({ useRouter: () => mockRouter }));
jest.mock('../../../context/AppointmentContext', () => ({
  useAppointment: () => ({ draft: emptyDraft, updateDraft: mockUpdateDraft }),
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
      React.createElement(Pressable, { onPress: () => onChange(mockPickedTime) },
        React.createElement(Text, null, placeholder)),
  };
});

import Screen from '../../app/(tabs)/carePlanner/createAppointment';

beforeEach(() => {
  mockPickedDate = new Date('3000-01-01T00:00:00');
  mockPickedTime = { hours: 10, minutes: 0 };
  mockApiSaveAppointment.mockResolvedValue({ id: '1', health_service: 'General Practitioner' });
});
afterEach(() => jest.clearAllMocks());

const pickDateAndTime = async () => {
  await fireEvent.press(screen.getByText('Pick appointment date'));
  await fireEvent.press(screen.getByText('Pick appointment time'));
};

test('renders the header, fields and default health service', async () => {
  await act(async () => { await render(<Screen />); });
  expect(screen.getByText('Create Appointment')).toBeTruthy();
  expect(screen.getByText('Appointment date')).toBeTruthy();
  expect(screen.getByText('Appointment time')).toBeTruthy();
  // default health service option in dropdown
  expect(screen.getByText('General Practitioner')).toBeTruthy();
});

test('Save with no date or time shows the mandatory-fields error', async () => {
  await act(async () => { await render(<Screen />); });
  await act(async () => { await fireEvent.press(screen.getByText('Save')); });
  expect(screen.getByText('Please fill in all mandatory fields')).toBeTruthy();
  expect(mockApiSaveAppointment).not.toHaveBeenCalled();
});

test('a date and time in the past shows the past error and does not save', async () => {
  mockPickedDate = new Date('2000-01-01T00:00:00');
  mockPickedTime = { hours: 10, minutes: 0 };
  await act(async () => { await render(<Screen />); });
  await pickDateAndTime();
  await act(async () => { await fireEvent.press(screen.getByText('Save')); });
  expect(screen.getByText('Appointment cannot be in the past')).toBeTruthy();
  expect(mockApiSaveAppointment).not.toHaveBeenCalled();
});

test('the health service dropdown opens and a choice is selected', async () => {
  await act(async () => { await render(<Screen />); });
  await fireEvent.press(screen.getByText('General Practitioner'));
  expect(screen.getByText('Physiotherapist')).toBeTruthy();
  await fireEvent.press(screen.getByText('Physiotherapist'));
  expect(screen.getByText('Physiotherapist')).toBeTruthy(); // new chosen option is displayed
});

test('a valid submit saves the appointment and navigates to addSupportPerson', async () => {
  await act(async () => { await render(<Screen />); });
  await pickDateAndTime();
  await act(async () => { await fireEvent.press(screen.getByText('Save')); });
  expect(mockApiSaveAppointment).toHaveBeenCalledWith(
    null,
    expect.objectContaining({ doctor: '', healthService: 'General Practitioner' }),
  );
  expect(mockUpdateDraft).toHaveBeenCalledWith(
    expect.objectContaining({ appointmentId: '1', healthService: 'General Practitioner' }),
  );
  expect(mockRouter.push).toHaveBeenCalledWith('/carePlanner/addSupportPerson');
});
