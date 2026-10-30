/** Screen tests for the My Prescriptions page.
 * Test plan: Prescriptions (add, edit or delete, still shows past history),
 * Medication (saved and editable).
 * Tests cover:
 *
 *  Listing:
 *    - with no prescriptions the user is prompted to add one
 *    - active prescriptions are listed, stopped ones go under inactive, deleted ones are hidden
 *    - past history still shows when every prescription has been stopped
 *  Adding:
 *    - saving creates the prescription, reloads the list and closes the modal
 *    - Go Back closes the add modal without saving
 *    - a failed save tells the user
 *  Viewing and editing:
 *    - tapping a prescription shows its details
 *    - editing saves the changes, reloads the list and closes the modal
 *    - Go Back from editing returns to the details
 *  Removing:
 *    - confirming removes the prescription from the list
 *    - Cancel on the confirmation removes nothing
 *    - a prescription used by check-ins cannot be removed and the user is told to stop it instead
 */

import React from 'react';
import { Alert } from 'react-native';
import { render, fireEvent, waitFor } from '@testing-library/react-native';

import Screen from '../../app/(tabs)/myHealth/prescriptions';


// ----- Mocks -----
const mockApiPrescription = jest.fn();
const mockApiStrengthUnit = jest.fn();
const mockApiFrequencyUnit = jest.fn();
const mockApiFormUnit = jest.fn();
jest.mock('@/api/django-API', () => ({
  apiPrescription: (...args: any[]) => mockApiPrescription(...args),
  apiStrengthUnit: () => mockApiStrengthUnit(),
  apiFrequencyUnit: () => mockApiFrequencyUnit(),
  apiFormUnit: () => mockApiFormUnit(),
}));
jest.mock('../../../context/ThemeContext', () => ({
  useTheme: () => ({
    theme: new Proxy({}, { get: (_t, k) => (k === 'then' ? undefined : {}) }),
    colours: new Proxy({}, { get: (_t, k) => (k === 'then' ? undefined : '#000') }),
  }),
}));
jest.mock('@react-native-community/datetimepicker', () => ({ __esModule: true, default: () => null }));
jest.mock('@react-native-vector-icons/ionicons', () => ({ Ionicons: () => null }));

// ----- Test data -----
const rx = (over: object = {}) => ({
  id: 'p1',
  name: 'Panadol',
  dosage: '2',
  frequency: '6',
  frequency_unit: 'hour',
  strength: '500.000',
  strength_unit: 'mg',
  form: 'tablet',
  started_on: '2026-01-05',
  stopped_on: null,
  notes: '',
  deleted_at: null,
  ...over,
});

let list: any[] = [];

beforeEach(() => {
  jest.clearAllMocks();
  list = [rx()];
  mockApiPrescription.mockImplementation(async (action: string) => (action === 'select' ? list : {}));
  mockApiStrengthUnit.mockResolvedValue([{ value: 'mg', label: 'mg' }]);
  mockApiFrequencyUnit.mockResolvedValue([
    { value: 'hour', label: 'hour(s)' },
    { value: 'day', label: 'day(s)' },
  ]);
  mockApiFormUnit.mockResolvedValue([{ value: 'tablet', label: 'Tablet(s)' }]);
  jest.spyOn(console, 'log').mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
});

const selectCalls = () => mockApiPrescription.mock.calls.filter((c) => c[0] === 'select').length;

// --- Listing ------------------------------------------------------------------

describe('listing', () => {
  test('with no prescriptions the user is prompted to add one', async () => {
    list = [];
    const { getByText } = await render(<Screen />);
    await waitFor(() => expect(mockApiPrescription).toHaveBeenCalledWith('select'));
    expect(getByText('Your prescriptions list is empty.')).toBeTruthy();
    expect(getByText('Add Prescriptions')).toBeTruthy();
  });

  test('active prescriptions are listed, stopped ones go under inactive, deleted ones are hidden', async () => {
    list = [
      rx({ id: 'a', name: 'Panadol' }),
      rx({ id: 'b', name: 'Amoxicillin', stopped_on: '2026-02-01' }),
      rx({ id: 'c', name: 'Removed Drug', deleted_at: '2026-03-01T00:00:00Z' }),
    ];
    const { findByText, getByText, queryByText } = await render(<Screen />);
    expect(await findByText('Panadol')).toBeTruthy();
    expect(getByText('My Inactive Prescriptions')).toBeTruthy();
    expect(getByText('Amoxicillin')).toBeTruthy();
    expect(queryByText('Removed Drug')).toBeNull();
  });

  test('past history still shows when every prescription has been stopped', async () => {
    list = [rx({ name: 'Amoxicillin', stopped_on: '2026-02-01' })];
    const { findByText, getByText } = await render(<Screen />);
    expect(await findByText('Amoxicillin')).toBeTruthy();
    expect(getByText('My Inactive Prescriptions')).toBeTruthy();
  });
});

// --- Adding ----------------------------------------------------------------------

describe('adding', () => {
  const fillAndSave = async (utils: Awaited<ReturnType<typeof render>>) => {
    await fireEvent.press(utils.getByText('Add Prescriptions'));
    await fireEvent.changeText(utils.getByPlaceholderText('Name'), 'Ibuprofen');
    await fireEvent.changeText(utils.getByPlaceholderText('Dosage'), '1');
    await fireEvent.changeText(utils.getByPlaceholderText('Frequency'), '8');
    await fireEvent.press(utils.getAllByText('Unit ▾')[0]); // frequency unit
    await fireEvent.press(await utils.findByText('hour(s)'));
    await fireEvent.press(utils.getByText('Save Prescription'));
  };

  test('saving a new prescription creates it, reloads the list and closes the modal', async () => {
    list = [];
    const utils = await render(<Screen />);
    await waitFor(() => expect(selectCalls()).toBe(1));
    await fillAndSave(utils);

    await waitFor(() =>
      expect(mockApiPrescription).toHaveBeenCalledWith('create', {
        name: 'Ibuprofen',
        dosage: '1',
        frequency: '8',
        frequency_unit: 'hour',
      })
    );
    await waitFor(() => expect(selectCalls()).toBe(2));
    await waitFor(() => expect(utils.queryByText('Save Prescription')).toBeNull());
  });

  test('Go Back closes the add modal without saving', async () => {
    list = [];
    const { getByText, queryByText } = await render(<Screen />);
    await fireEvent.press(getByText('Add Prescriptions'));
    await fireEvent.press(getByText('Go Back'));
    await waitFor(() => expect(queryByText('Save Prescription')).toBeNull());
    expect(mockApiPrescription).not.toHaveBeenCalledWith('create', expect.anything());
  });

  test('a failed save tells the user', async () => {
    // NOTE: fails until handleAddPrescription shows a message (it only console.logs today).
    list = [];
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    mockApiPrescription.mockImplementation(async (action: string) => {
      if (action === 'create') throw Object.assign(new Error('server error'), { status: 500 });
      return list;
    });
    const utils = await render(<Screen />);
    await fillAndSave(utils);
    await waitFor(() => expect(alertSpy).toHaveBeenCalled());
  });
});

// --- View and edit ------------------------------------------------------------

describe('viewing and editing', () => {
  test('tapping a prescription shows its details', async () => {
    const { findByText } = await render(<Screen />);
    await fireEvent.press(await findByText('Panadol'));
    expect(await findByText('500 mg')).toBeTruthy(); // '500.000' tidied up, unit label from the API
    expect(await findByText('2 Tablet(s)')).toBeTruthy();
  });

  test('editing saves the changes, reloads the list and closes the modal', async () => {
    const { findByText, getByDisplayValue, getByText, queryByText } = await render(<Screen />);
    await fireEvent.press(await findByText('Panadol'));
    await fireEvent.press(await findByText('Edit Prescription'));

    await fireEvent.changeText(getByDisplayValue('Panadol'), 'Panadol Osteo');
    await fireEvent.press(getByText('Save Changes'));

    await waitFor(() =>
      expect(mockApiPrescription).toHaveBeenCalledWith(
        'update',
        expect.objectContaining({ id: 'p1', name: 'Panadol Osteo', frequency_unit: 'hour', stopped_on: null })
      )
    );
    await waitFor(() => expect(selectCalls()).toBe(2));
    await waitFor(() => expect(queryByText('Save Changes')).toBeNull());
  });

  test('Go Back from editing returns to the details', async () => {
    const { findByText, getByText } = await render(<Screen />);
    await fireEvent.press(await findByText('Panadol'));
    await fireEvent.press(await findByText('Edit Prescription'));
    await fireEvent.press(getByText('Go Back'));
    expect(await findByText('Close')).toBeTruthy();
    expect(mockApiPrescription).not.toHaveBeenCalledWith('update', expect.anything());
  });
});

// --- Remove -------------------------------------------------------------------

describe('removing', () => {
  test('confirming removes the prescription from the list', async () => {
    mockApiPrescription.mockImplementation(async (action: string) => {
      if (action === 'delete') list = [];
      return action === 'select' ? list : {};
    });
    const { findByText, getByText, queryByText } = await render(<Screen />);
    await fireEvent.press(await findByText('Panadol'));
    await fireEvent.press(await findByText('Remove Prescription'));
    expect(getByText('Remove Panadol?')).toBeTruthy();
    await fireEvent.press(getByText('Remove Medication'));

    await waitFor(() => expect(mockApiPrescription).toHaveBeenCalledWith('delete', { id: 'p1' }));
    await waitFor(() => expect(queryByText('Panadol')).toBeNull());
  });

  test('Cancel on the confirmation removes nothing', async () => {
    const { findByText, getByText } = await render(<Screen />);
    await fireEvent.press(await findByText('Panadol'));
    await fireEvent.press(await findByText('Remove Prescription'));
    await fireEvent.press(getByText('Cancel'));
    expect(mockApiPrescription).not.toHaveBeenCalledWith('delete', expect.anything());
  });

  test('a prescription used by check-ins cannot be removed and the user is told to stop it instead', async () => {
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    mockApiPrescription.mockImplementation(async (action: string) => {
      if (action === 'delete') throw Object.assign(new Error('conflict'), { status: 409 });
      return list;
    });
    const { findByText, getByText } = await render(<Screen />);
    await fireEvent.press(await findByText('Panadol'));
    await fireEvent.press(await findByText('Remove Prescription'));
    await fireEvent.press(getByText('Remove Medication'));

    await waitFor(() =>
      expect(alertSpy).toHaveBeenCalledWith(
        "Can't remove this prescription",
        'It is used in your weekly check-ins. You can mark it as stopped instead.'
      )
    );
    expect(getByText('Close')).toBeTruthy(); // details modal is still open
  });
});
