/** Component tests for the editSharedAppointment screen in carePlanner.
 * Tests cover:
 *    - the loading message while the appointment loads
 *    - renders the overview with the patient's name and questions
 *    - with add-answer permission, a question opens the answer page
 *    - without add-answer permission, a question opens the view answer page
 *    - Edit questions is only shown with add-question permission and navigates to addSharedQuestion
 *    - an appointment that fails to load shows the could-not-load message
 */

import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react-native';

const mockRouter = { push: jest.fn(), back: jest.fn(), replace: jest.fn() };
const mockRememberSharedAppointment = jest.fn();
const mockApiAppointmentDetails = jest.fn();

let mockParams: any = { id: 's1' };
let mockSharedAppointments: any[] = [];

jest.mock('expo-router', () => ({
  useRouter: () => mockRouter,
  useLocalSearchParams: () => mockParams,
  useFocusEffect: (cb: () => void) => require('react').useEffect(cb, []),
}));
jest.mock('../../../context/AppointmentContext', () => ({
  useAppointment: () => ({
    sharedAppointments: mockSharedAppointments,
    rememberSharedAppointment: mockRememberSharedAppointment,
  }),
}));
jest.mock('../../api/care_planner_api_helpers', () => ({
  apiAppointmentDetails: (...a: any[]) => mockApiAppointmentDetails(...a),
}));
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

import Screen from '../../app/(tabs)/carePlanner/editSharedAppointment';

const base = {
  id: 's1',
  scheduled_date: '2099-06-15T02:30:00Z',
  doctor: 'Dr',
  health_service: 'General Practitioner',
  patientName: 'John Doe',
  patientId: 'p1',
  supportPeople: [],
  questions: [{ text: 'placeholder question', source: 'patient' }],
  canAddQuestions: true,
  canAddAnswers: true,
};

beforeEach(() => {
  mockParams = { id: 's1' };
  mockSharedAppointments = [base];
  mockApiAppointmentDetails.mockResolvedValue(base);
});
afterEach(() => jest.clearAllMocks());

test('shows the loading message when the appointment is not loaded yet', async () => {
  mockSharedAppointments = [];
  mockApiAppointmentDetails.mockReturnValue(new Promise(() => {})); 
  await act(async () => { await render(<Screen />); });
  expect(screen.getByText('Loading...')).toBeTruthy();
});

test('renders the overview with the patient name and questions', async () => {
  await act(async () => { await render(<Screen />); });
  expect(screen.getByText('Shared Appointment')).toBeTruthy();
  expect(screen.getByText('John Doe')).toBeTruthy();
  expect(screen.getByText('placeholder question')).toBeTruthy();
});

test('with add-answer permission a question opens the answer page', async () => {
  await act(async () => { await render(<Screen />); });
  await fireEvent.press(screen.getByText('placeholder question'));
  expect(mockRouter.push).toHaveBeenCalledWith({
    pathname: '/carePlanner/answerQuestion',
    params: { id: 's1', index: 0 },
  });
});

test('without add-answer permission a question opens the view answer page', async () => {
  const viewOnly = { ...base, canAddAnswers: false };
  mockSharedAppointments = [viewOnly];
  mockApiAppointmentDetails.mockResolvedValue(viewOnly);
  await act(async () => { await render(<Screen />); });
  await fireEvent.press(screen.getByText('placeholder question'));
  expect(mockRouter.push).toHaveBeenCalledWith({
    pathname: '/carePlanner/viewAnswer',
    params: { id: 's1', index: 0 },
  });
});

test('Edit questions is hidden without add-question permission', async () => {
  const noAdd = { ...base, canAddQuestions: false };
  mockSharedAppointments = [noAdd];
  mockApiAppointmentDetails.mockResolvedValue(noAdd);
  await act(async () => { await render(<Screen />); });
  expect(screen.queryByText('Edit questions')).toBeNull();
});

test('Edit questions navigates to addSharedQuestion with permission', async () => {
  await act(async () => { await render(<Screen />); });
  await fireEvent.press(screen.getByText('Edit questions'));
  expect(mockRouter.push).toHaveBeenCalledWith({
    pathname: '/carePlanner/addSharedQuestion',
    params: { appointmentId: 's1' },
  });
});

test('an appointment that fails to load shows the could-not-load message', async () => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
  mockSharedAppointments = [];
  mockApiAppointmentDetails.mockRejectedValue(new Error('placeholder error'));
  await act(async () => { await render(<Screen />); });
  expect(screen.getByText('This appointment could not be loaded.')).toBeTruthy();
});
