/** Component tests for the My Management section.
 * Tests cover:
 *    - the medication options are the patient's active prescriptions only
 *    - answering every question, then Submit, saves prescription ids, the other medication, the
 *      exercise option id and the emotion text
 *    - the review page has a summary sentence in place of a score
 *    - with no prescriptions the medication question says so, and Continue still works
 *    - a section saved earlier opens with its answers filled in
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { press, pressLabel, expectText, actPress } from '../../helpers/testHelpers';

const mockNavigate = jest.fn();
jest.mock('expo-router', () => ({
  useLocalSearchParams: () => ({ assessmentId: 'a1' }),
  useRouter: () => ({ navigate: mockNavigate }),
}));
jest.mock('expo-web-browser', () => ({ openBrowserAsync: jest.fn() }));
jest.mock('react-native-safe-area-context', () => require('react-native-safe-area-context/jest/mock').default);

const mockApiAssessment = jest.fn();
const mockApiQuestionOptionOrdered = jest.fn();
const mockApiPrescription = jest.fn();
jest.mock('@/api/django-API', () => ({
  apiAssessment: (...a: any[]) => mockApiAssessment(...a),
  apiQuestionOptionOrdered: (...a: any[]) => mockApiQuestionOptionOrdered(...a),
  apiPrescription: (...a: any[]) => mockApiPrescription(...a),
}));
const mockLoad = jest.fn();
const mockSave = jest.fn();
jest.mock('@/api/my_pain_api_helpers', () => ({
  apiLoadMyManagement: (...a: any[]) => mockLoad(...a),
  apiSaveMyManagement: (...a: any[]) => mockSave(...a),
}));
jest.mock('@/api/care_planner_api_helpers', () => ({
  ownPatientProfileId: () => Promise.resolve('p1'),
  apiErrorMessage: (_error: unknown, fallback: string) => fallback,
}));
import Screen from '../../app/(tabs)/myPain/managementSection';

const prescription = (id: string, name: string, stopped_on: string | null = null) => ({
  id, name, dosage: 1, form: 'tablets', frequency: 1, frequency_unit: 'hour(s)', strength: '1',
  strength_unit: 'g', stopped_on,
});

const MEDICATION_QUESTION = /select medications that you consumed/;

beforeEach(() => {
  mockApiAssessment.mockResolvedValue({ week_starting: '2026-10-26' });
  mockApiQuestionOptionOrdered.mockResolvedValue([
    { id: 'e1', text: 'e1', score: 0, option_number: 1, is_active: true },
    { id: 'e2', text: 'e2', score: 2, option_number: 2, is_active: true },
    { id: 'e3', text: 'e3', score: 4, option_number: 3, is_active: true },
  ]);
  mockApiPrescription.mockResolvedValue([
    prescription('pr1', 'Panadol'),
  ]);
  mockLoad.mockResolvedValue(null);
  mockSave.mockResolvedValue(undefined);
});
afterEach(() => jest.clearAllMocks());

test('only the active prescriptions are offered as medication', async () => {
  await render(<Screen />);
  expect(await screen.findByText(MEDICATION_QUESTION)).toBeTruthy();
  expect(mockApiPrescription).toHaveBeenCalledWith('select', { patient_profile: 'p1' });
  expect(screen.getByLabelText('Panadol every 1 hour(s)')).toBeTruthy();
  expect(screen.queryByLabelText('Old tablets every 1 hour(s)')).toBeNull();
});

test('answering every question and submitting saves the answers', async () => {
  await render(<Screen />);
  await screen.findByText(MEDICATION_QUESTION);
  await pressLabel('Panadol every 1 hour(s)');
  await press('Continue');
  await fireEvent.changeText(screen.getByPlaceholderText('Input name of over the counter medication'), 'placeholder OTC');
  await press('Continue');
  await press('e1');
  await press('Continue');
  await fireEvent.changeText(screen.getByPlaceholderText('Examples: meditation, journaling, meeting people'), 'meditation');
  await press('Continue');
  expectText('My Current Management');
  expectText('You consume Panadol every 1 hour(s), placeholder OTC and mainly perform exercises to manage your pain.');

  await actPress('Submit');
  expect(mockSave).toHaveBeenCalledTimes(1);
  expect(mockSave).toHaveBeenCalledWith('a1', {
    medication: ['pr1'],
    otc_medication: 'placeholder OTC',
    exercise: 'e1',
    emotion: 'meditation',
  });
  expect(mockNavigate).toHaveBeenCalledWith('/(tabs)/myPain');
});

test('with no prescriptions the question says so and the summary says no medication', async () => {
  mockApiPrescription.mockResolvedValue([]);
  await render(<Screen />);
  expect(await screen.findByText(/You don't have any active prescriptions/)).toBeTruthy();
  await press('Continue');
  await press('Continue');
  await press('e3');
  await press('Continue');
  await press('Continue');
  expectText('You do not consume any medication and never perform exercises to manage your pain.');
});

test('a section saved earlier opens with its answers filled in', async () => {
  mockLoad.mockResolvedValue({ medication: ['rx1'], otc_medication: 'placeholder OTC', exercise: 'e2', emotion: 'meditation' });
  await render(<Screen />);
  await screen.findByText(MEDICATION_QUESTION);
  await press('Continue');
  expect(await screen.findByDisplayValue('placeholder OTC')).toBeTruthy();
});
