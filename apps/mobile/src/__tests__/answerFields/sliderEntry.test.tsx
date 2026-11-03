/** Component tests for SliderEntry.
 * Tests cover:
 *    - starts at 0, shows its description and submits 0
 *    - starts at a saved initialValue
 */
import React from 'react';
import { render } from '@testing-library/react-native';
import { press, expectText } from '../../helpers/testHelpers';

jest.mock('@/api/django-API', () => ({}));
import { SliderEntry } from '../../../components/answerFields/SliderEntry';

test('starts at 0, shows its description and submits 0', async () => {
  const onSubmit = jest.fn();
  await render(<SliderEntry onSubmit={onSubmit} scoreLabel="pain" descriptions={['lowest', 'low']} />);
  expectText('lowest');
  await press('Continue');
  expect(onSubmit).toHaveBeenCalledWith('0');
});

test('starts at a saved initialValue', async () => {
  const onSubmit = jest.fn();
  await render(<SliderEntry onSubmit={onSubmit} initialValue="7" />);
  await press('Continue');
  expect(onSubmit).toHaveBeenCalledWith('7');
});
