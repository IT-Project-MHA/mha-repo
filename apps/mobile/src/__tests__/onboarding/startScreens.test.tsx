/** Screen tests for the first onboarding screens: start page, name entry and passcode.
 * Tests cover:
 *    - start page shows the Create Account and Sign In buttons that navigate
 *    - name is saved to the store and moves on to passcode
 *    - empty name is not submitted
 *    - passcode needs all 6 digits, then is saved to the store and moves on
 */

import React from 'react';
import { screen, fireEvent } from '@testing-library/react-native';
import { actRender, actPress, expectText } from '../../helpers/testHelpers';
import { useOnboardingStore } from '@/store/onboardingStorage';

const mockRouter = { navigate: jest.fn(), push: jest.fn(), replace: jest.fn(), back: jest.fn() };
jest.mock('expo-router', () => ({
  useRouter: () => mockRouter,
  useLocalSearchParams: () => ({}),
}));
jest.mock('expo-web-browser', () => ({ openBrowserAsync: jest.fn() }));
jest.mock('@/app/(onboarding)/splashScreen', () => ({ __esModule: true, default: () => null }));

import StartPage from '@/app/(onboarding)/index';
import CreateAccount from '@/app/(onboarding)/userOnboarding/createAccount';
import Passcode from '@/app/(onboarding)/userOnboarding/passcode';

beforeEach(() => useOnboardingStore.getState().reset());
afterEach(() => jest.clearAllMocks());

test('start page navigates to createAccount and signIn', async () => {
  await actRender(<StartPage />);
  expectText('Lets get you started.');
  await actPress('Create Account');
  expect(mockRouter.navigate).toHaveBeenCalledWith('/(onboarding)/userOnboarding/createAccount');
  await actPress('Sign In');
  expect(mockRouter.navigate).toHaveBeenCalledWith('/(onboarding)/signIn/signIn');
});

test('createAccount saves the name and goes to passcode', async () => {
  await actRender(<CreateAccount />);
  expectText("What's Your Name?");
  await fireEvent.changeText(screen.getByPlaceholderText('Enter Your Name'), 'Placeholder name');
  await actPress('Submit');
  expect(useOnboardingStore.getState().display_name).toBe('Placeholder name');
  expect(mockRouter.navigate).toHaveBeenCalledWith('/(onboarding)/userOnboarding/passcode');
});

test('createAccount does not continue with an empty name', async () => {
  await actRender(<CreateAccount />);
  await actPress('Submit');
  expect(mockRouter.navigate).not.toHaveBeenCalled();
});

test('passcode rejects fewer than 6 digits', async () => {
  await actRender(<Passcode />);
  await fireEvent.changeText(screen.getByPlaceholderText('Enter 6-digit PIN'), '123');
  await actPress('Submit');
  expectText('Please enter all 6 digits.');
  expect(mockRouter.navigate).not.toHaveBeenCalled();
});

test('passcode saves the pin and goes to phone entry', async () => {
  await actRender(<Passcode />);
  await fireEvent.changeText(screen.getByPlaceholderText('Enter 6-digit PIN'), '123456');
  await actPress('Submit');
  expect(useOnboardingStore.getState().pin).toBe('123456');
  expect(mockRouter.navigate).toHaveBeenCalledWith('/(onboarding)/userOnboarding/initialPhoneEntry');
});
