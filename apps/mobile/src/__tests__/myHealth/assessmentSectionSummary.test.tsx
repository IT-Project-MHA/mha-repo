/** Basic component tests for assessmentSectionSummary tab in myHealth.
 * Tests cover:
 * - always renders the page header
 * - shows the section title for a known section
 * - falls back to "Assessment" and loads nothing for an unknown section
 * - renders the formatted week range when a week is given
 * - params load the correct section & week
 * - renders the field rows once the loader resolves
 * - renders no field rows before data has loaded
*/

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react-native';

// ----- Mocks -----
// route params (Week, section)
let mockParams: { week?: string; section?: string } = {};
jest.mock('expo-router', () => ({
  useLocalSearchParams: () => mockParams,
}));

// API helpers
const mockApiMyPainSummary = jest.fn();
const mockApiMovementSummary = jest.fn();
const mockApiPersonalCareSummary = jest.fn();
const mockApiSocialHealthSummary = jest.fn();
const mockApiManagementSummary = jest.fn();
jest.mock('@/api/my_health_api_helpers', () => ({
  apiMyPainSummary: (...args: any[]) => mockApiMyPainSummary(...args),
  apiMovementSummary: (...args: any[]) => mockApiMovementSummary(...args),
  apiPersonalCareSummary: (...args: any[]) => mockApiPersonalCareSummary(...args),
  apiSocialHealthSummary: (...args: any[]) => mockApiSocialHealthSummary(...args),
  apiManagementSummary: (...args: any[]) => mockApiManagementSummary(...args),
}));

import Screen from '../../app/(tabs)/myHealth/assessmentSectionSummary';

beforeEach(() => {
  // set mock values to empty, override in the tests
  mockParams = {};
  mockApiMyPainSummary.mockResolvedValue(null);
  mockApiMovementSummary.mockResolvedValue(null);
  mockApiPersonalCareSummary.mockResolvedValue(null);
  mockApiSocialHealthSummary.mockResolvedValue(null);
  mockApiManagementSummary.mockResolvedValue(null);
});

afterEach(() => {
  jest.clearAllMocks();
});

// --- Tests -----------------------------------------------------------------

test('always renders the page header', async () => {
  mockParams = { section: 'my_pain', week: '2026-10-19' };
  await render(<Screen />);
  expect(screen.getByText('My Assessment Summary')).toBeTruthy();
});

test('shows the section title for a known section', async () => {
  mockParams = { section: 'management', week: '2026-10-19' };
  await render(<Screen />);
  expect(screen.getByText('My Current Management')).toBeTruthy();
});

test('falls back to "Assessment" and loads nothing for an unknown section', async () => {
  mockParams = { section: 'unknown', week: '2026-10-19' };
  await render(<Screen />);

  expect(screen.getByText('Assessment')).toBeTruthy();
  expect(mockApiMyPainSummary).not.toHaveBeenCalled();
  expect(mockApiMovementSummary).not.toHaveBeenCalled();
  expect(mockApiPersonalCareSummary).not.toHaveBeenCalled();
  expect(mockApiSocialHealthSummary).not.toHaveBeenCalled();
  expect(mockApiManagementSummary).not.toHaveBeenCalled();
});

test('renders the formatted week range when a week is given', async () => {
  mockParams = { section: 'my_pain', week: '2026-10-19' };
  await render(<Screen />);
  expect(screen.getByText('19-25 October')).toBeTruthy();
});

test('params load the correct section & week', async () => {
  const cases: [string, jest.Mock][] = [
    ['my_pain', mockApiMyPainSummary],
    ['my_movement', mockApiMovementSummary],
    ['personal_care', mockApiPersonalCareSummary],
    ['social_health', mockApiSocialHealthSummary],
    ['management', mockApiManagementSummary],
  ];

  for (const [section, loader] of cases) {
    jest.clearAllMocks();
    mockParams = { section, week: '2026-10-19' };
    const result = await render(<Screen />);
    const unmount = result.unmount;

    expect(loader).toHaveBeenCalledTimes(1);
    expect(loader).toHaveBeenCalledWith(undefined, '2026-10-19');
    for (const [, other] of cases) {
      if (other !== loader) expect(other).not.toHaveBeenCalled();
    }

    await unmount();
  }
});

test('renders the field rows once the loader resolves', async () => {
  mockApiMyPainSummary.mockResolvedValue({
    location: 'Lower back',
    current: 7,
    average: 5,
    worst: 9,
    mildest: 2,
    characteristics: 'Aching',
  });
  mockParams = { section: 'my_pain', week: '2026-10-19' };
  await render(<Screen />);

  expect(await screen.findByText('My Pain location')).toBeTruthy();
  expect(screen.getByText('Lower back')).toBeTruthy();
  expect(screen.getByText('Aching')).toBeTruthy();
});

test('renders no field rows before data has loaded', async () => {
  mockApiMyPainSummary.mockReturnValue(new Promise(() => {}));
  mockParams = { section: 'my_pain', week: '2026-10-19' };
  await render(<Screen />);

  expect(screen.getByText('My Pain')).toBeTruthy();
  expect(screen.queryByText('My Pain location')).toBeNull();
});
