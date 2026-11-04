/** Screen tests for patient onboarding
 * Tests cover:
 *    - userType: "For myself" sets track_health and goes to sexSelect; supporter skips to the end
 *    - userType: nothing selected shows an error
 *    - sexSelect loads options, saves the chosen value, or shows a load error
 *    - ageEntry rejects an out-of-range year and saves a valid one
 *    - diagnosis saves the answer
 *    - dropDownConditions saves the selected option ids
 *    - additionalConditionsTextEntry adds/removes conditions and saves them
 *    - accountCreatedSplashScreen registers the account, or offers sign in / start again on failure
 */

import React from 'react';
import { screen, fireEvent } from '@testing-library/react-native';
import { actRender, actPress, expectText } from '../../helpers/testHelpers';
import { useOnboardingStore } from '@/store/onboardingStorage';

const mockRouter = { navigate: jest.fn(), push: jest.fn(), replace: jest.fn(), back: jest.fn() };
jest.mock('expo-router', () => ({ useRouter: () => mockRouter }));

const mockAssignedGender = jest.fn();
const mockQuestionOption = jest.fn();
const mockRegisterToken = jest.fn();
jest.mock('@/api/django-API', () => ({
  apiAssignedGender: (...a: any[]) => mockAssignedGender(...a),
  apiQuestionOption: (...a: any[]) => mockQuestionOption(...a),
  register_token: (...a: any[]) => mockRegisterToken(...a),
}));
const mockRefreshUserType = jest.fn();
jest.mock('@/context/AuthorisationContext', () => ({
  useUser: () => ({ refreshUserType: mockRefreshUserType }),
}));
const mockCompleteOnboarding = jest.fn();
jest.mock('@/store/appStore', () => ({
  useAppStore: (sel: any) => sel({ completeOnboarding: mockCompleteOnboarding }),
}));

import UserType from '@/app/(onboarding)/patientOnboarding/userType';
import SexSelect from '@/app/(onboarding)/patientOnboarding/sexSelect';
import AgeEntry from '@/app/(onboarding)/patientOnboarding/ageEntry';
import Diagnosis from '@/app/(onboarding)/patientOnboarding/diagnosis';
import DropDownConditions from '@/app/(onboarding)/patientOnboarding/dropDownConditions';
import OtherConditions from '@/app/(onboarding)/patientOnboarding/additionalConditionsTextEntry';
import AccountCreated from '@/app/(onboarding)/accountCreatedSplashScreen';

beforeEach(() => {
  useOnboardingStore.getState().reset(); 
  mockAssignedGender.mockResolvedValue([
    { value: 'F', label: 'Female' },
    { value: 'M', label: 'Male' },
  ]);
  mockQuestionOption.mockResolvedValue([
    { id: 'b', text: 'Condition 1', is_active: true, sort_order: 2 },
    { id: 'a', text: 'Condition 2', is_active: true, sort_order: 1 },
    { id: 'x', text: 'Inactive condition', is_active: false, sort_order: 3 },
  ]);
  mockRegisterToken.mockResolvedValue({ token: 'tok' });
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.spyOn(console, 'log').mockImplementation(() => {});
});
afterEach(() => jest.clearAllMocks());

test('userType "For myself" sets track_health and opens sexSelect', async () => {
  await actRender(<UserType />);
  await actPress('For myself');
  await actPress('Submit');
  expect(useOnboardingStore.getState().track_health).toBe(true);
  expect(mockRouter.navigate).toHaveBeenCalledWith('/(onboarding)/patientOnboarding/sexSelect');
});

test('userType supporter skips the health questions', async () => {
  await actRender(<UserType />);
  await actPress('To support someone else');
  await actPress('Submit');
  expect(useOnboardingStore.getState().track_health).toBe(false);
  expect(mockRouter.navigate).toHaveBeenCalledWith('/(onboarding)/accountCreatedSplashScreen');
});

test('userType needs an option selected', async () => {
  await actRender(<UserType />);
  await actPress('Submit');
  expectText('Please select an option');
  expect(mockRouter.navigate).not.toHaveBeenCalled();
});

test('sexSelect saves the chosen value and opens ageEntry', async () => {
  await actRender(<SexSelect />);
  await actPress('Male');
  await actPress('Submit');
  expect(useOnboardingStore.getState().health?.assigned_gender_at_birth).toBe('M');
  expect(mockRouter.navigate).toHaveBeenCalledWith('/(onboarding)/patientOnboarding/ageEntry');
});

test('sexSelect shows an error when options cannot load', async () => {
  mockAssignedGender.mockRejectedValue(new Error('offline'));
  await actRender(<SexSelect />);
  expectText("Couldn't load options. Check your connection and try again.");
});

test('ageEntry rejects a year before 1900', async () => {
  await actRender(<AgeEntry />);
  await fireEvent.changeText(screen.getByPlaceholderText('e.g. 1985'), '1800');
  await actPress('Submit');
  expectText(/Enter a year between 1900 and/);
  expect(mockRouter.navigate).not.toHaveBeenCalled();
});

test('ageEntry saves a valid year and opens diagnosis', async () => {
  await actRender(<AgeEntry />);
  await fireEvent.changeText(screen.getByPlaceholderText('e.g. 1985'), '1985');
  await actPress('Submit');
  expect(useOnboardingStore.getState().health?.birth_year).toBe(1985);
  expect(mockRouter.navigate).toHaveBeenCalledWith('/(onboarding)/patientOnboarding/diagnosis');
});

test('diagnosis saves the answer and opens dropDownConditions', async () => {
  await actRender(<Diagnosis />);
  await actPress('Yes, I do');
  await actPress('Submit');
  expect(useOnboardingStore.getState().health?.has_diagnosis).toBe(true);
  expect(mockRouter.navigate).toHaveBeenCalledWith('/(onboarding)/patientOnboarding/dropDownConditions');
});

test('dropDownConditions lists active options and saves the chosen ids', async () => {
  await actRender(<DropDownConditions />);
  expectText('Condition 2');
  expectText('Condition 1');
  expect(screen.queryByText('Inactive condition')).toBeNull();
  await actPress('Condition 1');
  await actPress('Submit');
  expect(useOnboardingStore.getState().health?.pain_types).toEqual(['b']);
  expect(mockRouter.navigate).toHaveBeenCalledWith('/(onboarding)/patientOnboarding/additionalConditionsTextEntry');
});

test('additionalConditions adds, removes and saves conditions', async () => {
  await actRender(<OtherConditions />);
  const input = screen.getByPlaceholderText('Type a condition or symptom');
  await fireEvent.changeText(input, 'Extra condition 1');
  await fireEvent.press(screen.getByLabelText('Add condition'));
  await fireEvent.changeText(input, 'Extra condition 2');
  await fireEvent.press(screen.getByLabelText('Add condition'));
  await fireEvent.press(screen.getByLabelText('Remove Extra condition 1'));
  expect(screen.queryByText('Extra condition 1')).toBeNull();
  await actPress('Submit');
  expect(useOnboardingStore.getState().health?.other_conditions).toBe('Extra condition 2');
  expect(mockRouter.navigate).toHaveBeenCalledWith('/(onboarding)/accountCreatedSplashScreen');
});

test('additionalConditions ignores duplicates', async () => {
  await actRender(<OtherConditions />);
  const input = screen.getByPlaceholderText('Type a condition or symptom');
  await fireEvent.changeText(input, 'Extra condition 2');
  await fireEvent.press(screen.getByLabelText('Add condition'));
  await fireEvent.changeText(input, 'extra condition 2');
  await fireEvent.press(screen.getByLabelText('Add condition'));
  expect(screen.getAllByText(/extra condition 2/i)).toHaveLength(1);
});

test('accountCreated registers the account and signs the user in', async () => {
  await actRender(<AccountCreated />);
  expect(mockRegisterToken).toHaveBeenCalledTimes(1);
  expect(mockCompleteOnboarding).toHaveBeenCalledWith('tok');
  expect(mockRefreshUserType).toHaveBeenCalled();
});

test('accountCreated offers sign in and start again when registering fails', async () => {
  mockRegisterToken.mockRejectedValue(new Error('conflict'));
  await actRender(<AccountCreated />);
  expectText("Sorry, we couldn't create your account");
  await actPress('Sign In');
  expect(mockRouter.replace).toHaveBeenCalledWith('/(onboarding)/signIn/signIn');
  await actPress('Start Again');
  expect(mockRouter.replace).toHaveBeenCalledWith('/(onboarding)');
});
