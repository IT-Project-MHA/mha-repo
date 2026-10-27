// Component tests for PeopleModal.

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import PeopleModal from '@/components/atomicUI/PeopleModal';

jest.mock('@/context/ThemeContext', () => ({
  useTheme: () => ({
    theme: new Proxy({}, { get: () => ({}) }),
   colours: { onSurface: 'pink', primary: 'blue', surface: 'red' },
  }),
}));
jest.mock('@/api/django-API', () => ({}));

const noPerms = { viewAppointments: false, viewAssessments: false, viewPrescriptions: false };

const setup = async (props: Partial<React.ComponentProps<typeof PeopleModal>> = {}) => {
  const onChange = props.onChange ?? jest.fn().mockResolvedValue(undefined);
  const onRemove = props.onRemove ?? jest.fn().mockResolvedValue(undefined);
  const onCancel = props.onCancel ?? jest.fn();
  const utils = await render(
    <PeopleModal
      visible
      name="Jess"
      role="Support Person"
      phone=""
      permissions={noPerms}
      {...props}
      onChange={onChange}
      onRemove={onRemove}
      onCancel={onCancel}
    />
  );
  return { onChange, onRemove, onCancel, ...utils };
};

describe('PeopleModal', () => {
  test('ticking a permission sends all three permissions with that one switched on', async () => {
    const { getByText, onChange } = await setup();
    await fireEvent.press(getByText('View my assessments'));
    await waitFor(() => expect(onChange).toHaveBeenCalledWith({ ...noPerms, viewAssessments: true }));
  });

  test('confirming Remove Support Person calls onRemove', async () => {
    const { getByText, onRemove } = await setup();
    await fireEvent.press(getByText('Remove Support Person'));
    await fireEvent.press(getByText('Remove')); // confirm
    await waitFor(() => expect(onRemove).toHaveBeenCalled());
  });
});

 test('for someone the user supports, permissions are shown but cannot be changed', async () => {
    const { getByText, queryByText, onChange } = await setup({
      role: 'Im Supporting',
      permissions: { ...noPerms, viewAssessments: true },
    });
    expect(getByText(/✓ View their assessments/)).toBeTruthy();
    expect(getByText(/✗ View their appointments/)).toBeTruthy();
    expect(queryByText('View my assessments')).toBeNull(); // no checkboxes
    await fireEvent.press(getByText(/View their assessments/));
    expect(onChange).not.toHaveBeenCalled();
  });