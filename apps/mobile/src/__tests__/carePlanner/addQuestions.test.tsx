/** Component tests for the addQuestions screen in carePlanner.
 * Tests cover:
 *    - renders the header, a suggested question and the own-questions section
 *    - a typed own question is saved to the draft and navigates to reviewAppointment
 *    - ticking a suggested question includes it in the saved questions
 *    - the patient's pain values are filled into the suggested questions
 *    - questions that need pain values are hidden when the values fail to load
 *    - removing a saved question with an answer asks first, then saves without it
 *    - Go back on the remove warning keeps the page and does not save
 *    - removing a saved question without an answer saves straight away
 *    - a failed save shows the error and stays on the page
 */

import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react-native';

const mockRouter = { push: jest.fn(), back: jest.fn(), replace: jest.fn() };
const mockUpdateDraft = jest.fn();
const mockApiPainSummary = jest.fn();
const mockApiSaveOwnQuestions = jest.fn();

let mockParams: any = {};
let mockAppointments: any[] = [];

// a suggested question from constants/suggestedQuestions.ts that is guaranteed to appear
const SUGGESTION = 'What treatments or therapies could help improve my mobility?';

jest.mock('expo-router', () => ({
  useRouter: () => mockRouter,
  useLocalSearchParams: () => mockParams,
}));
jest.mock('../../../context/AppointmentContext', () => ({
  useAppointment: () => ({
    draft: { appointmentId: 'a1', questions: [] },
    updateDraft: mockUpdateDraft,
    appointments: mockAppointments,
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
import Screen from '../../app/(tabs)/carePlanner/addQuestions';

beforeEach(() => {
  mockParams = {};
  mockAppointments = [];
  mockApiPainSummary.mockResolvedValue({ locations: [] });
  mockApiSaveOwnQuestions.mockResolvedValue(undefined);
});
afterEach(() => jest.clearAllMocks());

test('renders a suggested question and the own-questions section', async () => {
  await act(async () => { await render(<Screen />); });
  expect(screen.getByText('Add your own questions')).toBeTruthy();
  expect(screen.getByText('Add new question')).toBeTruthy();
  expect(screen.getByLabelText(SUGGESTION)).toBeTruthy();
});

test('a typed own question is saved to the draft and navigates to reviewAppointment', async () => {
  await act(async () => { await render(<Screen />); });
  await fireEvent.press(screen.getByText('Add new question'));
  await act(async () => {
    await fireEvent.changeText(
      screen.getByPlaceholderText('enter question here'), 
      'Is this normal?');
  });
  await act(async () => { await fireEvent.press(screen.getByText('Save')); });
  expect(mockApiSaveOwnQuestions).toHaveBeenCalledWith('a1', [
    { id: undefined, text: 'Is this normal?', source: 'patient' },
  ]);
  expect(mockUpdateDraft).toHaveBeenCalledWith({
    questions: [{ id: undefined, text: 'Is this normal?', source: 'patient' }],
  });
  expect(mockRouter.push).toHaveBeenCalledWith('/carePlanner/reviewAppointment');
});

test('ticking a suggested question includes it in the saved questions', async () => {
  await act(async () => { await render(<Screen />); });
  await fireEvent.press(screen.getByLabelText(SUGGESTION));
  await act(async () => { await fireEvent.press(screen.getByText('Save')); });
  expect(mockApiSaveOwnQuestions).toHaveBeenCalledWith(
    'a1',
    expect.arrayContaining([
      expect.objectContaining({ text: SUGGESTION, source: 'suggested' }),
    ]),
  );
});

test("the patient's pain values are filled into the suggested questions", async () => {
  mockApiPainSummary.mockResolvedValue({ locations: ['Neck', 'Knee'], average: 6 });
  await act(async () => { await render(<Screen />); });
  expect(
    screen.getByLabelText('My average pain over the past two weeks has been around 6 — what does this indicate?'),
  ).toBeTruthy();
});

test('questions that need pain values are hidden when the values fail to load', async () => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
  mockApiPainSummary.mockRejectedValue(new Error('placeholder error'));
  await act(async () => { await render(<Screen />); });
  expect(screen.queryByLabelText(/What could be causing pain in my/)).toBeNull();
  expect(screen.getByLabelText(SUGGESTION)).toBeTruthy();
});

const withSavedQuestion = (question: any) => {
  mockParams = { appointmentId: 'a2' };
  mockAppointments = [{ id: 'a2', questions: [question] }];
};

test('removing a saved question with an answer asks first, then saves without it', async () => {
  withSavedQuestion({ id: 'q1', text: 'question text', 
    source: 'patient', 
    answer: 'answer text' });
  await act(async () => { await render(<Screen />); });
  await fireEvent.press(screen.getByLabelText('Delete question'));
  await act(async () => { await fireEvent.press(screen.getByText('Save')); });
  expect(screen.getByText('Are you sure you want to remove questions?')).toBeTruthy();
  expect(mockApiSaveOwnQuestions).not.toHaveBeenCalled();
  await act(async () => { await fireEvent.press(screen.getByText('Remove')); });
  expect(mockApiSaveOwnQuestions).toHaveBeenCalledWith('a2', []);
  expect(mockRouter.back).toHaveBeenCalled();
});

test('Go back on the remove warning keeps the page and does not save', async () => {
  withSavedQuestion({ id: 'q1', text: 'question text', source: 'patient', recording: 'url' });
  await act(async () => { await render(<Screen />); });
  await fireEvent.press(screen.getByLabelText('Delete question'));
  await act(async () => { await fireEvent.press(screen.getByText('Save')); });
  await act(async () => { await fireEvent.press(screen.getByText('Go back')); });
  expect(screen.queryByText('Are you sure you want to remove questions?')).toBeNull();
  expect(mockApiSaveOwnQuestions).not.toHaveBeenCalled();
  expect(mockRouter.back).not.toHaveBeenCalled();
});

test('removing a saved question without an answer saves straight away', async () => {
  withSavedQuestion({ id: 'q1', text: 'question text', source: 'patient' });
  await act(async () => { await render(<Screen />); });
  await fireEvent.press(screen.getByLabelText('Delete question'));
  await act(async () => { await fireEvent.press(screen.getByText('Save')); });
  expect(screen.queryByText('Are you sure you want to remove questions?')).toBeNull();
  expect(mockApiSaveOwnQuestions).toHaveBeenCalledWith('a2', []);
});

test('a failed save shows the error and stays on the page', async () => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
  mockApiSaveOwnQuestions.mockRejectedValue(new Error('placeholder error'));
  await act(async () => { await render(<Screen />); });
  await fireEvent.press(screen.getByLabelText(SUGGESTION));
  await act(async () => { await fireEvent.press(screen.getByText('Save')); });
  expect(screen.getByText('Your questions could not be saved, please try again')).toBeTruthy();
  expect(mockUpdateDraft).not.toHaveBeenCalled();
  expect(mockRouter.push).not.toHaveBeenCalled();
});
