/** Component tests for the average pain chart.
 * 
 * Test plan: Insights (trends in pain over time).
 * The line chart is replaced with a stand-in that prints its values.
 * 
 * Tests cover:
 *
 *  Loading:
 *    - loads the logged-in user's pain history
 *    - loads the given patient's history when a supporter is viewing
 *    - plots the weekly scores and points to the pain profile for more
 * 
 *  Summary sentence:
 *    - no assessments yet asks the user to complete some
 *    - a failed load is treated as no assessments
 *    - one week asks for another week before comparing
 *    - compares the last two weeks when pain went up, went down, or stayed about the same
 *    - compares months when the last two months each have at least two weeks
 *    - falls back to weeks when the latest month has only one week
 *
 */

import React from 'react';
import { render } from '@testing-library/react-native';

import AveragePainChart from '../../../components/graphics/averagePainChart';

// ----- Mocks -----
const mockApiPainDetailHistory = jest.fn();
jest.mock('../../api/my_health_api_helpers', () => ({
  apiPainDetailHistory: (...a: any[]) => mockApiPainDetailHistory(...a),
}));

jest.mock('../../../context/ThemeContext', () => {
  const value = {
    theme: new Proxy({}, { get: (_t, k) => (k === 'then' ? undefined : {}) }),
    colours: new Proxy({}, { get: (_t, k) => (k === 'then' ? undefined : '#000') }),
  };
  return { useTheme: () => value };
});

jest.mock('react-native-gifted-charts', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return {
    LineChart: ({ data }: any) =>
      React.createElement(Text, null, `chart:${data.map((d: any) => d.value).join(',')}`),
  };
});

// ----- Test data -----
// old dates are used so a week is never in "this month" whenever the tests run
const wk = (completedAt: string, score: number) => ({ completedAt, score });

beforeEach(() => {
  jest.resetAllMocks();
  mockApiPainDetailHistory.mockResolvedValue([]);
});

describe('loading', () => {
  test('loads the logged-in user\'s pain history', async () => {
    await render(<AveragePainChart />);
    expect(mockApiPainDetailHistory).toHaveBeenCalledWith(undefined);
  });

  test('loads the given patient\'s history when a supporter is viewing', async () => {
    await render(<AveragePainChart patientProfileId="patient-9" />);
    expect(mockApiPainDetailHistory).toHaveBeenCalledWith('patient-9');
  });

  test('plots the weekly scores and points to the pain profile for more', async () => {
    mockApiPainDetailHistory.mockResolvedValue([wk('2020-01-06', 4), wk('2020-01-13', 6)]);
    const { findByText, getByText } = await render(<AveragePainChart />);
    expect(await findByText('chart:4,6')).toBeTruthy();
    expect(getByText('See more and print as PDF in My Pain Profile')).toBeTruthy();
  });
});

describe('summary sentence', () => {
  test('no assessments asks the user to complete some', async () => {
    const { findByText } = await render(<AveragePainChart />);
    expect(await findByText('Complete assessments to see your pain over time.')).toBeTruthy();
  });

  test('a failed load is treated as no assessments', async () => {
    mockApiPainDetailHistory.mockRejectedValue(new Error('Network request failed'));
    const { findByText } = await render(<AveragePainChart />);
    expect(await findByText('Complete assessments to see your pain over time.')).toBeTruthy();
  });

  test('one week asks for another week before comparing', async () => {
    mockApiPainDetailHistory.mockResolvedValue([wk('2020-01-06', 4)]);
    const { findByText } = await render(<AveragePainChart />);
    expect(
      await findByText('Complete another week of assessments to see how your pain is changing.')
    ).toBeTruthy();
  });

  test('compares the last two weeks when pain went up', async () => {
    mockApiPainDetailHistory.mockResolvedValue([wk('2020-01-06', 4), wk('2020-01-13', 6)]);
    const { findByText } = await render(<AveragePainChart />);
    expect(await findByText('Your average pain increased by 2.0 compared with last week.')).toBeTruthy();
  });

  test('compares the last two weeks when pain went down', async () => {
    mockApiPainDetailHistory.mockResolvedValue([wk('2020-01-06', 6), wk('2020-01-13', 4)]);
    const { findByText } = await render(<AveragePainChart />);
    expect(await findByText('Your average pain decreased by 2.0 compared with last week.')).toBeTruthy();
  });

  test('a change smaller than 0.3 counts as about the same', async () => {
    mockApiPainDetailHistory.mockResolvedValue([wk('2020-01-06', 5), wk('2020-01-13', 5.2)]);
    const { findByText } = await render(<AveragePainChart />);
    expect(
      await findByText('Your average pain stayed about the same compared with last week.')
    ).toBeTruthy();
  });

  test('compares months when the last two months each have at least two weeks', async () => {
    mockApiPainDetailHistory.mockResolvedValue([
      wk('2020-01-06', 4),
      wk('2020-01-13', 4),
      wk('2020-02-03', 6),
      wk('2020-02-10', 6),
    ]);
    const { findByText } = await render(<AveragePainChart />);
    expect(
      await findByText('Your average pain in February increased by 2.0 compared with January.')
    ).toBeTruthy();
  });

  test('falls back to weeks when the latest month has only one week', async () => {
    mockApiPainDetailHistory.mockResolvedValue([
      wk('2020-01-06', 4),
      wk('2020-01-13', 4),
      wk('2020-02-03', 7),
    ]);
    const { findByText } = await render(<AveragePainChart />);
    expect(await findByText('Your average pain increased by 3.0 compared with last week.')).toBeTruthy();
  });
});
