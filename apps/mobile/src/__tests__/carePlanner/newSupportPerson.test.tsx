/** Component tests for the newSupportPerson screen in carePlanner.
 * Tests cover:
 *    - Choose from My Support Links navigates to mySupportLinks
 *    - an invalid phone number shows the validation message
 *    - a valid phone number shows the sign-up hint
 *    - Save with no phone or link shows the mandatory-fields error
 *    - a valid phone number adds the person to the draft and goes back (create flow)
 */

import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react-native';

const mockRouter = { push: jest.fn(), back: jest.fn(), replace: jest.fn() };
const mockUpdateDraft = jest.fn();
const mockPickSupportLink = jest.fn();
const mockApiMySupportLinks = jest.fn();
const mockApiSaveSupportPeople = jest.fn();

let mockParams: any = {};

jest.mock('expo-router', () => ({
  useRouter: () => mockRouter,
  useLocalSearchParams: () => mockParams,
  useFocusEffect: (cb: () => void) => require('react').useEffect(cb, []),
}));
jest.mock('../../../context/AppointmentContext', () => ({
  useAppointment: () => ({
    draft: { appointmentId: 'a1', supportPeople: [] },
    updateDraft: mockUpdateDraft,
    appointments: [],
    pickedSupportLink: null,
    pickSupportLink: mockPickSupportLink,
  }),
}));
jest.mock('../../api/care_planner_api_helpers', () => ({
  apiMySupportLinks: (...a: any[]) => mockApiMySupportLinks(...a),
  apiSaveSupportPeople: (...a: any[]) => mockApiSaveSupportPeople(...a),
  apiErrorMessage: (_error: unknown, fallback: string) => fallback,
  // copied from care_planner_api_helpers
  normalisePhoneNumber: (phone: string) => {
    const digits = phone.replace(/\D/g, '');
    if (digits.startsWith('04') && digits.length === 10) return `+61${digits.slice(1)}`;
    if (digits.startsWith('614') && digits.length === 11) return `+${digits}`;
    return null;
  },
}));
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));
jest.mock('expo-contacts', () => ({
  requestPermissionsAsync: jest.fn().mockResolvedValue({ granted: false }),
  Contact: { presentPicker: jest.fn() },
}));

import Screen from '../../app/(tabs)/carePlanner/newSupportPerson';

beforeEach(() => {
  mockParams = {};
  mockApiMySupportLinks.mockResolvedValue([]);
  mockApiSaveSupportPeople.mockResolvedValue(['link1']);
});
afterEach(() => jest.clearAllMocks());

test('Choose from My Support Links navigates to mySupportLinks', async () => {
  await act(async () => { await render(<Screen />); });
  await fireEvent.press(screen.getByText('Choose from My Support Links'));
  expect(mockRouter.push).toHaveBeenCalledWith('/carePlanner/mySupportLinks');
});

test('an invalid phone number shows the validation message', async () => {
  await act(async () => { await render(<Screen />); });
  await act(async () => {
    await fireEvent.changeText(screen.getByPlaceholderText('phone number'), '000');
  });
  expect(screen.getByText('Please enter a valid phone number.')).toBeTruthy();
});

test('a valid phone number shows the sign-up hint', async () => {
  await act(async () => { await render(<Screen />); });
  await act(async () => {
    await fireEvent.changeText(screen.getByPlaceholderText('phone number'), '0412 345 678');
  });
  expect(
    screen.getByText(
      'When the support person signs up with this phone number, \
      they will be able to accept your appointment invite.',
    ),
  ).toBeTruthy();
});

test('Save with no phone or link shows the mandatory-fields error', async () => {
  await act(async () => { await render(<Screen />); });
  await act(async () => { await fireEvent.press(screen.getByText('Save')); });
  expect(screen.getByText('Please fill in all mandatory fields')).toBeTruthy();
  expect(mockUpdateDraft).not.toHaveBeenCalled();
});

test('a valid phone number adds the person to the draft and goes back', async () => {
  await act(async () => { await render(<Screen />); });
  await act(async () => {
    await fireEvent.changeText(screen.getByPlaceholderText('phone number'), '0412 345 678');
  });
  await act(async () => { await fireEvent.press(screen.getByText('Save')); });
  expect(mockUpdateDraft).toHaveBeenCalledWith({
    supportPeople: [
      {
        name: '',
        phone: '+61412345678',
        canAddQuestions: false,
        canAddAnswers: false,
        supportLinkId: undefined,
      },
    ],
  });
  expect(mockRouter.back).toHaveBeenCalled();
  // saving to backend is not done in this tab
  expect(mockApiSaveSupportPeople).not.toHaveBeenCalled(); 
});
