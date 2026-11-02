/** Component tests for Question.
 * Tests cover:
 *    - shows the section, title, detail, progress and error
 *    - an unknown question type throws
 *    - a text answer is passed to onSubmit as it is
 *    - a multiselect answer is passed as {selected, other}
 *    - a saved initialAnswer is shown
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';

jest.mock('@/api/django-API', () => ({}));
jest.mock('react-native-safe-area-context', () => require('react-native-safe-area-context/jest/mock').default);
import { Question } from '../../../components/baseComponents/Question';

const BASE = { section: 'Placeholder section', title: 'Placeholder title', detail: 'Placeholder detail' };

test('shows the section, title, detail, progress and error', async () => {
  await render(
    <Question {...BASE} questionType="TextEntry" progress="Progress: 1/4" error="Placeholder error" />,
  );
  expect(screen.getByText('Placeholder section')).toBeTruthy();
  expect(screen.getByText('Placeholder title')).toBeTruthy();
  expect(screen.getByText('Placeholder detail')).toBeTruthy();
  expect(screen.getByText('Progress: 1/4')).toBeTruthy();
  expect(screen.getByText('Placeholder error')).toBeTruthy();
});

test('an unknown question type throws', async () => {
  const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
  await expect(render(<Question {...BASE} questionType={'none' as any} />)).rejects.toThrow(
    'none is not a valid question type',
  );
  consoleError.mockRestore();
});

test('a text answer is passed to onSubmit as it is', async () => {
  const onSubmit = jest.fn();
  await render(<Question {...BASE} questionType="TextEntry" placeholder="Placeholder notes" onSubmit={onSubmit} />);
  await fireEvent.changeText(screen.getByPlaceholderText('Placeholder notes'), 'Placeholder answer');
  await fireEvent.press(screen.getByText('Continue'));
  expect(onSubmit).toHaveBeenCalledWith('Placeholder answer');
});

test('a multiselect answer is passed as {selected, other}', async () => {
  const onSubmit = jest.fn();
  await render(
    <Question {...BASE} questionType="MultiSelect" questionOptions={['Option 1', 'Option 2']} MIN_SELECTIONS={1}
      onSubmit={onSubmit} />,
  );
  await fireEvent.press(screen.getByLabelText('Option 2'));
  await fireEvent.press(screen.getByText('Continue'));
  expect(onSubmit).toHaveBeenCalledWith({ selected: ['Option 2'], other: '' });
});

test('a saved initialAnswer is shown', async () => {
  await render(<Question {...BASE} questionType="TextEntry" initialAnswer="Saved placeholder" />);
  expect(screen.getByDisplayValue('Saved placeholder')).toBeTruthy();
});
