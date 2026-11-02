/** Component tests for the Personal Care section.
 * Tests cover:
 *    - waits for the options, then shows the first question (general activities)
 *    - answering every question, then Submit, saves the answers as option ids
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
  apiLoadMyPersonalCare: (...a: any[]) => mockLoad(...a),
  apiSaveMyPersonalCare: (...a: any[]) => mockSave(...a),
}));
jest.mock('@/api/care_planner_api_helpers', () => ({
  apiErrorMessage: (_error: unknown, fallback: string) => fallback,
}));
import Screen from '../../app/(tabs)/myPain/personalCareSection';

const OPTIONS: Record<string, object[]> = {
  care_general_impacts: [
    { id: 'g1', text: 'g1', score: 1, option_number: 1, is_active: true },
    { id: 'g2', text: 'g2', score: 1, option_number: 2, is_active: true },
  ],
  care_personal_care: [
    { id: 'p1', text: 'p1', score: 0, option_number: 1, is_active: true },
    { id: 'p2', text: 'p2', score: 4, option_number: 2, is_active: true },
  ],
  care_sleeping: [
    { id: 's1', text: 's1', score: 0, option_number: 1, is_active: true },
    { id: 's2', text: 's2', score: 2, option_number: 2, is_active: true },
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
  expect(await screen.findByText('General activities')).toBeTruthy();
  expect(mockApiQuestionOptionOrdered).toHaveBeenCalledTimes(3);
});

test('answering every question and submitting saves the answers as option ids', async () => {
  await render(<Screen />);
  await screen.findByText('General activities');
  await pressLabel('g1');
  await pressLabel('g2');
  await press('Continue');
  await press('p2');
  await press('Continue');
  await press('s2');
  await press('Continue');
  await press('Continue'); // skip reflection, go to review
  expect(screen.getByText('Impacts to Personal Care')).toBeTruthy();
  expect(screen.getByText('p2')).toBeTruthy();
  expect(screen.getByText(/pain moderately impacts your personal care\./)).toBeTruthy();
  await press('Submit');
  await waitFor(() => expect(mockSave).toHaveBeenCalledTimes(1));
  expect(mockSave).toHaveBeenCalledWith('a1', {
    general_activities_impact: ['g1', 'g2'],
    personal_care: 'p2',
    sleeping: 's2',
    reflection: null,
  });
  expect(mockNavigate).toHaveBeenCalledWith('/(tabs)/myPain');
});

test('a section saved earlier opens with its answers filled in', async () => {
  mockLoad.mockResolvedValue({ general_activities_impact: ['g1'], personal_care: 'p1', sleeping: 's1' });
  await render(<Screen />);
  await screen.findByText('General activities');
  await press('Continue'); // no selection error
  expect(screen.getByText('Personal care (washing, dressing, etc)')).toBeTruthy();
});
