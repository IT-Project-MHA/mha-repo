/** Component tests for the index tab in carePlanner
 * Tests cover:
 *    - renders the header and empty-state messages when there are no appointments
 *    - Create new appointment resets the draft and navigates to createAppointment
 *    - only the 3 most recent appointments show, newest first
 *    - pressing an appointment navigates to appointmentDetails with the id
 *    - pressing See all appointments navigates to allAppointments
 *    - pressing a shared appointment navigates to editSharedAppointment with the id
 *    - pressing See all shared appointments navigates to allSharedAppointments
*/

import React from 'react';
import { screen } from '@testing-library/react-native';
import { actRender, press, expectText, expectNoText } from '../../helpers/testHelpers';

const mockRouter = { push: jest.fn(), back: jest.fn(), replace: jest.fn() };
const mockResetDraft = jest.fn();
const mockApiPatientAppointments = jest.fn();
const mockApiSharedAppointments = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => mockRouter,
  useFocusEffect: (cb: () => void) => require('react').useEffect(cb, []),
}));
jest.mock('../../../context/AppointmentContext', () => ({
  useAppointment: () => ({ resetDraft: mockResetDraft }),
}));
jest.mock('../../../context/AuthorisationContext', () => ({
  useUser: () => ({ refreshUserType: jest.fn(), isPatient: true }),
}));
jest.mock('../../api/care_planner_api_helpers', () => ({
  apiPatientAppointments: (...a: any[]) => mockApiPatientAppointments(...a),
  apiSharedAppointments: (...a: any[]) => mockApiSharedAppointments(...a),
}));
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

import Screen from '../../app/(tabs)/carePlanner/index';

beforeEach(() => {
  mockApiPatientAppointments.mockResolvedValue([]);
  mockApiSharedAppointments.mockResolvedValue([]);
});
afterEach(() => jest.clearAllMocks());

test('render screen with empty data', async () => {
  await actRender(<Screen />);
  expectText('Your Care Planner');
  expectText('Create new appointment');
  expectText('You have no appointments.');
  expectText('No appointments have been shared with you');
});

test('Create new appointment resets the draft and navigates to createAppointment', async () => {
  await actRender(<Screen />);
  await press('Create new appointment');
  expect(mockResetDraft).toHaveBeenCalledTimes(1);
  expect(mockRouter.push).toHaveBeenCalledWith('/carePlanner/createAppointment');
});

test('shows only the 3 most recent appointments, newest first', async () => {
  mockApiPatientAppointments.mockResolvedValue([
    { id: '1', created_at: '2026-01-01T00:00:00Z', scheduled_date: '2026-02-01T02:30:00Z', doctor: 'Dr 4', health_service: 'GP' },
    { id: '2', created_at: '2026-02-01T00:00:00Z', scheduled_date: '2026-02-01T02:30:00Z', doctor: 'Dr 3', health_service: 'GP' },
    { id: '3', created_at: '2026-03-01T00:00:00Z', scheduled_date: '2026-02-01T02:30:00Z', doctor: 'Dr 2', health_service: 'GP' },
    { id: '4', created_at: '2026-04-01T00:00:00Z', scheduled_date: '2026-02-01T02:30:00Z', doctor: 'Dr 1', health_service: 'GP' },
  ]);
  await actRender(<Screen />);
  expectNoText('Dr 4');
  const doctors = screen.getAllByText(/^Dr /).map((node) => node.props.children);
  expect(doctors).toEqual(['Dr 1', 'Dr 2', 'Dr 3']);
});

test('pressing an appointment navigates to appointmentDetails with the id', async () => {
  mockApiPatientAppointments.mockResolvedValue([
    { id: '1', created_at: '2026-01-01T00:00:00Z', scheduled_date: '2026-02-01T02:30:00Z', doctor: 'Dr 4', health_service: 'GP' },
  ]);
  await actRender(<Screen />);
  await press('Dr 4');
  expect(mockRouter.push).toHaveBeenCalledWith({
    pathname: '/carePlanner/appointmentDetails',
    params: { id: '1' },
  });
});

test('pressing see all appointments navigates to allAppointments', async () => {
  await actRender(<Screen />);
  await press('See all appointments');
  expect(mockRouter.push).toHaveBeenCalledWith('/carePlanner/allAppointments');
});

test('pressing a shared appointment navigates to editSharedAppointment with the id', async () => {
  mockApiSharedAppointments.mockResolvedValue([
    { id: '2', created_at: '2026-01-01T00:00:00Z', scheduled_date: '2026-02-01T02:30:00Z', doctor: 'Dr 4', health_service: 'GP' },
  ]);
  await actRender(<Screen />);
  await press('Dr 4');
  expect(mockRouter.push).toHaveBeenCalledWith({
    pathname: '/carePlanner/editSharedAppointment',
    params: { id: '2' },
  });
});

test('pressing see all shared appointments navigates to the allSharedAppointments', async () => {
  await actRender(<Screen />);
  await press('See all shared appointments');
  expect(mockRouter.push).toHaveBeenCalledWith('/carePlanner/allSharedAppointments');
});
