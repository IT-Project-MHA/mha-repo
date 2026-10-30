/** Component tests for the addQuestions screen in carePlanner.
 * Tests cover:
 *    - renders the header, a suggested question and the own-questions section
 *    - a typed own question is saved to the draft and navigates to reviewAppointment
 *    - ticking a suggested question includes it in the saved questions
 *
 * Suggested questions come from the real suggestedQuestions constants. With no pain data, the
 * placeholder-free suggestions (e.g. under Pain impact) are the ones shown. Paper's Checkbox.Item
 * exposes its label through the accessibility label, not as plain text.
 */

import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react-native';

const mockRouter = { push: jest.fn(), back: jest.fn(), replace: jest.fn() };
const mockUpdateDraft = jest.fn();
const mockApiPainSummary = jest.fn();
const mockApiSaveOwnQuestions = jest.fn();

let mockParams: any = {};

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
    appointments: [],
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
