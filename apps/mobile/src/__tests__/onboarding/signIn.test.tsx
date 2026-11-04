/** Screen tests for sign-in.
 * Tests cover:
 *    - signIn saves the phone number and opens enterPin; shows the account-exists notice
 *    - enterPin logs in, stores the token and refreshes the user
 *    - enterPin shows an error for a wrong pin (401) or a server failure
 *    - enterPin on a new device (403) requests a code and opens phoneVerification
 *    - phoneVerification verifies the code then logs in
 *    - phoneVerification shows an error when verifying fails and confirms a resent code
 */

import React from 'react';
import { screen, fireEvent } from '@testing-library/react-native';
import { actRender, actPress, expectText } from '../../helpers/testHelpers';
import { useOnboardingStore } from '@/store/onboardingStorage';

const mockRouter = { navigate: jest.fn(), push: jest.fn(), replace: jest.fn(), back: jest.fn() };
let mockParams: Record<string, string> = {};
jest.mock('expo-router', () => ({
  useRouter: () => mockRouter,
  useLocalSearchParams: () => mockParams,
}));

const mockLogin = jest.fn();
const mockRequestCode = jest.fn();
const mockVerifyCode = jest.fn();
jest.mock('@/api/django-API', () => ({
  login: (...a: any[]) => mockLogin(...a),
  request_code: (...a: any[]) => mockRequestCode(...a),
  verify_code: (...a: any[]) => mockVerifyCode(...a),
  apiChangePin: jest.fn(),
  ApiError: class ApiError extends Error {
    status: number;
    constructor(status: number) { super('api'); this.status = status; }
  },
}));
jest.mock('@/components/onboarding/GetDeviceID', () => ({
  __esModule: true,
  default: jest.fn().mockResolvedValue('device-1'),
}));
jest.mock('@/components/atomicUI/ChangePinModal', () => ({ __esModule: true, default: () => null }));

const mockRefreshUserType = jest.fn();
jest.mock('@/context/AuthorisationContext', () => ({
  useUser: () => ({ refreshUserType: mockRefreshUserType }),
}));
const mockCompleteOnboarding = jest.fn();
jest.mock('@/store/appStore', () => ({
  useAppStore: (sel: any) => sel({ completeOnboarding: mockCompleteOnboarding }),
}));

import { ApiError } from '@/api/django-API';
import SignIn from '@/app/(onboarding)/signIn/signIn';
import EnterPin from '@/app/(onboarding)/signIn/enterPin';
import PhoneVerification from '@/app/(onboarding)/signIn/phoneVerification';

beforeEach(() => {
  mockParams = {};
  useOnboardingStore.getState().reset();
  useOnboardingStore.getState().set({ phone_number: '0412345678' });
  mockLogin.mockResolvedValue({ token: 'tok' });
  mockRequestCode.mockResolvedValue(undefined);
  mockVerifyCode.mockResolvedValue({ verification_id: 'ver-1' });
  jest.spyOn(console, 'error').mockImplementation(() => {});
});
afterEach(() => jest.clearAllMocks());

const enterPin = async (value = '123456') =>
  await fireEvent.changeText(screen.getByPlaceholderText('Enter 6-digit PIN'), value);

test('signIn saves the phone number and opens enterPin', async () => {
  await actRender(<SignIn />);
  await fireEvent.changeText(screen.getByDisplayValue('04'), '0499999999');
  await actPress('Submit');
  expect(useOnboardingStore.getState().phone_number).toBe('0499999999');
  expect(mockRouter.navigate).toHaveBeenCalledWith('/(onboarding)/signIn/enterPin');
});

test('signIn shows the notice when the account already exists', async () => {
  mockParams = { notice: 'accountExists' };
  await actRender(<SignIn />);
  expectText('You already have an account with this number. Sign in below.');
});

test('enterPin logs in and refreshes the user', async () => {
  await actRender(<EnterPin />);
  await enterPin();
  await actPress('Submit');
  expect(mockLogin).toHaveBeenCalledWith({ phone_number: '0412345678', pin: '123456', device_id: 'device-1' });
  expect(mockCompleteOnboarding).toHaveBeenCalledWith('tok');
  expect(mockRefreshUserType).toHaveBeenCalled();
});

test('enterPin shows an error for a wrong pin', async () => {
  mockLogin.mockRejectedValue(new (ApiError as any)(401));
  await actRender(<EnterPin />);
  await enterPin();
  await actPress('Submit');
  expectText('Invalid phone number or PIN');
  expect(mockCompleteOnboarding).not.toHaveBeenCalled();
});

test('enterPin shows a generic error when login fails unexpectedly', async () => {
  mockLogin.mockRejectedValue(new Error('network'));
  await actRender(<EnterPin />);
  await enterPin();
  await actPress('Submit');
  expectText('Something went wrong, please try again.');
});

test('enterPin on a new device requests a code and opens phoneVerification', async () => {
  mockLogin.mockRejectedValue(new (ApiError as any)(403));
  await actRender(<EnterPin />);
  await enterPin();
  await actPress('Submit');
  expect(mockRequestCode).toHaveBeenCalledWith('0412345678');
  expect(mockRouter.navigate).toHaveBeenCalledWith('/(onboarding)/signIn/phoneVerification');
});

test('phoneVerification verifies the code then logs in with the saved pin', async () => {
  useOnboardingStore.getState().set({ pin: '123456' });
  await actRender(<PhoneVerification />);
  await fireEvent.changeText(screen.getByPlaceholderText('6-digit code'), '654321');
  await actPress('Submit');
  expect(mockVerifyCode).toHaveBeenCalledWith('0412345678', '654321');
  expect(mockLogin).toHaveBeenCalledWith({
    phone_number: '0412345678', pin: '123456', device_id: 'device-1', verification_id: 'ver-1',
  });
  expect(mockCompleteOnboarding).toHaveBeenCalledWith('tok');
  expect(mockRefreshUserType).toHaveBeenCalled();
});

test('phoneVerification shows an error when the code is wrong', async () => {
  mockVerifyCode.mockRejectedValue(new Error('bad code'));
  await actRender(<PhoneVerification />);
  await fireEvent.changeText(screen.getByPlaceholderText('6-digit code'), '000000');
  await actPress('Submit');
  expectText('Something went wrong, please try again.');
  expect(mockLogin).not.toHaveBeenCalled();
});

test('phoneVerification confirms when a new code is sent', async () => {
  await actRender(<PhoneVerification />);
  await actPress('Resend Code');
  expect(mockRequestCode).toHaveBeenCalledWith('0412345678');
  expectText('New code sent.');
});
