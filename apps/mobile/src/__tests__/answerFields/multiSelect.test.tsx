/** Component tests for MultiSelect
 * Tests cover:
 *    - several options can be ticked and are submitted together
 *    - fewer than the minimum selections shows an error and does not submit
 *    - zero minimum selections lets Continue through with nothing ticked
 *    - Other opens a text box, which must be filled in, and is submitted with the selection
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { press, pressLabel, expectText } from '../../helpers/testHelpers';

jest.mock('@/api/django-API', () => ({}));
import { MultiSelect } from '../../../components/answerFields/MultiSelect';

const OPTIONS = ['o1', 'o2', 'Other'];

const renderSelect = async (props: any = {}) => {
  const onSubmit = jest.fn();
  await render(
    <MultiSelect questionOptions={OPTIONS} onSubmit={onSubmit} headingText="" MIN_SELECTIONS={1}
      MAX_SELECTIONS={OPTIONS.length} {...props} />,
  );
  return onSubmit;
};

test('ticked options are submitted together', async () => {
  const onSubmit = await renderSelect();
  await pressLabel('o1');
  await pressLabel('o2');
  await press('Continue');
  expect(onSubmit).toHaveBeenCalledWith(['o1', 'o2'], '');
});

test('unticking an option removes it', async () => {
  const onSubmit = await renderSelect();
  await pressLabel('o1');
  await pressLabel('o2');
  await pressLabel('o1');
  await press('Continue');
  expect(onSubmit).toHaveBeenCalledWith(['o2'], '');
});

test('too few selections shows an error and does not submit', async () => {
  const onSubmit = await renderSelect();
  await press('Continue');
  expectText('Select at least 1 option');
  expect(onSubmit).not.toHaveBeenCalled();
});

test('a minimum of 0 lets Continue through with nothing ticked', async () => {
  const onSubmit = await renderSelect({ MIN_SELECTIONS: 0 });
  await press('Continue');
  expect(onSubmit).toHaveBeenCalledWith([], '');
});

test('Other needs its details filled in, which are submitted with the selection', async () => {
  const onSubmit = await renderSelect({ otherAttribute: true });
  await pressLabel('Other');
  await press('Continue');
  expectText('Field cannot be empty, uncheck Other instead');
  expect(onSubmit).not.toHaveBeenCalled();

  await fireEvent.changeText(screen.getByPlaceholderText('Enter other details'), ' other field ');
  await press('Continue');
  expect(onSubmit).toHaveBeenCalledWith(['Other'], 'other field');
});

test('medication mode with prescriptions says where the options came from', async () => {
  await renderSelect({ medication: true, MIN_SELECTIONS: 0 });
  expectText('Generated based on your medication scripts');
  expectText('Not taking medications? Just press continue.');
});

test('medication mode with no prescriptions shows related message', async () => {
  await renderSelect({ medication: true, MIN_SELECTIONS: 0, questionOptions: [], MAX_SELECTIONS: 0 });
  expectText(/You don't have any active prescriptions/);
});