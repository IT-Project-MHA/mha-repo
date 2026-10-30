/** Component tests for the allAppointments screen in carePlanner.
 * Tests cover:
 *    - shows the empty-state message when there are no appointments
 *    - upcoming and past appointments are split into their own sections
 *    - the sort dropdown opens and offers the newest-date option
 *    - pressing an appointment opens its details page
 *    - a failed load shows the could-not-load message
 */

import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react-native';

const mockRouter = { push: jest.fn(), back: jest.fn(), replace: jest.fn() };
const mockApiPatientAppointments = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => mockRouter,
  useFocusEffect: (cb: () => void) => require('react').useEffect(cb, []),
}));
jest.mock('../../api/care_planner_api_helpers', () => ({
  apiPatientAppointments: (...a: any[]) => mockApiPatientAppointments(...a),
}));
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));
jest.mock('@react-native-vector-icons/ionicons', () => ({ Ionicons: () => null }));

import Screen from '../../app/(tabs)/carePlanner/allAppointments';

const upcoming = {
  id: 'up1',
  created_at: '2026-02-01T00:00:00Z',
  scheduled_date: '2099-06-15T02:30:00Z',
  doctor: 'Dr',
  health_service: 'GP',
};
const past = {
  id: 'pa1',
  created_at: '2026-01-01T00:00:00Z',
  scheduled_date: '2000-06-15T02:30:00Z',
  doctor: 'Dr',
  health_service: 'Physio',
};

beforeEach(() => mockApiPatientAppointments.mockResolvedValue([]));
afterEach(() => jest.clearAllMocks());

test('shows the empty-state message when there are no appointments', async () => {
  await act(async () => { await render(<Screen />); });
  expect(screen.getByText('All Appointments')).toBeTruthy();
  expect(screen.getByText('You have no appointments')).toBeTruthy();
});

test('upcoming and past appointments are split into their own sections', async () => {
  mockApiPatientAppointments.mockResolvedValue([upcoming, past]);
  await act(async () => { await render(<Screen />); });
  expect(screen.getByText('Upcoming')).toBeTruthy();
  expect(screen.getByText('Past')).toBeTruthy();
});

test('the sort dropdown opens and offers the newest-date option', async () => {
  mockApiPatientAppointments.mockResolvedValue([upcoming]);
  await act(async () => { await render(<Screen />); });
  await fireEvent.press(screen.getByText('Recently added'));
  expect(screen.getByText('Newest date')).toBeTruthy();
});

test('pressing an appointment opens its details page', async () => {
  mockApiPatientAppointments.mockResolvedValue([upcoming]);
  await act(async () => { await render(<Screen />); });
  await fireEvent.press(screen.getByText('GP'));
  expect(mockRouter.push).toHaveBeenCalledWith({
    pathname: '/carePlanner/appointmentDetails',
    params: { id: 'up1' },
  });
});

test('a failed load shows the could-not-load message', async () => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
  mockApiPatientAppointments.mockRejectedValue(new Error('placeholder error'));
  await act(async () => { await render(<Screen />); });
  expect(screen.getByText('Your appointments could not be loaded')).toBeTruthy();
});
