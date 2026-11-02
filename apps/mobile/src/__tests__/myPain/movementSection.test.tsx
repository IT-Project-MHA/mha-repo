/** Component tests for the My Movement section.
 * Tests cover:
 *    - waits for the options, then shows the first question (active hours)
 *    - answering every question, then Submit, saves the answers as option ids
 *    - the review page shows the title, the answers and the score text
 *    - a section saved earlier opens with its answers filled in
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
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
  apiLoadMyMovement: (...a: any[]) => mockLoad(...a),
  apiSaveMyMovement: (...a: any[]) => mockSave(...a),
}));
jest.mock('@/api/care_planner_api_helpers', () => ({
  apiErrorMessage: (_error: unknown, fallback: string) => fallback,
}));
import Screen from '../../app/(tabs)/myPain/movementSection';

const OPTIONS: Record<string, object[]> = {
  movement_general_impacts: [
    { id: 'g1', text: 'g1', score: 1, option_number: 1, is_active: true },
    { id: 'g2', text: 'g2', score: 1, option_number: 2, is_active: true },
  ],
  movement_walking: [
    { id: 'w1', text: 'w1', score: 0, option_number: 1, is_active: true },
    { id: 'w2', text: 'w2', score: 3, option_number: 2, is_active: true },
  ],
  movement_lifting: [
    { id: 'l1', text: 'l1', score: 0, option_number: 1, is_active: true },
    { id: 'l2', text: 'l2', score: 3, option_number: 2, is_active: true },
  ],
  movement_sitting: [
    { id: 's1', text: 's1', score: 0, option_number: 1, is_active: true },
    { id: 's2', text: 's2', score: 3, option_number: 2, is_active: true },
  ],
  movement_standing: [
    { id: 't1', text: 't1', score: 0, option_number: 1, is_active: true },
    { id: 't2', text: 't2', score: 3, option_number: 2, is_active: true },
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
  expect(await screen.findByText('Active hours')).toBeTruthy();
  expect(mockApiQuestionOptionOrdered).toHaveBeenCalledTimes(5);
});

test('answering every question and submitting saves the answers as option ids', async () => {
  await render(<Screen />);
  await screen.findByText('Active hours');
  await fireEvent.changeText(screen.getByPlaceholderText('input number only'), '5');
  await press('Continue');
  await pressLabel('g2');
  await press('Continue');
  for (const answer of ['w2', 'l1', 's1', 't2']) {
    await press(answer);
    await press('Continue');
  }
  await press('Continue'); // skip reflection, go to review
  expect(screen.getByText('Impacts to Movement')).toBeTruthy();
  expect(screen.getByText('w2')).toBeTruthy();
  expect(screen.getByText(/pain mildly impacts your movement\./)).toBeTruthy();
  await press('Submit');
  await waitFor(() => expect(mockSave).toHaveBeenCalledTimes(1));
  expect(mockSave).toHaveBeenCalledWith('a1', {
    active_hours: 5,
    general_impacts: ['g2'],
    walking: 'w2',
    lifting: 'l1',
    sitting: 's1',
    standing: 't2',
    reflection: null,
  });
  expect(mockNavigate).toHaveBeenCalledWith('/(tabs)/myPain');
});

test('a section saved earlier opens with its answers filled in', async () => {
  mockLoad.mockResolvedValue({ active_hours: 12, general_impacts: ['g1'], walking: 'w1', reflection: 'ok' });
  await render(<Screen />);
  expect(await screen.findByDisplayValue('12')).toBeTruthy();
});
