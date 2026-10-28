/** Component tests for ViewPrescriptionModal (read-only details, edit and remove).
 * 
 * Test plan: Prescriptions (view, edit or delete, still shows past history).
 * 
 * Tests cover:
 *
 *  Details:
 *    - shows the details, tidying numbers and using the unit labels from the API
 *    - rows with no value are hidden
 *    - "Stopped on" shows for a stopped prescription
 * 
 *  Buttons:
 *    - Edit Prescription and Close call their handlers
 * 
 *  Removing:
 *    - asks for confirmation first, and only deletes once confirmed
 *    - cancelling the confirmation does not delete
 *    - an active prescription is told it can be marked as stopped instead
 *    
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import ViewPrescriptionModal from '../../../components/atomicUI/ViewPrescriptionModal';

// ----- Mocks -----
jest.mock('@/api/django-API', () => ({
  apiStrengthUnit: () => Promise.resolve([{ value: 'mg', label: 'mg' }]),
  apiFrequencyUnit: () => Promise.resolve([{ value: 'hour', label: 'hour(s)' }]),
  apiFormUnit: () => Promise.resolve([{ value: 'tablet', label: 'Tablet(s)' }]),
}));
jest.mock('../../../context/ThemeContext', () => ({
  useTheme: () => ({
    theme: new Proxy({}, { get: (_t, k) => (k === 'then' ? undefined : {}) }),
    colours: new Proxy({}, { get: (_t, k) => (k === 'then' ? undefined : '#000') }),
  }),
}));

// ----- Test data -----
const full = {
  id: 'p1',
  name: 'Panadol',
  strength: '200.000',
  strength_unit: 'mg',
  dosage: '2.000',
  form: 'tablet',
  frequency: '6',
  frequency_unit: 'hour',
  started_on: '2026-01-05',
  stopped_on: null,
  notes: 'Take after food',
};

const setup = async (prescription: any = full) => {
  const onEdit = jest.fn();
  const onDelete = jest.fn();
  const onClose = jest.fn();
  const utils = await render(
    <ViewPrescriptionModal visible prescription={prescription} onEdit={onEdit} onDelete={onDelete} onClose={onClose} />
  );
  return { onEdit, onDelete, onClose, ...utils };
};

describe('ViewPrescriptionModal', () => {
  test('shows the details, tidying numbers and using the unit labels from the API', async () => {
    const { getByText, findByText } = await setup();
    expect(getByText('Panadol')).toBeTruthy();
    expect(await findByText('200 mg')).toBeTruthy();
    expect(await findByText('2 Tablet(s)')).toBeTruthy();
    expect(await findByText('6 hour(s)')).toBeTruthy();
    expect(getByText(/5\s+Jan\s+2026/)).toBeTruthy();
    expect(getByText('Take after food')).toBeTruthy();
  });

  test('rows with no value are hidden', async () => {
    const { queryByText } = await setup({ id: 'p2', name: 'Vitamin D', started_on: null, notes: '' });
    for (const label of ['Strength', 'Dosage', 'Frequency', 'Started on', 'Stopped on', 'Notes']) {
      expect(queryByText(label)).toBeNull();
    }
  });

  test('"Stopped on" shows for a stopped prescription', async () => {
    const { getByText } = await setup({ ...full, stopped_on: '2026-02-01' });
    expect(getByText('Stopped on')).toBeTruthy();
  });

  test('Edit Prescription and Close call their handlers', async () => {
    const { getByText, onEdit, onClose } = await setup();
    await fireEvent.press(getByText('Edit Prescription'));
    await fireEvent.press(getByText('Close'));
    expect(onEdit).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test('removing asks for confirmation first, and only deletes once confirmed', async () => {
    const { getByText, onDelete } = await setup();
    await fireEvent.press(getByText('Remove Prescription'));
    expect(getByText('Remove Panadol?')).toBeTruthy();
    expect(onDelete).not.toHaveBeenCalled();
    await fireEvent.press(getByText('Remove Medication'));
    expect(onDelete).toHaveBeenCalledTimes(1);
  });

  test('cancelling the confirmation does not delete', async () => {
    const { getByText, queryByText, onDelete } = await setup();
    await fireEvent.press(getByText('Remove Prescription'));
    await fireEvent.press(getByText('Cancel'));
    expect(onDelete).not.toHaveBeenCalled();
    expect(queryByText('Remove Panadol?')).toBeNull();
  });

  test('an active prescription is told it can be marked as stopped instead', async () => {
    const { getByText } = await setup();
    await fireEvent.press(getByText('Remove Prescription'));
    expect(getByText(/To keep it in your records/)).toBeTruthy();
  });

});
