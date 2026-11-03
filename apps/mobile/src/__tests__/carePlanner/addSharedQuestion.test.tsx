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
import { screen, fireEvent, act } from '@testing-library/react-native';
import { actRender, press, pressLabel, expectText, expectNoText, actPress } from '../../helpers/testHelpers';

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
  await actRender(<Screen />);
  expectText('Add Questions to the Appointment');
  expectText('Add your own questions');
  expect(screen.getByLabelText(SUGGESTION)).toBeTruthy();
});

test('a typed own question is saved to the shared appointment and goes back', async () => {
  await actRender(<Screen />);
  await press('Add new question');
  await act(async () => {
    await fireEvent.changeText(screen.getByPlaceholderText('enter question here'), 'placeholder Q');
  });
  await actPress('Save');
  expect(mockApiSaveOwnQuestions).toHaveBeenCalledWith('s1', [
    { id: undefined, text: 'placeholder Q', source: 'support' },
  ]);
  expect(mockRouter.back).toHaveBeenCalled();
});

test('ticking a suggested question saves it as a support question', async () => {
  await actRender(<Screen />);
  await pressLabel(SUGGESTION);
  await actPress('Save');
  expect(mockApiSaveOwnQuestions).toHaveBeenCalledWith(
    's1',
    expect.arrayContaining([
      expect.objectContaining({ text: SUGGESTION, source: 'suggested' }),
    ]),
  );
});

test("the patient's pain values are loaded for the patient and filled into the suggestions", async () => {
  mockApiPainSummary.mockResolvedValue({ locations: ['Neck'] });
  await actRender(<Screen />);
  expect(mockApiPainSummary).toHaveBeenCalledWith('p1');
  expect(screen.getByLabelText('What could be causing pain in my neck?')).toBeTruthy();
});

test('a suggestion the patient ticked is hidden', async () => {
  mockAppointment.questions = [{ id: 'q1', text: SUGGESTION, source: 'suggested', addedBy: 'patient' }];
  await actRender(<Screen />);
  expect(screen.queryByLabelText(SUGGESTION)).toBeNull();
});

test('removing a support question with an answer asks first, then saves without it', async () => {
  mockAppointment.questions = [
    { id: 'q1', text: 'placeholder Q', source: 'support', addedBy: 'support', answer: 'No' },
  ];
  await actRender(<Screen />);
  await pressLabel('Delete question');
  await actPress('Save');
  expectText('Are you sure you want to remove questions?');
  expect(mockApiSaveOwnQuestions).not.toHaveBeenCalled();
  await actPress('Remove');
  expect(mockApiSaveOwnQuestions).toHaveBeenCalledWith('s1', []);
  expect(mockRouter.back).toHaveBeenCalled();
});

test('removing a support question without an answer saves straight away', async () => {
  mockAppointment.questions = [
    { id: 'q1', text: 'placeholder Q', source: 'support', addedBy: 'support' },
  ];
  await actRender(<Screen />);
  await pressLabel('Delete question');
  await actPress('Save');
  expectNoText('Are you sure you want to remove questions?');
  expect(mockApiSaveOwnQuestions).toHaveBeenCalledWith('s1', []);
});

test('a failed save shows the error and stays on the page', async () => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
  mockApiSaveOwnQuestions.mockRejectedValue(new Error('placeholder error'));
  await actRender(<Screen />);
  await pressLabel(SUGGESTION);
  await actPress('Save');
  expectText('Your questions could not be saved, please try again');
  expect(mockRouter.back).not.toHaveBeenCalled();
});
