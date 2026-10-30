/** Component tests for the pain table (components/graphics/PainTable.tsx).
 * 
 * Test plan: Pain graphs (the table shown with the chart).
 * 
 * Tests cover:
 *
 *  Content:
 *    - shows the header, the overall row and a row for the week
 *    - missing values show as a dash
 *    - dates use the formatDate function it is given
 * 
 *  Order and length:
 *    - weeks are listed newest first
 *    - a long history shows only the newest five weeks until "Show all" is pressed
 *    - "Show fewer" collapses it again
 *    - no toggle when every week already fits
 *    - the number of collapsed rows can be changed
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import PainSummaryTable from '../../../components/graphics/PainTable';

jest.mock('../../../context/ThemeContext', () => ({
  useTheme: () => ({
    theme: new Proxy({}, { get: (_t, k) => (k === 'then' ? undefined : {}) }),
    colours: new Proxy({}, { get: (_t, k) => (k === 'then' ? undefined : '#000') }),
  }),
}));

// ----- Test data -----
const week = (completedAt: string, score: number, worst: number | null = 8, mildest: number | null = 2) => ({
  completedAt,
  score,
  worst,
  mildest,
});

// seven weeks, oldest first like the chart passes them
const sevenWeeks = [
  week('2026-01-05', 1),
  week('2026-01-12', 2),
  week('2026-01-19', 3),
  week('2026-01-26', 4),
  week('2026-02-02', 5),
  week('2026-02-09', 6),
  week('2026-02-16', 7),
];

const setup = async (props: Partial<React.ComponentProps<typeof PainSummaryTable>> = {}) =>
  render(
    <PainSummaryTable
      weeks={[week('2026-01-05', 4, 7, 1)]}
      stats={{ average: 4, worst: 7, mildest: 1 }}
      periodLabel="All time"
      formatDate={(iso) => iso}
      {...props}
    />
  );

describe('PainSummaryTable', () => {
  test('shows the header, the overall row and a row for the week', async () => {
    const { getByText, getAllByText } = await setup({
      stats: { average: 3.5, worst: 9, mildest: 1 },
      weeks: [week('2026-01-05', 4, 7, 2)],
    });
    for (const heading of ['Week', 'Average', 'Worst', 'Mildest', 'Overall']) {
      expect(getByText(heading)).toBeTruthy();
    }
    expect(getByText('3.5')).toBeTruthy(); // overall average
    expect(getByText('9')).toBeTruthy(); // overall worst
    expect(getByText('2026-01-05')).toBeTruthy(); // the week, formatted with the formatDate it was given
    expect(getAllByText('4')).toHaveLength(1); // the week's average
  });

  test('missing values show as a dash', async () => {
    const { getAllByText } = await setup({
      stats: { average: null, worst: null, mildest: null },
      weeks: [week('2026-01-05', 4, null, null)],
    });
    expect(getAllByText('–')).toHaveLength(5); // 3 in the overall row, 2 in the week row
  });

  test('weeks are listed newest first', async () => {
    const { getAllByText } = await setup({ weeks: sevenWeeks, collapsedRows: 7 });
    const dates = getAllByText(/^2026-/).map((n) => n.props.children);
    expect(dates).toEqual([
      '2026-02-16',
      '2026-02-09',
      '2026-02-02',
      '2026-01-26',
      '2026-01-19',
      '2026-01-12',
      '2026-01-05',
    ]);
  });

  test('a long history shows only the newest five weeks until "Show all" is pressed', async () => {
    const { getAllByText, getByText, queryByText } = await setup({ weeks: sevenWeeks });
    expect(getAllByText(/^2026-/)).toHaveLength(5);
    expect(queryByText('2026-01-05')).toBeNull(); // oldest is hidden

    await fireEvent.press(getByText('Show all 7 weeks'));
    expect(getAllByText(/^2026-/)).toHaveLength(7);
    expect(getByText('2026-01-05')).toBeTruthy();

    await fireEvent.press(getByText('Show fewer'));
    expect(getAllByText(/^2026-/)).toHaveLength(5);
  });

  test('no toggle when every week already fits', async () => {
    const { queryByText } = await setup({ weeks: sevenWeeks.slice(0, 5) });
    expect(queryByText(/Show all/)).toBeNull();
  });

  test('the number of collapsed rows can be changed', async () => {
    const { getAllByText } = await setup({ weeks: sevenWeeks, collapsedRows: 2 });
    expect(getAllByText(/^2026-/)).toHaveLength(2);
  });
});
