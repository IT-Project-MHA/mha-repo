/** Component tests for the My Social Health assessment tab.
 * Tests cover:
 *    - waits for the options, then shows the first question (social life)
 *    - answering every question, then Submit, saves the answers as option ids and slider values
 *    - the review page shows the title, the answers and the score text
 *    - a section saved earlier opens with its answers filled in
 */
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react-native';
import { press, pressLabel } from '../../testHelpers/testHelpers';

const mockNavigate = jest.fn();
jest.mock('expo-router', () => ({
  useLocalSearchParams: () => ({ assessmentId: 'a1' }),
  useRouter: () => ({ navigate: mockNavigate }),
}));
jest.mock('expo-web-browser', () => ({ openBrowserAsync: jest.fn() }));
jest.mock('react-native-safe-area-context', () => require('react-native-safe-area-context/jest/mock').default);

const mockApiAssessment = jest.fn();
const mockApiQuestionOptionOrdered = jest.fn();
jest.mock('@/api/django-API', () => ({
  apiAssessment: (...a: any[]) => mockApiAssessment(...a),
  apiQuestionOptionOrdered: (...a: any[]) => mockApiQuestionOptionOrdered(...a),
}));
const mockLoad = jest.fn();
const mockSave = jest.fn();
jest.mock('@/api/my_pain_api_helpers', () => ({
  apiLoadMySocialHealth: (...a: any[]) => mockLoad(...a),
  apiSaveMySocialHealth: (...a: any[]) => mockSave(...a),
}));
jest.mock('@/api/care_planner_api_helpers', () => ({
  apiErrorMessage: (_error: unknown, fallback: string) => fallback,
}));
import Screen from '../../app/(tabs)/myPain/socialHealthSection';

const OPTIONS: Record<string, object[]> = {
  social_social_life: [
    { id: 'l1', text: 'l1', score: 0, option_number: 1, is_active: true },
    { id: 'l2', text: 'l2', score: 5, option_number: 2, is_active: true },
  ],
  social_travelling: [
    { id: 't1', text: 't1', score: 0, option_number: 1, is_active: true },
    { id: 't2', text: 't2', score: 5, option_number: 2, is_active: true },
  ],
  social_overall_mood: [
    { id: 'm1', text: 'm1', score: 0, option_number: 1, is_active: true },
    { id: 'm2', text: 'm2', score: 1, option_number: 2, is_active: true },
    { id: 'm3', text: 'm3', score: 2, option_number: 3, is_active: true },
  ],
};

beforeEach(() => {
  mockApiAssessment.mockResolvedValue({ week_starting: '2026-10-26' });
  mockApiQuestionOptionOrdered.mockImplementation(async (_op: string, { question_key }: any) =>
    OPTIONS[question_key]);
  mockLoad.mockResolvedValue(null);
  mockSave.mockResolvedValue(undefined);
});
afterEach(() => jest.clearAllMocks());

test('shows the first question once the options have loaded', async () => {
  await render(<Screen />);
  expect(await screen.findByText('Social life')).toBeTruthy();
  expect(mockApiQuestionOptionOrdered).toHaveBeenCalledTimes(3);
});

test('answering every question and submitting saves option ids and slider values', async () => {
  await render(<Screen />);
  await screen.findByText('Social life');
  await press('l2');
  await press('Continue');
  await press('t1');
  await press('Continue');
  // skip the mood, relationships and enjoyment sliders
  await press('Continue');
  await press('Continue');
  await press('Continue');
  await pressLabel('m2');
  await press('Continue');
  await press('Continue'); // skip reflection, go to review page
  expect(screen.getByText('Impacts to Social health')).toBeTruthy();
  expect(screen.getByText('l2')).toBeTruthy();
  expect(screen.getByText('m2')).toBeTruthy();
  expect(screen.getByText(/pain does not really impact your social health\./)).toBeTruthy();

  await press('Submit');
  await waitFor(() => expect(mockSave).toHaveBeenCalledTimes(1));
  expect(mockSave).toHaveBeenCalledWith('a1', {
    social_life: 'l2',
    travelling: 't1',
    mood: 0,
    relationships: 0,
    enjoyment_of_life: 0,
    overall_mood: 'm2',
    reflection: null,
  });
  expect(mockNavigate).toHaveBeenCalledWith('/(tabs)/myPain');
});

test('a section saved earlier opens with its answers filled in', async () => {
  mockLoad.mockResolvedValue({ social_life: 'l1', travelling: 't2', mood: 4, overall_mood: 'm3' });
  await render(<Screen />);
  await screen.findByText('Social life');
  await press('Continue'); // no selection error
  expect(screen.getByText('Travelling')).toBeTruthy();
});
