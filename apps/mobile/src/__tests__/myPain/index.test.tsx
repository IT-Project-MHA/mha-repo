/** Component tests for the My Pain home screen.
 * Tests cover:
 *    - lists the five sections, with "Updated on" dates only for the ones completed this week
 *    - the progress text counts the completed sections, with a fire emoji when all are done
 *    - nothing is marked updated when there is no assessment for the week yet
 *    - pressing a section opens it with this week's assessment id, creating the assessment first
 *      when there is none
 *    - the reflection link opens the reflection screen
 *    - FindLastMonday moves a date back to the Monday of its week (a Monday stays the same, and the
 *      week can start in the previous year)
 *    - SetTimeMessage returns morning, afternoon or evening depending on the hour
 */
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react-native';
import { press } from '../../testHelpers/testHelpers';

const mockNavigate = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ navigate: mockNavigate }),
  useFocusEffect: (callback: () => void) => require('react').useEffect(callback, []),
}));
jest.mock('react-native-safe-area-context', () => require('react-native-safe-area-context/jest/mock').default);

const mockApiAssessment = jest.fn();
const mockSectionApis = {
  pain: jest.fn(), movement: jest.fn(), personalCare: jest.fn(), socialHealth: jest.fn(), management: jest.fn(),
};
jest.mock('@/api/django-API', () => ({
  apiUser: jest.fn(),
  apiAssessment: (...a: any[]) => mockApiAssessment(...a),
  apiMyPain: (...a: any[]) => mockSectionApis.pain(...a),
  apiMyMovement: (...a: any[]) => mockSectionApis.movement(...a),
  apiMyPersonalCare: (...a: any[]) => mockSectionApis.personalCare(...a),
  apiMySocialHealth: (...a: any[]) => mockSectionApis.socialHealth(...a),
  apiMyManagement: (...a: any[]) => mockSectionApis.management(...a),
}));
import Screen, { FindLastMonday, SetTimeMessage } from '../../app/(tabs)/myPain/index';

const DONE = [{ completed_at: '2026-10-19T02:00:00Z' }];
const TITLES = ['My Pain', 'My Movement', 'My Personal Care', 'My Social Health', 'My Management'];

const completeSections = (keys: (keyof typeof mockSectionApis)[]) => {
  Object.entries(mockSectionApis).forEach(([key, api]) =>
    api.mockResolvedValue(keys.includes(key as keyof typeof mockSectionApis) ? DONE : []));
};

beforeEach(() => {
  mockApiAssessment.mockResolvedValue([{ id: 'a1' }]);
  completeSections(['pain']);
});
afterEach(() => jest.clearAllMocks());

test('lists the five sections and dates only the completed ones', async () => {
  await render(<Screen />);
  TITLES.forEach((title) => expect(screen.getByText(title)).toBeTruthy());
  expect(await screen.findByText('Updated on 19 Oct 2026')).toBeTruthy();
  expect(screen.getAllByText(/Updated on/)).toHaveLength(1);
  expect(screen.getByText("You've completed 1/5 assessments this week.")).toBeTruthy();
});

test('all five completed shows the fire emoji', async () => {
  completeSections(['pain', 'movement', 'personalCare', 'socialHealth', 'management']);
  await render(<Screen />);
  expect(await screen.findByText("You've completed 5/5 assessments this week! 🔥")).toBeTruthy();
});

test('nothing is updated when there is no assessment for the week', async () => {
  mockApiAssessment.mockResolvedValue([]);
  await render(<Screen />);
  await waitFor(() => expect(mockApiAssessment).toHaveBeenCalled());
  expect(screen.queryByText(/Updated on/)).toBeNull();
  expect(screen.getByText("You've completed 0/5 assessments this week.")).toBeTruthy();
});

test('pressing a section opens it with this week\'s assessment id', async () => {
  await render(<Screen />);
  await press('My Movement');
  await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith({
    pathname: '/(tabs)/myPain/movementSection',
    params: { assessmentId: 'a1' },
  }));
});

test('pressing a section creates the assessment first when there is none', async () => {
  mockApiAssessment.mockImplementation(async (operation: string) =>
    operation === 'select' ? [] : { id: 'new1' });
  await render(<Screen />);
  await press('My Management');
  await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith({
    pathname: '/(tabs)/myPain/managementSection',
    params: { assessmentId: 'new1' },
  }));
  expect(mockApiAssessment).toHaveBeenCalledWith('create', { week_starting: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/) });
});

test('the reflection link opens the reflection screen', async () => {
  await render(<Screen />);
  await press('Add a reflection for this week');
  await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith({
    pathname: '/(tabs)/myPain/reflectionSection',
    params: { assessmentId: 'a1' },
  }));
});

test('FindLastMonday moves a date back to the Monday of its week', () => {
  const date = new Date(2026, 10, 1);
  FindLastMonday(date);
  expect([date.getFullYear(), date.getMonth(), date.getDate()]).toEqual([2026, 9, 26]);
});

test('FindLastMonday keeps a Monday the same, and a week can start in the previous year', () => {
  const monday = new Date(2026, 9, 26);
  FindLastMonday(monday);
  expect(monday.getDate()).toBe(26);

  const newYear = new Date(2027, 0, 2); // Saturday 2 January 2027
  FindLastMonday(newYear);
  expect([newYear.getFullYear(), newYear.getMonth(), newYear.getDate()]).toEqual([2026, 11, 28]);
});

test('SetTimeMessage greets by the time of day', () => {
  const atHour = (hour: number) => {
    const spy = jest.spyOn(Date.prototype, 'getHours').mockReturnValue(hour);
    const message = SetTimeMessage(new Date());
    spy.mockRestore();
    return message;
  };
  expect(atHour(9)).toBe('morning');
  expect(atHour(14)).toBe('afternoon');
  expect(atHour(20)).toBe('evening');
  expect(atHour(3)).toBe('evening');
});
