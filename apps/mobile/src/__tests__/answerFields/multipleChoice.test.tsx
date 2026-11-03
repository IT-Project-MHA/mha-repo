/** Component tests for MultipleChoice.
 * Tests cover:
 *    - renders every option, with none selected at the start
 *    - Continue without a selection shows an error and does not submit
 *    - Continue submits the selected option
 *    - a saved initialValue starts selected
 *    - the "Scroll down" hint only shows for 6 or more options
 *    - the exercise examples only show when exercise is on
 */
import React from 'react';
import { render } from '@testing-library/react-native';
import { press, expectText, expectNoText } from '../../helpers/testHelpers';

jest.mock('@/api/django-API', () => ({}));
import { MultipleChoice } from '../../../components/answerFields/MultipleChoice';

const OPTIONS = ['o1', 'o2', 'o3'];
const SIX_OPTIONS = ['a', 'b', 'c', 'd', 'e', 'f'];

test('renders every option and nothing is selected at the start', async () => {
  const onSubmit = jest.fn();
  await render(<MultipleChoice questionOptions={OPTIONS} onSubmit={onSubmit} />);
  OPTIONS.forEach((option) => expectText(option));
  await press('Continue');
  expectText('Please select 1 option');
  expect(onSubmit).not.toHaveBeenCalled();
});

test('Continue submits the selected option', async () => {
  const onSubmit = jest.fn();
  await render(<MultipleChoice questionOptions={OPTIONS} onSubmit={onSubmit} />);
  await press('o1');
  await press('Continue');
  expect(onSubmit).toHaveBeenCalledWith('o1');
});

test('a saved initialValue starts selected', async () => {
  const onSubmit = jest.fn();
  await render(<MultipleChoice questionOptions={OPTIONS} onSubmit={onSubmit} initialValue="o2" />);
  await press('Continue');
  expect(onSubmit).toHaveBeenCalledWith('o2');
});

test('the scroll hint only shows for 6 or more options', async () => {
  const { rerender } = await render(<MultipleChoice questionOptions={OPTIONS} onSubmit={jest.fn()} />);
  expectNoText('Scroll down for more options');
  await rerender(<MultipleChoice questionOptions={SIX_OPTIONS} onSubmit={jest.fn()} />);
  expectText('Scroll down for more options');
});

test('exercise examples only show when exercise is on', async () => {
  const { rerender } = await render(<MultipleChoice questionOptions={OPTIONS} onSubmit={jest.fn()} />);
  expectNoText(/Examples: walking/);
  await rerender(<MultipleChoice questionOptions={OPTIONS} onSubmit={jest.fn()} exercise />);
  expectText(/Examples: walking/);
});
