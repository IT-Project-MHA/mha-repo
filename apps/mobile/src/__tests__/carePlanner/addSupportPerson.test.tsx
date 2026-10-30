/** Component tests for the addSupportPerson screen in carePlanner.
 * Tests cover:
 *    - a saved support person's name, phone and access are shown
 *    - Add support person navigates to newSupportPerson
 *    - pressing a person row opens newSupportPerson to edit them
 *    - the trash icon removes the person from the draft
 *    - Save invites the support people and navigates to addQuestions
 *    - a failed save shows the error and stays on the page
 */

import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react-native';

const mockRouter = { push: jest.fn(), back: jest.fn(), replace: jest.fn() };
const mockUpdateDraft = jest.fn();
const mockApiSaveSupportPeople = jest.fn();

let mockDraft: any;

jest.mock('expo-router', () => ({ useRouter: () => mockRouter }));
jest.mock('../../../context/AppointmentContext', () => ({
  useAppointment: () => ({ draft: mockDraft, updateDraft: mockUpdateDraft }),
}));
jest.mock('../../api/care_planner_api_helpers', () => ({
  apiSaveSupportPeople: (...a: any[]) => mockApiSaveSupportPeople(...a),
  apiErrorMessage: (_error: unknown, fallback: string) => fallback,
}));
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

import Screen from '../../app/(tabs)/carePlanner/addSupportPerson';

const person = {
  name: 'Jane Doe',
  phone: '+61412345678',
  canAddQuestions: true,
  canAddAnswers: false,
  supportLinkId: 'l1',
};

beforeEach(() => {
  mockDraft = { appointmentId: 'a1', supportPeople: [] };
  mockApiSaveSupportPeople.mockResolvedValue(['link1']);
});
afterEach(() => jest.clearAllMocks());

test('shows a saved support person with their access', async () => {
  mockDraft = { appointmentId: 'a1', supportPeople: [person] };
  await act(async () => { await render(<Screen />); });
  expect(screen.getByText('Jane Doe')).toBeTruthy();
  expect(screen.getByText('+61412345678')).toBeTruthy();
  expect(screen.getByText('Access: Add questions')).toBeTruthy();
});

test('Add support person navigates to newSupportPerson', async () => {
  await act(async () => { await render(<Screen />); });
  await fireEvent.press(screen.getByText('Add support person'));
  expect(mockRouter.push).toHaveBeenCalledWith('/carePlanner/newSupportPerson');
});

test('pressing a person row opens newSupportPerson to edit them', async () => {
  mockDraft = { appointmentId: 'a1', supportPeople: [person] };
  await act(async () => { await render(<Screen />); });
  await fireEvent.press(screen.getByText('Jane Doe'));
  expect(mockRouter.push).toHaveBeenCalledWith({
    pathname: '/carePlanner/newSupportPerson',
    params: { index: 0 },
  });
});

test('the trash icon removes the person from the draft', async () => {
  mockDraft = { appointmentId: 'a1', supportPeople: [person] };
  await act(async () => { await render(<Screen />); });
  await fireEvent.press(screen.getByLabelText('Remove support person Jane Doe'));
  expect(mockUpdateDraft).toHaveBeenCalledWith({ supportPeople: [] });
});

test('Save invites the support people and navigates to addQuestions', async () => {
  mockDraft = { appointmentId: 'a1', supportPeople: [person] };
  await act(async () => { await render(<Screen />); });
  await act(async () => { await fireEvent.press(screen.getByText('Save')); });
  expect(mockApiSaveSupportPeople).toHaveBeenCalledWith('a1', [person]);
  expect(mockUpdateDraft).toHaveBeenCalledWith({
    supportPeople: [{ ...person, supportLinkId: 'link1' }],
  });
  expect(mockRouter.push).toHaveBeenCalledWith('/carePlanner/addQuestions');
});

test('a failed save shows the error and stays on the page', async () => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
  mockApiSaveSupportPeople.mockRejectedValue(new Error('placeholder error'));
  mockDraft = { appointmentId: 'a1', supportPeople: [person] };
  await act(async () => { await render(<Screen />); });
  await act(async () => { await fireEvent.press(screen.getByText('Save')); });
  expect(screen.getByText('Your support persons could not be saved, please try again')).toBeTruthy();
  expect(mockUpdateDraft).not.toHaveBeenCalled();
  expect(mockRouter.push).not.toHaveBeenCalled();
});
