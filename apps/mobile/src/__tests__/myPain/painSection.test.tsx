/** Component tests for the My Pain section.
 * Tests cover:
 *    - waits for the options, then shows the first question (pain location)
 *    - answering every question, then Submit, saves the answers as option ids with the
 *      user's own "Other" text
 *    - the review page shows the user's own text in place of "Other"
 *    - a section saved earlier opens with its answers ticked
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
const mockApiQuestionOption = jest.fn();
jest.mock('@/api/django-API', () => ({
  apiAssessment: (...a: any[]) => mockApiAssessment(...a),
  apiQuestionOption: (...a: any[]) => mockApiQuestionOption(...a),
}));
const mockLoad = jest.fn();
const mockSave = jest.fn();
jest.mock('@/api/my_pain_api_helpers', () => ({
  apiLoadMyPain: (...a: any[]) => mockLoad(...a),
  apiSaveMyPain: (...a: any[]) => mockSave(...a),
}));
jest.mock('@/api/care_planner_api_helpers', () => ({
  apiErrorMessage: (_error: unknown, fallback: string) => fallback,
}));
import Screen from '../../app/(tabs)/myPain/painSection';

beforeEach(() => {
  mockApiAssessment.mockResolvedValue({ week_starting: '2026-10-26' });
  mockApiQuestionOption.mockImplementation(async (_op: string, { question_key }: any) =>
    question_key === 'pain_location'
      ? [
        { id: 'loc1', text: 'loc1', sort_order: 0, is_active: true },
        { id: 'loc2', text: 'loc2', sort_order: 1, is_active: true },
        { id: 'loc3', text: 'Other', sort_order: 2, is_active: true },
      ]
      : [
        { id: 'char1', text: 'char1', sort_order: 0, is_active: true },
        { id: 'char2', text: 'char2', sort_order: 1, is_active: true },
      ]);
  mockLoad.mockResolvedValue(null);
  mockSave.mockResolvedValue(undefined);
});
afterEach(() => jest.clearAllMocks());

test('shows the first question once the options have loaded', async () => {
  await render(<Screen />);
  expect(await screen.findByText('Pain location')).toBeTruthy();
  expect(screen.getByLabelText('loc1')).toBeTruthy();
});

test('answering every question and submitting saves option ids and the Other text', async () => {
  await render(<Screen />);
  await screen.findByText('Pain location');
  await pressLabel('loc1');
  await pressLabel('Other');
  await fireEvent.changeText(screen.getByPlaceholderText('Enter other details'), 'locOther');
  await press('Continue');
  await pressLabel('char1');
  await press('Continue');
  // skip 4 sliders
  await press('Continue');
  await press('Continue');
  await press('Continue');
  await press('Continue');
  // review page shows the user's own text instead of "Other"
  expect(screen.getByText('loc1, locOther')).toBeTruthy();
  await press('Submit');
  await waitFor(() => expect(mockSave).toHaveBeenCalledTimes(1));
  expect(mockSave).toHaveBeenCalledWith('a1', {
    locations: ['loc1', 'loc3'],
    other_location: 'locOther',
    characteristics: ['char1'],
    other_characteristic: null,
    current: 0,
    mildest: 0,
    worst: 0,
    average: 0,
  });
  expect(mockNavigate).toHaveBeenCalledWith('/(tabs)/myPain');
});

test('a section saved earlier opens with its answers ticked', async () => {
  mockLoad.mockResolvedValue({ locations: ['loc2'], characteristics: ['char2'], current: 3 });
  await render(<Screen />);
  await screen.findByText('Pain location');
  await press('Continue'); // no selection error
  expect(screen.getByText('Pain characteristics')).toBeTruthy();
});
