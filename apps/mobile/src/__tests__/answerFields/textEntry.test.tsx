/** Component tests for TextEntry.
 * Tests cover:
 *    - text is trimmed and submitted
 *    - empty text is an error unless the question is optional
 *    - typing past the limit is cut off and shows a message
 *    - a saved initialValue is shown
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';

jest.mock('@/api/django-API', () => ({}));
import { TextEntry } from '../../../components/answerFields/TextEntry';

test('text is trimmed and submitted', async () => {
  const onSubmit = jest.fn();
  await render(<TextEntry onSubmit={onSubmit} placeholder="Notes" />);
  await fireEvent.changeText(screen.getByPlaceholderText('Notes'), '  placeholder text ');
  await fireEvent.press(screen.getByText('Continue'));
  expect(onSubmit).toHaveBeenCalledWith('placeholder text');
});

test('empty text is an error unless the question is optional', async () => {
  const onSubmit = jest.fn();
  const { rerender } = await render(<TextEntry onSubmit={onSubmit} />);
  await fireEvent.press(screen.getByText('Continue'));
  expect(screen.getByText('Empty entry, please enter some text')).toBeTruthy();
  expect(onSubmit).not.toHaveBeenCalled();

  await rerender(<TextEntry onSubmit={onSubmit} optional />);
  await fireEvent.press(screen.getByText('Continue'));
  expect(onSubmit).toHaveBeenCalledWith('');
});

test('typing past the limit is cut off and shows a message', async () => {
  await render(<TextEntry onSubmit={jest.fn()} placeholder="Notes" maxLength={5} />);
  await fireEvent.changeText(screen.getByPlaceholderText('Notes'), 'abcdefgh');
  expect(screen.getByText('Enter no more than 5 characters')).toBeTruthy();
  expect(screen.getByText('5/5')).toBeTruthy();
});

test('a saved initialValue is shown', async () => {
  await render(<TextEntry onSubmit={jest.fn()} initialValue="saved" />);
  expect(screen.getByDisplayValue('saved')).toBeTruthy();
});
