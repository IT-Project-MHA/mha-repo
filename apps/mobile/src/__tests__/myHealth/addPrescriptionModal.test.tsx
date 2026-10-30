/** Component tests for AddPrescriptionModal (used for both adding and editing).
 * 
 * Test plan: Prescriptions (add, edit), Medication (saved and editable).
 * 
 * Tests cover:
 *
 *  Display:
 *    - shows the title and submit label it is given
 *    - "Stopped on" only appears when editing
 *  Adding:
 *    - cannot be submitted until name, dosage, frequency and its unit are filled
 *    - a strength needs a unit before it can be submitted
 *    - trims the values and leaves out empty fields
 *  Editing:
 *    - opens with the saved values
 *    - keeps empty fields so cleared ones are cleared
 *  Closing:
 *    - the form is cleared when the modal is reopened
 *    - Go Back calls onCancel without saving
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import AddPrescriptionModal, { type PrescriptionDetails } from '../../../components/atomicUI/AddPrescriptionModal';

// ----- Mocks -----
jest.mock('@/api/django-API', () => ({
  apiStrengthUnit: () => Promise.resolve([{ value: 'mg', label: 'mg' }]),
  apiFrequencyUnit: () =>
    Promise.resolve([
      { value: 'hour', label: 'hour(s)' },
      { value: 'day', label: 'day(s)' },
    ]),
  apiFormUnit: () => Promise.resolve([{ value: 'tablet', label: 'Tablet(s)' }]),
}));
jest.mock('../../../context/ThemeContext', () => ({
  useTheme: () => ({
    theme: new Proxy({}, { get: (_t, k) => (k === 'then' ? undefined : {}) }),
    colours: new Proxy({}, { get: (_t, k) => (k === 'then' ? undefined : '#000') }),
  }),
}));
jest.mock('@react-native-community/datetimepicker', () => ({ __esModule: true, default: () => null }));

// ----- Test data -----
const editing: PrescriptionDetails = {
  name: 'Panadol',
  dosage: '2',
  frequency: '6',
  frequency_unit: 'hour',
  strength: '500',
  strength_unit: 'mg',
  form: 'tablet',
  started_on: '2026-01-05',
  stopped_on: '',
  notes: '',
};

const setup = async (props: Partial<React.ComponentProps<typeof AddPrescriptionModal>> = {}) => {
  const onConfirm = jest.fn();
  const onCancel = jest.fn();
  const utils = await render(
    <AddPrescriptionModal
      visible
      title="Add Prescription"
      submitLabel="Save Prescription"
      onConfirm={onConfirm}
      onCancel={onCancel}
      {...props}
    />
  );
  return { onConfirm, onCancel, ...utils };
};
type Setup = Awaited<ReturnType<typeof setup>>;

// fills the three required fields plus the frequency unit
const fillRequired = async (u: Setup) => {
  await fireEvent.changeText(u.getByPlaceholderText('Name'), '  Ibuprofen ');
  await fireEvent.changeText(u.getByPlaceholderText('Dosage'), '1');
  await fireEvent.changeText(u.getByPlaceholderText('Frequency'), '8');
  await fireEvent.press(u.getAllByText('Unit ▾')[0]);
  await fireEvent.press(await u.findByText('hour(s)'));
};

describe('AddPrescriptionModal', () => {
  test('shows the title and submit label it is given', async () => {
    const { getByText } = await setup({ title: 'Edit Prescription', submitLabel: 'Save Changes' });
    expect(getByText('Edit Prescription')).toBeTruthy();
    expect(getByText('Save Changes')).toBeTruthy();
  });

  test('cannot be submitted until name, dosage, frequency and its unit are filled', async () => {
    const { getByText, getByPlaceholderText, onConfirm } = await setup();
    await fireEvent.press(getByText('Save Prescription'));
    await fireEvent.changeText(getByPlaceholderText('Name'), 'Ibuprofen');
    await fireEvent.press(getByText('Save Prescription'));
    expect(onConfirm).not.toHaveBeenCalled();
  });

  test('adding trims the values and leaves out empty fields', async () => {
    const u = await setup();
    await fillRequired(u);
    await fireEvent.press(u.getByText('Save Prescription'));
    expect(u.onConfirm).toHaveBeenCalledWith({
      name: 'Ibuprofen',
      dosage: '1',
      frequency: '8',
      frequency_unit: 'hour',
    });
  });

  test('a strength needs a unit before it can be submitted', async () => {
    const u = await setup();
    await fillRequired(u);
    await fireEvent.changeText(u.getByPlaceholderText('Strength'), '500');
    await fireEvent.press(u.getByText('Save Prescription'));
    expect(u.onConfirm).not.toHaveBeenCalled();

    await fireEvent.press(u.getByText('Unit ▾')); // only the strength unit is left unchosen
    await fireEvent.press(await u.findByText('mg'));
    await fireEvent.press(u.getByText('Save Prescription'));
    expect(u.onConfirm).toHaveBeenCalledWith(
      expect.objectContaining({ strength: '500', strength_unit: 'mg' })
    );
  });

  test('editing opens with the saved values and keeps empty fields so cleared ones are cleared', async () => {
    const u = await setup({ initialValues: editing, title: 'Edit Prescription', submitLabel: 'Save Changes' });
    expect(u.getByDisplayValue('Panadol')).toBeTruthy();
    await fireEvent.changeText(u.getByPlaceholderText('Name'), 'Panadol Osteo');
    await fireEvent.press(u.getByText('Save Changes'));
    expect(u.onConfirm).toHaveBeenCalledWith({ ...editing, name: 'Panadol Osteo' });
  });

  test('"Stopped on" only appears when editing', async () => {
    const adding = await setup();
    expect(adding.queryByText('Stopped on')).toBeNull();
    const edit = await setup({ initialValues: editing });
    expect(edit.getByText('Stopped on')).toBeTruthy();
  });

  test('the form is cleared when the modal is reopened', async () => {
    const u = await setup();
    await fireEvent.changeText(u.getByPlaceholderText('Name'), 'Half typed');
    const props = {
      title: 'Add Prescription',
      submitLabel: 'Save Prescription',
      onConfirm: u.onConfirm,
      onCancel: u.onCancel,
    };
    await u.rerender(<AddPrescriptionModal visible={false} {...props} />);
    await u.rerender(<AddPrescriptionModal visible {...props} />);
    await waitFor(() => expect(u.queryByDisplayValue('Half typed')).toBeNull());
  });

  test('Go Back calls onCancel without saving', async () => {
    const { getByText, onConfirm, onCancel } = await setup();
    await fireEvent.press(getByText('Go Back'));
    expect(onCancel).toHaveBeenCalled();
    expect(onConfirm).not.toHaveBeenCalled();
  });
});
