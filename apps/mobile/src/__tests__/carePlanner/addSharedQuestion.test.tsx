/** Component tests for the addSharedQuestion screen in carePlanner.
 * A support person adds questions to a shared appointment here.
 * Tests cover:
 *    - renders the header, a suggested question and the own-questions section
 *    - a typed own question is saved to the shared appointment and goes back
 *    - ticking a suggested question saves it as a support question
 *    - the patient's pain values are loaded for the patient and filled into the suggestions
 *    - a suggestion the patient ticked is hidden
 *    - removing a support question with an answer asks first, then saves without it
 *    - removing a support question without an answer saves straight away
 *    - a failed save shows the error and stays on the page
 */

import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react-native';

const mockRouter = { push: jest.fn(), back: jest.fn(), replace: jest.fn() };
const mockApiPainSummary = jest.fn();
const mockApiSaveOwnQuestions = jest.fn();

let mockParams: any = { appointmentId: 's1' };

const SUGGESTION = 'What treatments or therapies could help improve my mobility?';

let mockAppointment: any = { id: 's1', patientId: 'p1', questions: [] };

jest.mock('expo-router', () => ({
  useRouter: () => mockRouter,
  useLocalSearchParams: () => mockParams,
}));
jest.mock('../../../context/AppointmentContext', () => ({
  useAppointment: () => ({
    findAppointment: (id: string) => (id === 's1' ? mockAppointment : undefined),
    sharedAppointments: [mockAppointment],
  }),
}));
jest.mock('../../api/care_planner_api_helpers', () => ({
  apiPainSummary: (...a: any[]) => mockApiPainSummary(...a),
  apiSaveOwnQuestions: (...a: any[]) => mockApiSaveOwnQuestions(...a),
  apiErrorMessage: (_error: unknown, fallback: string) => fallback,
}));
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));
jest.mock('@react-native-vector-icons/ionicons', () => ({ Ionicons: () => null }));

import Screen from '../../app/(tabs)/carePlanner/addSharedQuestion';

beforeEach(() => {
  mockParams = { appointmentId: 's1' };
  mockAppointment = { id: 's1', patientId: 'p1', questions: [] };
  mockApiPainSummary.mockResolvedValue({ locations: [] });
  mockApiSaveOwnQuestions.mockResolvedValue(undefined);
});
afterEach(() => jest.clearAllMocks());

test('renders the header, a suggested question and the own-questions section', async () => {
  await act(async () => { await render(<Screen />); });
  expect(screen.getByText('Add Questions to the Appointment')).toBeTruthy();
  expect(screen.getByText('Add your own questions')).toBeTruthy();
  expect(screen.getByLabelText(SUGGESTION)).toBeTruthy();
});

test('a typed own question is saved to the shared appointment and goes back', async () => {
  await act(async () => { await render(<Screen />); });
  await fireEvent.press(screen.getByText('Add new question'));
  await act(async () => {
await fireEvent.changeText(screen.getByPlaceholderText('enter question here'), 'Any side effects?');
  });
  await act(async () => { await fireEvent.press(screen.getByText('Save')); });
  expect(mockApiSaveOwnQuestions).toHaveBeenCalledWith('s1', [
    { id: undefined, text: 'Any side effects?', source: 'support' },
  ]);
  expect(mockRouter.back).toHaveBeenCalled();
});

test('ticking a suggested question saves it as a support question', async () => {
  await act(async () => { await render(<Screen />); });
  await fireEvent.press(screen.getByLabelText(SUGGESTION));
  await act(async () => { await fireEvent.press(screen.getByText('Save')); });
  expect(mockApiSaveOwnQuestions).toHaveBeenCalledWith(
    's1',
    expect.arrayContaining([
      expect.objectContaining({ text: SUGGESTION, source: 'suggested' }),
    ]),
  );
});

test("the patient's pain values are loaded for the patient and filled into the suggestions", async () => {
  mockApiPainSummary.mockResolvedValue({ locations: ['Neck'] });
  await act(async () => { await render(<Screen />); });
  expect(mockApiPainSummary).toHaveBeenCalledWith('p1');
  expect(screen.getByLabelText('What could be causing pain in my neck?')).toBeTruthy();
});

test('a suggestion the patient ticked is hidden', async () => {
  mockAppointment.questions = [{ id: 'q1', text: SUGGESTION, source: 'suggested', addedBy: 'patient' }];
  await act(async () => { await render(<Screen />); });
  expect(screen.queryByLabelText(SUGGESTION)).toBeNull();
});

test('removing a support question with an answer asks first, then saves without it', async () => {
  mockAppointment.questions = [
    { id: 'q1', text: 'placeholder Q', source: 'support', addedBy: 'support', answer: 'placeholer A' },
  ];
  await act(async () => { await render(<Screen />); });
  await fireEvent.press(screen.getByLabelText('Delete question'));
  await act(async () => { await fireEvent.press(screen.getByText('Save')); });
  expect(screen.getByText('Are you sure you want to remove questions?')).toBeTruthy();
  expect(mockApiSaveOwnQuestions).not.toHaveBeenCalled();
  await act(async () => { await fireEvent.press(screen.getByText('Remove')); });
  expect(mockApiSaveOwnQuestions).toHaveBeenCalledWith('s1', []);
  expect(mockRouter.back).toHaveBeenCalled();
});

test('removing a support question without an answer saves straight away', async () => {
  mockAppointment.questions = [
    { id: 'q1', text: 'placeholer Q', source: 'support', addedBy: 'support' },
  ];
  await act(async () => { await render(<Screen />); });
  await fireEvent.press(screen.getByLabelText('Delete question'));
  await act(async () => { await fireEvent.press(screen.getByText('Save')); });
  expect(screen.queryByText('Are you sure you want to remove questions?')).toBeNull();
  expect(mockApiSaveOwnQuestions).toHaveBeenCalledWith('s1', []);
});

test('a failed save shows the error and stays on the page', async () => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
  mockApiSaveOwnQuestions.mockRejectedValue(new Error('placeholder error'));
  await act(async () => { await render(<Screen />); });
  await fireEvent.press(screen.getByLabelText(SUGGESTION));
  await act(async () => { await fireEvent.press(screen.getByText('Save')); });
  expect(screen.getByText('Your questions could not be saved, please try again')).toBeTruthy();
  expect(mockRouter.back).not.toHaveBeenCalled();
});
