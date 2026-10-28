/** Component tests for the assessment chart in Health Tracker.
 * 
 * Test plan: Pain graphs (filterable by pain location and dates).
 * The line chart and pain table are replaced with stand-ins that print what they receive.
 * 
 * Tests cover:
 *
 *  Loading and areas:
 *    - opens on pain and loads the logged-in user's pain history
 *    - loads the given patient's history when a supporter is viewing
 *    - plots the weekly scores and summarises them in the table
 *    - the table ignores weeks with no worst or mildest value
 *    - choosing another area loads that area and drops the pain table
 *  Empty states:
 *    - no assessments yet shows a prompt, an empty chart and no table
 *    - a failed load is treated as no assessments rather than crashing
 *  Filtering by pain location:
 *    - offers every reported location
 *    - choosing a location narrows the chart and table, and All locations brings them back
 *  Time ranges:
 *    - only offers the ranges the data is old enough to fill
 *    - a few weeks of data offers no range choice at all
 *    - choosing a range keeps only the weeks inside it, and All brings them back
 *    - a range with no assessments says so
 *    - a location with no assessments in the range says so
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import AssessmentChart from '../../../components/graphics/AssessmentChart';
import { toApiDate } from '../../../constants/date';

// ----- Mocks -----
const mockApiScoreHistory = jest.fn();
const mockApiPainDetailHistory = jest.fn();
jest.mock('../../api/my_health_api_helpers', () => ({
  apiScoreHistory: (...a: any[]) => mockApiScoreHistory(...a),
  apiPainDetailHistory: (...a: any[]) => mockApiPainDetailHistory(...a),
}));

jest.mock('../../../context/ThemeContext', () => ({
  useTheme: () => ({
    theme: new Proxy({}, { get: (_t, k) => (k === 'then' ? undefined : {}) }),
    colours: new Proxy({}, { get: (_t, k) => (k === 'then' ? undefined : '#000') }),
  }),
}));

jest.mock('react-native-gifted-charts', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return {
    LineChart: ({ data }: any) =>
      React.createElement(Text, null, `chart:${data.map((d: any) => d.value).join(',')}`),
  };
});

jest.mock('../../../components/graphics/PainTable', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return {
    __esModule: true,
    default: (p: any) =>
      React.createElement(
        Text,
        null,
        `table[${p.periodLabel}|avg:${p.stats.average}|worst:${p.stats.worst}|mildest:${p.stats.mildest}|weeks:${p.weeks.length}]`
      ),
  };
});

// the time range switch becomes one plain button per range
jest.mock('../../../components/atomicUI/SegmentedControlPill', () => {
  const React = require('react');
  const { Pressable, Text } = require('react-native');
  return {
    __esModule: true,
    default: ({ values, onChange }: { values: string[]; onChange: (i: number) => void }) =>
      React.createElement(
        React.Fragment,
        null,
        values.map((v, i) =>
          React.createElement(Pressable, { key: v, onPress: () => onChange(i) }, React.createElement(Text, null, v))
        )
      ),
  };
});

// ----- Test data -----
// a date n days before today, as the API sends it ('YYYY-MM-DD')
const daysAgo = (n: number) => toApiDate(new Date(Date.now() - n * 24 * 60 * 60 * 1000));

const pt = (
  days: number,
  score: number,
  worst: number | null = 8,
  mildest: number | null = 2,
  locations: string[] = []
) => ({ completedAt: daysAgo(days), score, worst, mildest, locations });

beforeEach(() => {
  jest.resetAllMocks();
  mockApiPainDetailHistory.mockResolvedValue([]);
  mockApiScoreHistory.mockResolvedValue([]);
});

describe('loading and areas', () => {
  test('opens on pain and loads the logged-in user\'s pain history', async () => {
    const { findByText } = await render(<AssessmentChart />);
    expect(await findByText('Your average pain over time')).toBeTruthy();
    expect(mockApiPainDetailHistory).toHaveBeenCalledWith(undefined);
  });

  test('loads the given patient\'s history when a supporter is viewing', async () => {
    await render(<AssessmentChart patientProfileId="patient-9" />);
    expect(mockApiPainDetailHistory).toHaveBeenCalledWith('patient-9');
  });

  test('plots the weekly scores and summarises them in the table', async () => {
    mockApiPainDetailHistory.mockResolvedValue([pt(14, 4, 7, 2), pt(7, 6, 9, 3)]);
    const { findByText } = await render(<AssessmentChart />);
    expect(await findByText('chart:4,6')).toBeTruthy();
    expect(await findByText('table[All time|avg:5|worst:9|mildest:2|weeks:2]')).toBeTruthy();
  });

  test('the table ignores weeks with no worst or mildest value', async () => {
    mockApiPainDetailHistory.mockResolvedValue([pt(14, 4, null, null), pt(7, 6, 9, null)]);
    const { findByText } = await render(<AssessmentChart />);
    expect(await findByText('table[All time|avg:5|worst:9|mildest:null|weeks:2]')).toBeTruthy();
  });

  test('choosing another area loads that area and drops the pain table', async () => {
    mockApiScoreHistory.mockResolvedValue([{ completedAt: daysAgo(7), score: 5 }]);
    const { getByText, findByText, queryByText } = await render(<AssessmentChart />);
    await fireEvent.press(getByText('Movement'));
    expect(await findByText('Impact to movement over time')).toBeTruthy();
    expect(await findByText('chart:5')).toBeTruthy();
    expect(mockApiScoreHistory).toHaveBeenCalledWith('movement', undefined);
    expect(queryByText(/^table\[/)).toBeNull();
  });
});

describe('empty states', () => {
  test('no assessments yet shows a prompt, an empty chart and no table', async () => {
    const { findByText, getByText, queryByText } = await render(<AssessmentChart />);
    expect(await findByText('Complete assessments to see your pain over time')).toBeTruthy();
    expect(getByText('chart:0,0')).toBeTruthy();
    expect(queryByText(/^table\[/)).toBeNull();
  });

  test('a failed load is treated as no assessments rather than crashing', async () => {
    mockApiPainDetailHistory.mockRejectedValue(new Error('Network request failed'));
    const { findByText } = await render(<AssessmentChart />);
    expect(await findByText('Complete assessments to see your pain over time')).toBeTruthy();
  });
});

describe('filtering by pain location', () => {
  const history = [
    pt(21, 3, 5, 1, ['Lower back']),
    pt(14, 5, 7, 2, ['Shoulder']),
    pt(7, 7, 9, 3, ['Lower back', 'Shoulder']),
  ];

  test('offers every reported location, and filtering narrows the chart and table', async () => {
    mockApiPainDetailHistory.mockResolvedValue(history);
    const { findByText, getByText } = await render(<AssessmentChart />);
    expect(await findByText('All locations')).toBeTruthy();
    expect(getByText('Lower back')).toBeTruthy();
    expect(getByText('Shoulder')).toBeTruthy();
    expect(getByText(/weeks:3\]$/)).toBeTruthy();

    await fireEvent.press(getByText('Lower back'));
    expect(getByText('Your average pain (Lower back) over time')).toBeTruthy();
    expect(getByText(/^table\[All time · Lower back\|.*weeks:2\]$/)).toBeTruthy();
    expect(getByText('chart:3,7')).toBeTruthy();

    await fireEvent.press(getByText('All locations'));
    expect(getByText(/weeks:3\]$/)).toBeTruthy();
  });
});

describe('time ranges', () => {
  test('only offers the ranges the data is old enough to fill', async () => {
    mockApiPainDetailHistory.mockResolvedValue([pt(100, 4), pt(7, 6)]);
    const { findByText, queryByText } = await render(<AssessmentChart />);
    expect(await findByText('1M')).toBeTruthy();
    expect(await findByText('3M')).toBeTruthy();
    expect(await findByText('All')).toBeTruthy();
    expect(queryByText('6M')).toBeNull();
    expect(queryByText('1Y')).toBeNull();
  });

  test('a few weeks of data offers no range choice at all', async () => {
    mockApiPainDetailHistory.mockResolvedValue([pt(14, 4), pt(7, 6)]);
    const { findByText, queryByText } = await render(<AssessmentChart />);
    await findByText('chart:4,6');
    expect(queryByText('1M')).toBeNull();
    expect(queryByText('All')).toBeNull();
  });

  test('choosing a range keeps only the weeks inside it, and All brings them back', async () => {
    mockApiPainDetailHistory.mockResolvedValue([pt(100, 3), pt(50, 5), pt(7, 7)]);
    const { findByText, getByText } = await render(<AssessmentChart />);
    await findByText('1M');

    await fireEvent.press(getByText('1M'));
    expect(getByText(/^table\[Last 1M\|.*weeks:1\]$/)).toBeTruthy();
    expect(getByText('chart:7')).toBeTruthy();

    await fireEvent.press(getByText('All'));
    expect(getByText(/^table\[All time\|.*weeks:3\]$/)).toBeTruthy();
  });

  test('a range with no assessments says so', async () => {
    mockApiPainDetailHistory.mockResolvedValue([pt(100, 4)]);
    const { findByText, getByText } = await render(<AssessmentChart />);
    await fireEvent.press(await findByText('1M'));
    expect(getByText('No assessments in this period')).toBeTruthy();
  });

  test('a location with no assessments in the range says so', async () => {
    mockApiPainDetailHistory.mockResolvedValue([pt(100, 4, 7, 2, ['Lower back']), pt(7, 6, 9, 3, ['Shoulder'])]);
    const { findByText, getByText } = await render(<AssessmentChart />);
    await fireEvent.press(await findByText('Lower back'));
    await fireEvent.press(await findByText('1M'));
    expect(getByText('No assessments with pain in lower back in this period')).toBeTruthy();
  });
});
