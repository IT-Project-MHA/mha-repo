/** Component tests for the editSupportPerson screen in carePlanner.
 * Tests cover:
 *    - a missing person shows the not-found message
 *    - renders the person's name, phone and access
 *    - Save writes the appointment's support people to the server and goes back
 *    - Delete confirms, removes the person and saves the remaining people
 *    - someone invited without an account shows as a pending invite with the sign-up note
 *    - the support link's latest name is shown, with a note when they can't see assessments
 *    - a failed save shows the error and stays on the page
 */

import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react-native';

const mockRouter = { push: jest.fn(), back: jest.fn(), replace: jest.fn() };
const mockApiMySupportLinks = jest.fn();
const mockApiSaveSupportPeople = jest.fn();

let mockParams: any = { id: 'a1', index: '0' };
let mockAppointments: any[] = [];

jest.mock('expo-router', () => ({
  useRouter: () => mockRouter,
  useLocalSearchParams: () => mockParams,
}));
jest.mock('../../../context/AppointmentContext', () => ({
  useAppointment: () => ({ appointments: mockAppointments }),
}));
jest.mock('../../api/care_planner_api_helpers', () => ({
  apiMySupportLinks: (...a: any[]) => mockApiMySupportLinks(...a),
  apiSaveSupportPeople: (...a: any[]) => mockApiSaveSupportPeople(...a),
  apiErrorMessage: (_error: unknown, fallback: string) => fallback,
}));
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

import Screen from '../../app/(tabs)/carePlanner/editSupportPerson';

const jane = {
  name: 'Jane Doe',
  phone: '+61412345678',
  canAddQuestions: true,
  canAddAnswers: false,
  supportLinkId: 'l1',
};
const john = {
  name: 'John Doe',
  phone: '+61411111111',
  canAddQuestions: false,
  canAddAnswers: false,
};
const appointment = { id: 'a1', supportPeople: [jane, john] };

beforeEach(() => {
  mockParams = { id: 'a1', index: '0' };
  mockAppointments = [appointment];
  mockApiMySupportLinks.mockResolvedValue([]);
  mockApiSaveSupportPeople.mockResolvedValue(['l1', 'l2']);
});
afterEach(() => jest.clearAllMocks());

test('a missing person shows the not-found message', async () => {
  mockParams = { id: 'a1', index: '5' };
  await act(async () => { await render(<Screen />); });
  expect(screen.getByText('This support person could not be found.')).toBeTruthy();
});

test('renders the person name, phone and access', async () => {
  await act(async () => { await render(<Screen />); });
  expect(screen.getByText('Edit Permissions')).toBeTruthy();
  expect(screen.getByText('Jane Doe')).toBeTruthy();
  expect(screen.getByText('+61412345678')).toBeTruthy();
  expect(screen.getByText('Access Type')).toBeTruthy();
  expect(screen.getByLabelText('Add questions')).toBeTruthy();
});

test('Save writes the support people to the server and goes back', async () => {
  await act(async () => { await render(<Screen />); });
  await act(async () => { await fireEvent.press(screen.getByText('Save')); });
  expect(mockApiSaveSupportPeople).toHaveBeenCalledWith('a1', [
    { ...jane, canAddQuestions: true, canAddAnswers: false },
    john,
  ]);
  expect(mockRouter.back).toHaveBeenCalled();
});

test('Delete confirms, removes the person and saves the rest', async () => {
  await act(async () => { await render(<Screen />); });
  await fireEvent.press(screen.getByText('Delete support person'));
  await act(async () => { await fireEvent.press(screen.getByText('Delete')); });
  expect(mockApiSaveSupportPeople).toHaveBeenCalledWith('a1', [john]);
  expect(mockRouter.back).toHaveBeenCalled();
});

test('someone invited without an account shows as a pending invite', async () => {
  mockAppointments = [{ id: 'a1', supportPeople: [{ ...john, name: '' }] }];
  await act(async () => { await render(<Screen />); });
  expect(screen.getByText('N/A (Pending invite)')).toBeTruthy();
  expect(
    screen.getByText(
      'When the support person signs up with this phone number, they will be able to accept your appointment invite.',
    ),
  ).toBeTruthy();
});

test("the support link's latest name is shown, with a note when they can't see assessments", async () => {
  mockApiMySupportLinks.mockResolvedValue([
    {
      id: 'l1',
      invited_phone_number: '+61412345678',
      supporter_name: 'Jane Doe2',
      can_view_assessments: false,
    },
  ]);
  await act(async () => { await render(<Screen />); });
  expect(screen.getByText('Janet Doe2')).toBeTruthy();
  expect(screen.getByText('Janet Doe2 has view access to this appointment.')).toBeTruthy();
  expect(screen.getByText(/Janet Doe does not have access to your assessment data/)).toBeTruthy();
});

test('a failed save shows the error and stays on the page', async () => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
  mockApiSaveSupportPeople.mockRejectedValue(new Error('placeholder error'));
  await act(async () => { await render(<Screen />); });
  await act(async () => { await fireEvent.press(screen.getByText('Save')); });
  expect(screen.getByText('Your support person could not be saved, please try again')).toBeTruthy();
  expect(mockRouter.back).not.toHaveBeenCalled();
});
