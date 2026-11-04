/** Screen tests for phone verification.
 * Tests cover:
 *    - a short phone number is rejected
 *    - a valid number is saved, a code is requested and verifyPhone opens
 *    - failed code request shows an error and stays; 409 shows the account-exists error
 *    - verifyPhone shows the number, verifies the code, stores ids and opens userType
 *    - verifyPhone stays put when the code is wrong
 */

import React from 'react';
import { screen, fireEvent } from '@testing-library/react-native';
import { actRender, actPress, expectText } from '../../helpers/testHelpers';
import { useOnboardingStore } from '@/store/onboardingStorage';

const mockRouter = { navigate: jest.fn(), push: jest.fn(), replace: jest.fn(), back: jest.fn() };
jest.mock('expo-router', () => ({ useRouter: () => mockRouter }));

const mockRequestCode = jest.fn();
const mockVerifyCode = jest.fn();
jest.mock('@/api/django-API', () => ({
  request_code: (...a: any[]) => mockRequestCode(...a),
  verify_code: (...a: any[]) => mockVerifyCode(...a),
  ApiError: class ApiError extends Error {
    status: number;
    constructor(status: number) { super('api'); this.status = status; }
  },
}));
jest.mock('@/components/onboarding/GetDeviceID', () => ({
  __esModule: true,
  default: jest.fn().mockResolvedValue('device-1'),
}));

import { ApiError } from '@/api/django-API';
import InitialPhoneEntry from '@/app/(onboarding)/userOnboarding/initialPhoneEntry';
import VerifyPhone from '@/app/(onboarding)/userOnboarding/verifyPhone';

beforeEach(() => {
  useOnboardingStore.getState().reset();
  mockRequestCode.mockResolvedValue(undefined);
  mockVerifyCode.mockResolvedValue({ verification_id: 'ver-1' });
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.spyOn(console, 'log').mockImplementation(() => {});
});
afterEach(() => jest.clearAllMocks());

const enterPhone = async (value: string) => fireEvent.changeText(screen.getByDisplayValue('04'), value);

test('initialPhoneEntry rejects a short number', async () => {
  await actRender(<InitialPhoneEntry />);
  await actPress('Submit');
  expectText('phone number is too short');
  expect(mockRequestCode).not.toHaveBeenCalled();
});

test('initialPhoneEntry saves the number, requests a code and opens verifyPhone', async () => {
  await actRender(<InitialPhoneEntry />);
  await enterPhone('0412345678');
  await actPress('Submit');
  expect(useOnboardingStore.getState().phone_number).toBe('0412345678');
  expect(mockRequestCode).toHaveBeenCalledWith('0412345678');
  expect(mockRouter.navigate).toHaveBeenCalledWith('/(onboarding)/userOnboarding/verifyPhone');
});

test('initialPhoneEntry shows an error and stays when the code cannot be sent', async () => {
  mockRequestCode.mockRejectedValue(new Error('down'));
  await actRender(<InitialPhoneEntry />);
  await enterPhone('0412345678');
  await actPress('Submit');
  expectText("We couldn't send a code to that number. Check it and try again.");
  expect(mockRouter.navigate).not.toHaveBeenCalled();
});

test('initialPhoneEntry tells the user when the number already has an account', async () => {
  mockRequestCode.mockRejectedValue(new (ApiError as any)(409));
  await actRender(<InitialPhoneEntry />);
  await enterPhone('0412345678');
  await actPress('Submit');
  expectText('An account is already registered with this number.');
});

test('verifyPhone verifies the code, stores ids and opens userType', async () => {
  useOnboardingStore.getState().set({ phone_number: '0412345678' });
  await actRender(<VerifyPhone />);
  expectText(/0412345678/);
  await fireEvent.changeText(screen.getByPlaceholderText('Enter 6-digit code'), '123456');
  await actPress('Submit');
  expect(mockVerifyCode).toHaveBeenCalledWith('0412345678', '123456');
  expect(useOnboardingStore.getState().verification_id).toBe('ver-1');
  expect(useOnboardingStore.getState().device_id).toBe('device-1');
  expect(mockRouter.navigate).toHaveBeenCalledWith('/(onboarding)/patientOnboarding/userType');
});

test('verifyPhone stays on the page when the code is wrong', async () => {
  mockVerifyCode.mockRejectedValue(new Error('bad code'));
  await actRender(<VerifyPhone />);
  await fireEvent.changeText(screen.getByPlaceholderText('Enter 6-digit code'), '000000');
  await actPress('Submit');
  expect(mockRouter.navigate).not.toHaveBeenCalled();
  expect(useOnboardingStore.getState().verification_id).toBe('');
});
