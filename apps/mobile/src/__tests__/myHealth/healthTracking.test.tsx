/** Component tests for healthTracking tab in myHealth.
 * Tests cover:
 *
 *  ChartPage:
 *    - renders the chart on the default tab
 *  RecordPage:
 *    - pressing the toggle expands the week and loads its answered sections
 *    - pressing the toggle again collapses the week
 *    - does not refetch answered sections when the same week is reopened
 *    - only answered sections appear when a week is expanded
 *    - pressing an answered section navigates to its summary
 *    - renders a year heading for each year of assessment weeks
*/

import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react-native';

// ----- Mocks -----

const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush }),
}));

// API helpers 
const mockOwnPatientProfileId = jest.fn();
const mockApiAssessment = jest.fn();
const mockApiAnsweredSections = jest.fn();
jest.mock('@/api/care_planner_api_helpers', () => ({
  ownPatientProfileId: (...args: any[]) => mockOwnPatientProfileId(...args),
}));
jest.mock('@/api/django-API', () => ({
  apiAssessment: (...args: any[]) => mockApiAssessment(...args),
}));
jest.mock('@/api/my_health_api_helpers', () => ({
  apiAnsweredSections: (...args: any[]) => mockApiAnsweredSections(...args),
}));

// mock the chart as it is unit tested
jest.mock('../../../components/graphics/AssessmentChart', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return { __esModule: true, default: () => React.createElement(Text, null, 'CHART') };
});

import Screen from '../../app/(tabs)/myHealth/healthTracking';

// Render the tab and open the Record page
async function renderTabAndRecordPage() {
  await render(<Screen />);
  await act(async () => {
    await fireEvent.press(screen.getByText('History'));
  });
  return screen.findByText('19-25 October');
}

// ----- Tests -----

describe('ChartPage', () => {
  test('renders the chart on the default tab', async () => {
    await render(<Screen />);
    expect(screen.getByText('My Assessment Records')).toBeTruthy();
    expect(screen.getByText('CHART')).toBeTruthy();
  });
});

describe('RecordPage', () => {
  beforeEach(() => {
    mockOwnPatientProfileId.mockResolvedValue(1);
    // two assessments in different years
    mockApiAssessment.mockResolvedValue([
      { week_starting: '2026-10-19' },
      { week_starting: '2025-10-20' },
    ]);
    // answered sections depend on which week is opened
    mockApiAnsweredSections.mockImplementation((_patientId: unknown, week: string) =>
      Promise.resolve(week === '2026-10-19' ? ['my_pain'] : ['my_movement']),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('pressing the toggle expands the week and loads its answered sections', async () => {
    await renderTabAndRecordPage();
    await act(async () => {
      await fireEvent.press(screen.getByText('19-25 October')); // open
    });
    expect(screen.getByText('My Pain')).toBeTruthy();
    expect(mockApiAnsweredSections).toHaveBeenCalledTimes(1);
    expect(mockApiAnsweredSections).toHaveBeenCalledWith(undefined, '2026-10-19');
    expect(screen.getByText('▲')).toBeTruthy();
  });

  test('pressing the toggle again collapses the week', async () => {
    await renderTabAndRecordPage();
    await act(async () => {
      await fireEvent.press(screen.getByText('19-25 October')); // open
    });
    expect(screen.getByText('My Pain')).toBeTruthy();

    await fireEvent.press(screen.getByText('19-25 October')); // close
    expect(screen.queryByText('My Pain')).toBeNull();
    expect(screen.queryByText('▲')).toBeNull();
    expect(screen.getAllByText('▼')).toHaveLength(2);
  });

  test('does not refetch answered sections when the same week is reopened', async () => {
    await renderTabAndRecordPage();
    await act(async () => {
      await fireEvent.press(screen.getByText('19-25 October')); // open
    });
    expect(screen.getByText('My Pain')).toBeTruthy();

    await fireEvent.press(screen.getByText('19-25 October')); // close
    expect(screen.queryByText('My Pain')).toBeNull();

    await fireEvent.press(screen.getByText('19-25 October')); // open (answer is cached)
    expect(screen.getByText('My Pain')).toBeTruthy();
    expect(mockApiAnsweredSections).toHaveBeenCalledTimes(1);
  });

  test('only answered sections appear when a week is expanded', async () => {
    await renderTabAndRecordPage();
    await act(async () => {
      await fireEvent.press(screen.getByText('19-25 October'));
    });
    expect(screen.getByText('My Pain')).toBeTruthy();
    expect(screen.queryByText('My Movement')).toBeNull();
    expect(screen.queryByText('My Personal Care')).toBeNull();
    expect(screen.queryByText('My Social Health')).toBeNull();
    expect(screen.queryByText('My Management')).toBeNull();
  });

  test('pressing an answered section navigates to its summary', async () => {
    await renderTabAndRecordPage();
    await act(async () => {
      await fireEvent.press(screen.getByText('19-25 October'));
    });
    await fireEvent.press(screen.getByText('My Pain'));
    expect(mockPush).toHaveBeenCalledTimes(1);
    expect(mockPush).toHaveBeenCalledWith({
      pathname: '/myHealth/assessmentSectionSummary',
      params: { week: '2026-10-19', section: 'my_pain' },
    });
  });

  test('renders a year heading for each year of assessment weeks', async () => {
    await renderTabAndRecordPage();
    expect(screen.getByText('2026')).toBeTruthy();
    expect(screen.getByText('2025')).toBeTruthy();
  });
});
