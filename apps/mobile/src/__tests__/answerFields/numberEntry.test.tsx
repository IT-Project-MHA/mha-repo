/** Component tests for NumberEntry.
 * Tests cover:
 *    - a valid number is submitted as text
 *    - anything that is not a digit is removed
 *    - an empty or too high number shows the range and does not submit
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';

jest.mock('@/api/django-API', () => ({}));
import { NumberEntry } from '../../../components/answerFields/NumberEntry';

test('a valid number is submitted as text', async () => {
  const onSubmit = jest.fn();
  await render(<NumberEntry onSubmit={onSubmit} UPPER_BOUND={168} />);
  await fireEvent.changeText(screen.getByPlaceholderText('input number only'), '42');
  await fireEvent.press(screen.getByText('Continue'));
  expect(onSubmit).toHaveBeenCalledWith('42');
});

test('anything that is not a digit is removed', async () => {
  const onSubmit = jest.fn();
  await render(<NumberEntry onSubmit={onSubmit} />);
  await fireEvent.changeText(screen.getByPlaceholderText('input number only'), '1a');
  await fireEvent.press(screen.getByText('Continue'));
  expect(onSubmit).toHaveBeenCalledWith('1');
});

test('an empty or too high number shows the range and does not submit', async () => {
  const onSubmit = jest.fn();
  await render(<NumberEntry onSubmit={onSubmit} UPPER_BOUND={24} />);
  await fireEvent.press(screen.getByText('Continue'));
  expect(screen.getByText('Enter a number between 0-24')).toBeTruthy();
  await fireEvent.changeText(screen.getByPlaceholderText('input number only'), '99');
  await fireEvent.press(screen.getByText('Continue'));
  expect(onSubmit).not.toHaveBeenCalled();
});
