/** Component tests for the allSharedAppointments screen in carePlanner.
 * Tests cover:
 *    - the empty-state message when nothing has been shared
 *    - shared appointments render with the patient's name, split into upcoming and past
 *    - the patient filter dropdown lists the patients who share appointments
 *    - filtering to a patient with nothing shared shows that patient's empty message
 *    - pressing a shared appointment opens the shared appointment page
 *    - a failed load shows the could-not-load message
 */

import React from 'react';
import { screen } from '@testing-library/react-native';
import { actRender, press, expectText } from '../../helpers/testHelpers';

const mockRouter = { push: jest.fn(), back: jest.fn(), replace: jest.fn() };
const mockApiSharedAppointments = jest.fn();
const mockApiSupportedPatients = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => mockRouter,
  useFocusEffect: (cb: () => void) => require('react').useEffect(cb, []),
}));
jest.mock('../../api/care_planner_api_helpers', () => ({
  apiSharedAppointments: (...a: any[]) => mockApiSharedAppointments(...a),
  apiSupportedPatients: (...a: any[]) => mockApiSupportedPatients(...a),
}));
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));
jest.mock('@react-native-vector-icons/ionicons', () => ({ Ionicons: () => null }));

import Screen from '../../app/(tabs)/carePlanner/allSharedAppointments';

const shared = {
  id: 's1',
  created_at: '2026-02-01T00:00:00Z',
  scheduled_date: '2099-06-15T02:30:00Z',
  doctor: 'Dr',
  health_service: 'GP',
  patient_profile: 'p1',
  patientName: 'p1',
};

beforeEach(() => {
  mockApiSharedAppointments.mockResolvedValue([]);
  mockApiSupportedPatients.mockResolvedValue([]);
});
afterEach(() => jest.clearAllMocks());

test('shows the empty-state message when nothing has been shared', async () => {
  await actRender(<Screen />);
  expectText('All shared appointments');
  expectText('No appointments have been shared with you');
});

test('shared appointments render with the patient name and section', async () => {
  mockApiSharedAppointments.mockResolvedValue([shared]);
  mockApiSupportedPatients.mockResolvedValue([{ patientId: 'p1', patientName: 'p1' }]);
  await actRender(<Screen />);
  expectText('Upcoming');
  expectText('p1');
  expectText('Dr');
});

test('the patient filter dropdown lists the patients who share appointments', async () => {
  mockApiSharedAppointments.mockResolvedValue([shared]);
  mockApiSupportedPatients.mockResolvedValue([{ patientId: 'p1', patientName: 'p1' }]);
  await actRender(<Screen />);
  await press('All patients');
  // the patient appears both as the appointment's name and as a filter option
  expect(screen.getAllByText('p1').length).toBeGreaterThan(1);
});

test('filtering to a patient with nothing shared shows that patient empty message', async () => {
  mockApiSharedAppointments.mockResolvedValue([shared]);
  mockApiSupportedPatients.mockResolvedValue([
    { patientId: 'p1', patientName: 'p1' },
    { patientId: 'p2', patientName: 'p2' },
  ]);
  await actRender(<Screen />);
  await press('All patients');
  await press('p2');
  expectText('p2 has not shared any appointments with you');
});

test('pressing a shared appointment opens the shared appointment page', async () => {
  mockApiSharedAppointments.mockResolvedValue([shared]);
  mockApiSupportedPatients.mockResolvedValue([{ patientId: 'p1', patientName: 'p1' }]);
  await actRender(<Screen />);
  await press('Dr');
  expect(mockRouter.push).toHaveBeenCalledWith({
    pathname: '/carePlanner/editSharedAppointment',
    params: { id: 's1' },
  });
});

test('a failed load shows the could-not-load message', async () => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
  mockApiSharedAppointments.mockRejectedValue(new Error('placeholder error'));
  await actRender(<Screen />);
  expectText('Shared appointments could not be loaded');
});
