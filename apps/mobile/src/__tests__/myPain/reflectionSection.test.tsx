/** Component tests for the weekly reflection screen.
 * Tests cover:
 *    - shows the reflection saved on the week's assessment
 *    - Continue saves the reflection to the assessment and returns to My Pain
 *    - an empty reflection is saved as null
 *    - a failed save shows an error and stays
 *    - Back returns to My Pain without saving
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { press, actPress } from '../../helpers/testHelpers';

const mockNavigate = jest.fn();
jest.mock('expo-router', () => ({
  useLocalSearchParams: () => ({ assessmentId: 'a1' }),
  useRouter: () => ({ navigate: mockNavigate }),
}));
jest.mock('react-native-safe-area-context', () => require('react-native-safe-area-context/jest/mock').default);

const mockApiAssessment = jest.fn();
jest.mock('@/api/django-API', () => ({
  apiAssessment: (...a: any[]) => mockApiAssessment(...a),
}));
jest.mock('@/api/care_planner_api_helpers', () => ({
  apiErrorMessage: (_error: unknown, fallback: string) => fallback,
}));
import Screen from '../../app/(tabs)/myPain/reflectionSection';

const PLACEHOLDER = 'Type your reflection or notes here';

beforeEach(() => {
  mockApiAssessment.mockImplementation(async (operation: string) =>
    operation === 'select' ? { id: 'a1', reflection: 'placeholder reflection' } : undefined);
});
afterEach(() => jest.clearAllMocks());

test('shows the reflection already saved this week', async () => {
  await render(<Screen />);
  expect(await screen.findByDisplayValue('placeholder reflection')).toBeTruthy();
});

test('Continue saves the reflection and returns to My Pain', async () => {
  await render(<Screen />);
  await fireEvent.changeText(await screen.findByPlaceholderText(PLACEHOLDER), 'new reflection');
  await actPress('Continue');
  expect(mockNavigate).toHaveBeenCalledWith('/(tabs)/myPain');
  expect(mockApiAssessment).toHaveBeenCalledWith('update', { id: 'a1', reflection: 'new reflection' });
});

test('an empty reflection is saved as null', async () => {
  await render(<Screen />);
  await fireEvent.changeText(await screen.findByPlaceholderText(PLACEHOLDER), '');
  await actPress('Continue');
  expect(mockNavigate).toHaveBeenCalled();
  expect(mockApiAssessment).toHaveBeenCalledWith('update', { id: 'a1', reflection: null });
});

test('a failed save shows an error and stays', async () => {
  const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
  mockApiAssessment.mockImplementation(async (operation: string) => {
    if (operation === 'update') throw new Error('placeholder error');
    return { id: 'a1', reflection: null };
  });
  await render(<Screen />);
  await screen.findByPlaceholderText(PLACEHOLDER);
  await press('Continue');
  expect(await screen.findByText('Your reflection could not be saved, please try again')).toBeTruthy();
  expect(mockNavigate).not.toHaveBeenCalled();
  consoleError.mockRestore();
});

test('Back returns to My Pain without saving', async () => {
  await render(<Screen />);
  await screen.findByPlaceholderText(PLACEHOLDER);
  await press('Back');
  expect(mockNavigate).toHaveBeenCalledWith('/(tabs)/myPain');
  expect(mockApiAssessment).not.toHaveBeenCalledWith('update', expect.anything());
});
