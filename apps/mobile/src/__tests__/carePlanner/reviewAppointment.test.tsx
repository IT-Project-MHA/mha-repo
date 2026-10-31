/** Component tests for the reviewAppointment screen in carePlanner.
 * Tests cover:
 *    - renders the overview from the draft
 *    - empty support persons and questions show their empty-state messages
 *    - support persons and questions from the draft are listed
 *    - Finish clears the draft and returns to the care planner
 */

import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react-native';

const mockRouter = { push: jest.fn(), back: jest.fn(), dismissTo: jest.fn() };
const mockResetDraft = jest.fn();

let mockDraft: any;

jest.mock('expo-router', () => ({ useRouter: () => mockRouter }));
jest.mock('../../../context/AppointmentContext', () => ({
  useAppointment: () => ({ draft: mockDraft, resetDraft: mockResetDraft }),
}));
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

import Screen from '../../app/(tabs)/carePlanner/reviewAppointment';

beforeEach(() => {
  mockDraft = {
    scheduledDate: new Date('3000-01-01T10:00:00Z'),
    doctor: 'Dr',
    healthService: 'General Practitioner',
    supportPeople: [],
    questions: [],
  };
});
afterEach(() => jest.clearAllMocks());

test('renders the overview from the draft', async () => {
  await act(async () => { await render(<Screen />); });
  expect(screen.getByText('Dr')).toBeTruthy();
  expect(screen.getByText('General Practitioner')).toBeTruthy();
});

test('empty support persons and questions show their empty-state messages', async () => {
  await act(async () => { await render(<Screen />); });
  expect(screen.getByText('No support persons added')).toBeTruthy();
  expect(screen.getByText('No questions added')).toBeTruthy();
});

test('support persons and questions from the draft are listed', async () => {
  mockDraft.supportPeople = [{ 
    name: 'Jane Doe', 
    phone: '+61412345678', 
    canAddQuestions: true, 
    canAddAnswers: false },
  ];
  mockDraft.questions = [{ text: 'placeholder question', source: 'patient' }];
  await act(async () => { await render(<Screen />); });
  expect(screen.getByText('Jane Doe')).toBeTruthy();
  expect(screen.getByText('Access: Add questions')).toBeTruthy();
  expect(screen.getByText('placeholder question')).toBeTruthy();
});

test('Finish clears the draft and returns to the care planner', async () => {
  await act(async () => { await render(<Screen />); });
  await fireEvent.press(screen.getByText('Finish'));
  expect(mockResetDraft).toHaveBeenCalledTimes(1);
  expect(mockRouter.dismissTo).toHaveBeenCalledWith('/carePlanner');
});
