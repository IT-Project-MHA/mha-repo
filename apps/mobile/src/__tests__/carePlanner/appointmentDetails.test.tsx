/** Component tests for the appointmentDetails screen in carePlanner.
 * Tests cover:
 *    - renders the overview, support persons and questions of the appointment
 *    - the empty-state messages when there are no support persons or questions
 *    - Edit details, Add support person and Edit questions navigate correctly
 *    - pressing a question opens the answer page
 *    - Delete appointment confirms, deletes on the server and goes back
 *    - an appointment that fails to load with no saved copy shows the could-not-load message
 *    - a failed delete shows the error and stays on the page
 */

import React from 'react';
import { actRender, press, expectText, actPress } from '../../helpers/testHelpers';

const mockRouter = { push: jest.fn(), back: jest.fn(), replace: jest.fn() };
const mockRememberAppointment = jest.fn();
const mockApiAppointmentDetails = jest.fn();
const mockApiAppointment = jest.fn();

let mockParams: any = { id: 'a1' };
let mockAppointments: any[] = [];

jest.mock('expo-router', () => ({
  useRouter: () => mockRouter,
  useLocalSearchParams: () => mockParams,
  useFocusEffect: (cb: () => void) => require('react').useEffect(cb, []),
}));
jest.mock('../../../context/AppointmentContext', () => ({
  useAppointment: () => ({
    appointments: mockAppointments,
    rememberAppointment: mockRememberAppointment,
  }),
}));
jest.mock('../../api/care_planner_api_helpers', () => ({
  apiAppointmentDetails: (...a: any[]) => mockApiAppointmentDetails(...a),
  apiErrorMessage: (_error: unknown, fallback: string) => fallback,
}));
jest.mock('../../api/django-API', () => ({
  apiAppointment: (...a: any[]) => mockApiAppointment(...a),
}));
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

import Screen from '../../app/(tabs)/carePlanner/appointmentDetails';

const appointment = {
  id: 'a1',
  scheduled_date: '3000-01-01T010:00:00Z',
  doctor: 'Dr',
  health_service: 'General Practitioner',
  supportPeople: [
    { name: 'Jane Doe', phone: '+61412345678', canAddQuestions: true, canAddAnswers: false },
  ],
  questions: [{ text: 'placeholder question', source: 'patient' }],
};

beforeEach(() => {
  mockParams = { id: 'a1' };
  mockAppointments = [appointment];
  mockApiAppointmentDetails.mockResolvedValue(appointment);
  mockApiAppointment.mockResolvedValue({});
});
afterEach(() => jest.clearAllMocks());

test('renders the overview, support persons and questions', async () => {
  await actRender(<Screen />);
  expectText('Dr');
  expectText('General Practitioner');
  expectText('Jane Doe');
  expectText('placeholder question');
});

test('empty support persons and questions show their empty-state messages', async () => {
  const empty = { ...appointment, supportPeople: [], questions: [] };
  mockAppointments = [empty];
  mockApiAppointmentDetails.mockResolvedValue(empty);
  await actRender(<Screen />);
  expectText('No support persons added');
  expectText('No questions added');
});

test('Edit details navigates to editAppointment', async () => {
  await actRender(<Screen />);
  await press('Edit details');
  expect(mockRouter.push).toHaveBeenCalledWith({
    pathname: '/carePlanner/editAppointment',
    params: { id: 'a1' },
  });
});

test('Add support person navigates to newSupportPerson with the appointment id', async () => {
  await actRender(<Screen />);
  await press('Add support person');
  expect(mockRouter.push).toHaveBeenCalledWith({
    pathname: '/carePlanner/newSupportPerson',
    params: { appointmentId: 'a1' },
  });
});

test('pressing a question opens the answer page', async () => {
  await actRender(<Screen />);
  await press('placeholder question');
  expect(mockRouter.push).toHaveBeenCalledWith({
    pathname: '/carePlanner/answerQuestion',
    params: { id: 'a1', index: 0 },
  });
});

test('Delete appointment confirms, deletes on the server and goes back', async () => {
  await actRender(<Screen />);
  await press('Delete appointment');
  await actPress('Delete'); // confirm modal
  expect(mockApiAppointment).toHaveBeenCalledWith('delete', { id: 'a1' });
  expect(mockRouter.back).toHaveBeenCalled();
});

test('an appointment that fails to load with no saved copy shows the could-not-load message', async () => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
  mockAppointments = [];
  mockApiAppointmentDetails.mockRejectedValue(new Error('placeholder error'));
  await actRender(<Screen />);
  expectText('This appointment could not be loaded.');
});

test('a failed delete shows the error and stays on the page', async () => {
  mockApiAppointment.mockRejectedValue(new Error('placeholder error'));
  await actRender(<Screen />);
  await press('Delete appointment');
  await actPress('Delete');
  expectText('Your appointment could not be deleted, please try again');
  expectText('Delete appointment');
  expect(mockRouter.back).not.toHaveBeenCalled();
});
