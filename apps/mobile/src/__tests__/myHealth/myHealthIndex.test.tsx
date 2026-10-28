/** Component tests for myHealthIndex tab in myHealth.
 * Tests cover:
 *
 *  Navigation buttons:
 *    - pressing each button navigates to its route
 *      (My Pain Profile, My Assessment Records, My Prescriptions)
 *  AveragePainChart:
 *    - renders the average pain chart
*/

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';

// ----- Mocks ------

const mockNavigate = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ navigate: mockNavigate }),
}));

// mock the chart as it is unit tested
jest.mock('../../../components/graphics/averagePainChart', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return { __esModule: true, default: () => React.createElement(Text, null, 'CHART') };
});

import Screen from '../../app/(tabs)/myHealth/index';

afterEach(() => {
  jest.clearAllMocks();
});

// ----- Tests -----

describe('Navigation buttons', () => {
  // each row: button label -> route it should navigate to
  const cases: [string, string][] = [
    ['My Pain Profile', '/myHealth/painProfile'],
    ['My Assessment Records', '/myHealth/healthTracking'],
    ['My Prescriptions', '/myHealth/prescriptions'],
  ];

  test.each(cases)('pressing "%s" navigates to %s', async (label, route) => {
    await render(<Screen />);
    const matches = screen.getAllByText(label);
    // press the last match (button is rendered after the heading text)
    fireEvent.press(matches[matches.length - 1]); 
    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith(route);
  });
});

describe('AveragePainChart', () => {
  test('renders the average pain chart', async () => {
    await render(<Screen />);
    expect(screen.getByText('CHART')).toBeTruthy();
  });
});
