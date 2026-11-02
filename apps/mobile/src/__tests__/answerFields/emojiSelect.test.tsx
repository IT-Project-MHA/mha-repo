/** Component tests for EmojiSelect.
 * Tests cover:
 *    - Continue without a selection shows an error and does not submit
 *    - choosing an emoji shows its text and Continue submits it
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';

jest.mock('@/api/django-API', () => ({}));
import { EmojiSelect } from '../../../components/answerFields/EmojiSelect';

const OPTIONS = ['option 1', 'option 2', 'option 3'];

test('Continue without a selection shows an error', async () => {
  const onSubmit = jest.fn();
  await render(<EmojiSelect questionOptions={OPTIONS} onSubmit={onSubmit} />);
  await fireEvent.press(screen.getByText('Continue'));
  expect(screen.getByText('Please choose an emoji')).toBeTruthy();
  expect(onSubmit).not.toHaveBeenCalled();
});

test('choosing an emoji shows its text and Continue submits it', async () => {
  const onSubmit = jest.fn();
  await render(<EmojiSelect questionOptions={OPTIONS} onSubmit={onSubmit} />);
  await fireEvent.press(screen.getByLabelText('option 2'));
  expect(screen.getByText('option 2')).toBeTruthy();
  await fireEvent.press(screen.getByText('Continue'));
  expect(onSubmit).toHaveBeenCalledWith('option 2');
});
