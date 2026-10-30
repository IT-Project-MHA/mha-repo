/** Component tests for the assessment chart in Health Tracker.
 *
 * Pain filtering is done by the server, so the api helpers are mocked to play the server
 * tests check the chart asks for the right range/location and shows what comes back.
 *
 *  Loading and areas:
 *    - opens on pain and requests all time, all locations
 *    - requests the given patient's history when a supporter is viewing
 *    - plots the weekly scores and summarises them in the table
 *    - the table ignores weeks with no worst or mildest value
 *    - choosing another area loads that area and drops the pain table
 * 
 *  Empty states:
 *    - no assessments yet shows a prompt, an empty chart and no table
 *   
 *  Filtering by pain location (server side):
 *    - offers every location option, even ones with no data
 *    - choosing a location requests it, All locations clears it
 * 
 *  Time ranges (server side):
 *    - always offers every range
 *    - 1M requests the last 30 days, 3M 91, All none
 *    - a range with no assessments says so
 *    - a location with no assessments says so
 */

import { render, fireEvent, waitFor } from '@testing-library/react-native';
import AssessmentChart from '../../../components/graphics/AssessmentChart';
import { toApiDate } from '../../../constants/date';

// ----- Mocks -----
const mockApiScoreHistory = jest.fn();
const mockApiPainDetailHistory = jest.fn();
const mockApiPainLocations = jest.fn();
jest.mock('../../api/my_health_api_helpers', () => ({
  apiScoreHistory: (...a: any[]) => mockApiScoreHistory(...a),
  apiPainDetailHistory: (...a: any[]) => mockApiPainDetailHistory(...a),
  apiPainLocations: (...a: any[]) => mockApiPainLocations(...a),
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

// the time range switch becomes one button per range
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
const daysAgo = (n: number) => toApiDate(new Date(Date.now() - n * 24 * 60 * 60 * 1000));

// one week as apiPainDetailHistory returns it
const pt = (days: number, score: number, worst: number | null = 8, mildest: number | null = 2) => ({
  completedAt: daysAgo(days),
  score,
  worst,
  mildest,
});

const BACK = { id: 'loc-back', label: 'Lower back' };
const SHOULDER = { id: 'loc-shoulder', label: 'Shoulder' };

beforeEach(() => {
  jest.resetAllMocks();
  mockApiPainDetailHistory.mockResolvedValue([]);
  mockApiScoreHistory.mockResolvedValue([]);
  mockApiPainLocations.mockResolvedValue([BACK, SHOULDER]);
});

describe('loading and areas', () => {
  test('opens on pain and requests all time, all locations', async () => {
    const { findByText } = await render(<AssessmentChart />);
    expect(await findByText('Your average pain over time')).toBeTruthy();
    expect(mockApiPainDetailHistory).toHaveBeenCalledWith(undefined, null, null);
  });

  test('requests the given patient\'s history when a supporter is viewing', async () => {
    await render(<AssessmentChart patientProfileId="patient-9" />);
    expect(mockApiPainDetailHistory).toHaveBeenCalledWith('patient-9', null, null);
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

});

describe('filtering by pain location (server side)', () => {
  test('offers every location option, even ones with no data', async () => {
    const { findByText, getByText } = await render(<AssessmentChart />);
    expect(await findByText('All locations')).toBeTruthy();
    expect(getByText('Lower back')).toBeTruthy();
    expect(getByText('Shoulder')).toBeTruthy();
  });

  test('choosing a location requests it, and All locations clears it', async () => {
    // play the server: all weeks, or only the weeks with that location
    mockApiPainDetailHistory.mockImplementation(async (_id, _days, location) =>
      location === BACK.id ? [pt(21, 3), pt(7, 7)] : [pt(21, 3), pt(14, 5), pt(7, 7)]
    );
    const { findByText, getByText } = await render(<AssessmentChart />);
    expect(await findByText('chart:3,5,7')).toBeTruthy();

    await fireEvent.press(getByText('Lower back'));
    expect(await findByText('chart:3,7')).toBeTruthy();
    expect(mockApiPainDetailHistory).toHaveBeenLastCalledWith(undefined, null, BACK.id);
    expect(getByText('Your average pain (Lower back) over time')).toBeTruthy();
    expect(getByText(/^table\[All time · Lower back\|.*weeks:2\]$/)).toBeTruthy();

    await fireEvent.press(getByText('All locations'));
    expect(await findByText('chart:3,5,7')).toBeTruthy();
    expect(mockApiPainDetailHistory).toHaveBeenLastCalledWith(undefined, null, null);
  });
});

describe('time ranges (server side)', () => {
  test('always offers every range, even with only a few weeks of data', async () => {
    mockApiPainDetailHistory.mockResolvedValue([pt(14, 4), pt(7, 6)]);
    const { findByText } = await render(<AssessmentChart />);
    await findByText('chart:4,6');
    for (const label of ['1M', '3M', '6M', '1Y', 'All']) {
      expect(await findByText(label)).toBeTruthy();
    }
  });

  test('1M requests the last 30 days, 3M the last 91, and All requests no limit', async () => {
    const { findByText, getByText } = await render(<AssessmentChart />);
    await findByText('1M');

    await fireEvent.press(getByText('1M'));
    await waitFor(() =>
      expect(mockApiPainDetailHistory).toHaveBeenLastCalledWith(undefined, 30, null)
    );

    await fireEvent.press(getByText('3M'));
    await waitFor(() =>
      expect(mockApiPainDetailHistory).toHaveBeenLastCalledWith(undefined, 91, null)
    );

    await fireEvent.press(getByText('All'));
    await waitFor(() =>
      expect(mockApiPainDetailHistory).toHaveBeenLastCalledWith(undefined, null, null)
    );
  });

  test('shows the weeks the server returns for the 30 days', async () => {
    mockApiPainDetailHistory.mockImplementation(async (_id, days) =>
      days === 30 ? [pt(7, 7)] : [pt(100, 3), pt(50, 5), pt(7, 7)]
    );
    const { findByText, getByText } = await render(<AssessmentChart />);
    expect(await findByText(/^table\[All time\|.*weeks:3\]$/)).toBeTruthy();

    await fireEvent.press(getByText('1M'));
    expect(await findByText(/^table\[Last 1M\|.*weeks:1\]$/)).toBeTruthy();
    expect(getByText('chart:7')).toBeTruthy();
  });

  test('a range with no assessments says so', async () => {
    mockApiPainDetailHistory.mockImplementation(async (_id, days) =>
      days === 30 ? [] : [pt(100, 4)]
    );
    const { findByText } = await render(<AssessmentChart />);
    await fireEvent.press(await findByText('1M'));
    expect(await findByText('No assessments in this period')).toBeTruthy();
  });

  test('a location with no assessments says so', async () => {
    mockApiPainDetailHistory.mockImplementation(async (_id, _days, location) =>
      location === BACK.id ? [] : [pt(7, 6)]
    );
    const { findByText } = await render(<AssessmentChart />);
    await fireEvent.press(await findByText('Lower back'));
    expect(
      await findByText('No assessments with pain in lower back in this period')
    ).toBeTruthy();
  });
});