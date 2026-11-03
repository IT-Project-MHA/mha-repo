/** Component tests for the newSupportPerson screen in carePlanner.
 * Tests cover:
 *    - Choose from My Support Links navigates to mySupportLinks
 *    - an invalid phone number shows the validation message
 *    - a valid phone number shows the sign-up hint
 *    - Save with no phone or link shows the mandatory-fields error
 *    - a valid phone number adds the person to the draft and goes back (create flow)
 *    - without contacts permission, choosing a contact asks for it in settings
 *    - closing the contacts without choosing leaves the phone number empty
 *    - a chosen contact's mobile number is filled in, preferred over other numbers
 *    - a contact with no phone number shows a message
 *    - contacts that fail to open show a message
 *    - someone already added to the appointment can't be added again
 *    - adding to an existing appointment saves to the server and goes back
 *    - a failed save to an existing appointment shows the error and stays on the page
 */

import React from 'react';
import { screen, fireEvent, act } from '@testing-library/react-native';
import { actRender, press, expectText, actPress } from '../../helpers/testHelpers';

const mockRouter = { push: jest.fn(), back: jest.fn(), replace: jest.fn() };
const mockUpdateDraft = jest.fn();
const mockPickSupportLink = jest.fn();
const mockApiMySupportLinks = jest.fn();
const mockApiSaveSupportPeople = jest.fn();

let mockParams: any = {};
let mockDraft: any = { appointmentId: 'a1', supportPeople: [] };
let mockAppointments: any[] = [];
const mockRequestContactsPermission = jest.fn();
const mockPresentPicker = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => mockRouter,
  useLocalSearchParams: () => mockParams,
  useFocusEffect: (cb: () => void) => require('react').useEffect(cb, []),
}));
jest.mock('../../../context/AppointmentContext', () => ({
  useAppointment: () => ({
    draft: mockDraft,
    updateDraft: mockUpdateDraft,
    appointments: mockAppointments,
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
  requestPermissionsAsync: (...a: any[]) => mockRequestContactsPermission(...a),
  Contact: { presentPicker: (...a: any[]) => mockPresentPicker(...a) },
}));

import Screen from '../../app/(tabs)/carePlanner/newSupportPerson';

beforeEach(() => {
  mockParams = {};
  mockDraft = { appointmentId: 'a1', supportPeople: [] };
  mockAppointments = [];
  mockRequestContactsPermission.mockResolvedValue({ granted: true });
  mockPresentPicker.mockResolvedValue(null);
  mockApiMySupportLinks.mockResolvedValue([]);
  mockApiSaveSupportPeople.mockResolvedValue(['link1']);
});
afterEach(() => jest.clearAllMocks());

test('Choose from My Support Links navigates to mySupportLinks', async () => {
  await actRender(<Screen />);
  await press('Choose from My Support Links');
  expect(mockRouter.push).toHaveBeenCalledWith('/carePlanner/mySupportLinks');
});

test('an invalid phone number shows the validation message', async () => {
  await actRender(<Screen />);
  await act(async () => {
    await fireEvent.changeText(screen.getByPlaceholderText('phone number'), '000');
  });
  expectText('Please enter a valid phone number.');
});

test('a valid phone number shows the sign-up hint', async () => {
  await actRender(<Screen />);
  await act(async () => {
    await fireEvent.changeText(screen.getByPlaceholderText('phone number'), '0412 345 678');
  });
  expectText('When the support person signs up with this phone number, \
      they will be able to accept your appointment invite.');
});

test('Save with no phone or link shows the mandatory-fields error', async () => {
  await actRender(<Screen />);
  await actPress('Save');
  expectText('Please fill in all mandatory fields');
  expect(mockUpdateDraft).not.toHaveBeenCalled();
});

test('a valid phone number adds the person to the draft and goes back', async () => {
  await actRender(<Screen />);
  await act(async () => {
    await fireEvent.changeText(screen.getByPlaceholderText('phone number'), '0412 345 678');
  });
  await actPress('Save');
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

const contactWith = (numbers: string[]) => ({
  getPhones: jest.fn().mockResolvedValue(numbers.map((number) => ({ number }))),
});

const chooseContact = async () => {
  await actPress('Choose from My Contacts');
};

const jane = {
  name: '',
  phone: '+61412345678',
  canAddQuestions: false,
  canAddAnswers: false,
  supportLinkId: undefined,
};

test('without contacts permission, choosing a contact asks for it in settings', async () => {
  mockRequestContactsPermission.mockResolvedValue({ granted: false });
  await actRender(<Screen />);
  await chooseContact();
  expectText('Allow access to your contacts in your phone settings to choose from them.');
  expect(mockPresentPicker).not.toHaveBeenCalled();
});

test('closing the contacts without choosing leaves the phone number empty', async () => {
  await actRender(<Screen />);
  await chooseContact();
  expect(screen.getByPlaceholderText('phone number').props.value).toBe('');
});

test("a chosen contact's mobile number is filled in, preferred over other numbers", async () => {
  mockPresentPicker.mockResolvedValue(contactWith(['(03) 9999 0000', '0412 345 678']));
  await actRender(<Screen />);
  await chooseContact();
  expect(screen.getByPlaceholderText('phone number').props.value).toBe('0412 345 678');
});

test('a contact with no phone number shows a message', async () => {
  mockPresentPicker.mockResolvedValue(contactWith([]));
  await actRender(<Screen />);
  await chooseContact();
  expectText('This contact has no phone number.');
});

test('contacts that fail to open show a message', async () => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
  mockPresentPicker.mockRejectedValue(new Error('native'));
  await actRender(<Screen />);
  await chooseContact();
  expectText('Your contacts could not be opened.');
});

test("someone already added to the appointment can't be added again", async () => {
  mockDraft = { appointmentId: 'a1', supportPeople: [jane] };
  await actRender(<Screen />);
  await act(async () => {
    await fireEvent.changeText(screen.getByPlaceholderText('phone number'), '0412 345 678');
  });
  await actPress('Save');
  expectText('This support person has already been added to the appointment.');
  expect(mockUpdateDraft).not.toHaveBeenCalled();
});

test('adding to an existing appointment saves to the server and goes back', async () => {
  mockParams = { appointmentId: 'a2' };
  mockAppointments = [{ id: 'a2', supportPeople: [] }];
  await actRender(<Screen />);
  await act(async () => {
    await fireEvent.changeText(screen.getByPlaceholderText('phone number'), '0412 345 678');
  });
  await actPress('Save');
  expect(mockApiSaveSupportPeople).toHaveBeenCalledWith('a2', [jane]);
  expect(mockUpdateDraft).not.toHaveBeenCalled();
  expect(mockRouter.back).toHaveBeenCalled();
});

test('a failed save to an existing appointment shows the error and stays on the page', async () => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
  mockApiSaveSupportPeople.mockRejectedValue(new Error('placeholder error'));
  mockParams = { appointmentId: 'a2' };
  mockAppointments = [{ id: 'a2', supportPeople: [] }];
  await actRender(<Screen />);
  await act(async () => {
    await fireEvent.changeText(screen.getByPlaceholderText('phone number'), '0412 345 678');
  });
  await actPress('Save');
  expectText('Your support person could not be saved, please try again');
  expect(mockRouter.back).not.toHaveBeenCalled();
});
