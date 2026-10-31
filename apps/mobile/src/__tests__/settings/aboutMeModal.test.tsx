/**
 * Component tests for AboutMeModal
 * renders the modal like a user would see it, types into it, presses buttons, and checks what happens.
 * validateAboutMe / apiErrorMessage helpers are used.
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import AboutMeModal, {type UserDetails} from '@/components/atomicUI/AboutMeModal';

// ----- Mocks -----
jest.mock('@/context/ThemeContext', () => ({
  useTheme: () => ({
    theme: new Proxy({}, { get: () => ({}) }),
    colours: { onSurface: 'pink', primary: 'blue', surface: 'red' },
  }),
}));

// stops helper file from loading real Django API code.
jest.mock('@/api/django-API', () => ({}));

// ----- Test data -----
const initial: UserDetails = {
  name: 'Jane Doe',
  sex: 'female',
  birthYear: '2002',
  phone: '0412345678',
  email: 'jane@example.com',
};
const sexOptions = [
  { value: 'female', label: 'Female' },
  { value: 'male', label: 'Male' },
];

const setup = async (props: Partial<React.ComponentProps<typeof AboutMeModal>> = {}) => {
  const onConfirm = props.onConfirm ?? jest.fn().mockResolvedValue(undefined);
  const onCancel = props.onCancel ?? jest.fn();
  const utils = await render(
    <AboutMeModal
      visible
      initialValues={initial}
      sexOptions={sexOptions}
      {...props}
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  );
  return { onConfirm, onCancel, ...utils };
};

describe('AboutMeModal', () => {
  test('opens showing the saved details', async () => {
    const { getByDisplayValue, getByText } = await setup();
    expect(getByDisplayValue('Jane Doe')).toBeTruthy();
    expect(getByDisplayValue('0412345678')).toBeTruthy();
    expect(getByDisplayValue('jane@example.com')).toBeTruthy();
    expect(getByText('Female')).toBeTruthy();
  });

  test('shows nothing when not visible', async () => {
    const { queryByText } = await setup({ visible: false });
    expect(queryByText('Edit My Details')).toBeNull();
  });

  test('saving valid changes sends the edited values to onConfirm', async () => {
    const { getByPlaceholderText, getByText, onConfirm } = await setup();
    await fireEvent.changeText(getByPlaceholderText('Name'), 'Janet Doe');
    await fireEvent.press(getByText('Save Changes'));
    await waitFor(() => expect(onConfirm).toHaveBeenCalledWith({ ...initial, name: 'Janet Doe' }));
  });

  test('a blank name shows a message and does not save', async () => {
    const { getByPlaceholderText, getByText, onConfirm } = await setup();
    await fireEvent.changeText(getByPlaceholderText('Name'), '');
    await fireEvent.press(getByText('Save Changes'));
    expect(getByText('Enter your name.')).toBeTruthy();
    expect(onConfirm).not.toHaveBeenCalled();
  });

  test('an invalid phone number shows a message and does not save', async () => {
    const { getByPlaceholderText, getByText, onConfirm } = await setup();
    await fireEvent.changeText(getByPlaceholderText('Phone Number'), '0212345678');
    await fireEvent.press(getByText('Save Changes'));
    expect(getByText('Enter an Australian mobile number.')).toBeTruthy();
    expect(onConfirm).not.toHaveBeenCalled();
  });

  test('an invalid email shows a message and does not save', async () => {
    const { getByPlaceholderText, getByText, onConfirm } = await setup();
    await fireEvent.changeText(getByPlaceholderText('Email'), 'not-an-email');
    await fireEvent.press(getByText('Save Changes'));
    expect(getByText('Enter a valid email address.')).toBeTruthy();
    expect(onConfirm).not.toHaveBeenCalled();
  });

  test('the sex dropdown lets the user pick another option', async () => {
    const { getByText, onConfirm } = await setup();
    await fireEvent.press(getByText('Female')); // opens the dropdown
    await fireEvent.press(getByText('Male'));
    await fireEvent.press(getByText('Save Changes'));
    await waitFor(() => expect(onConfirm).toHaveBeenCalledWith({ ...initial, sex: 'male' }));
  });

  test('a failed save shows the server message and keeps the modal open', async () => {
    const onConfirm = jest
      .fn()
      .mockRejectedValue({ data: { phone_number: ['That number is already in use.'] } });
    const { getByText, findByText, onCancel } = await setup({ onConfirm });
    await fireEvent.press(getByText('Save Changes'));
    expect(await findByText('That number is already in use.')).toBeTruthy();
    expect(getByText('Edit My Details')).toBeTruthy();
    expect(onCancel).not.toHaveBeenCalled();
  });

  test('a failed save with no server message shows the fallback', async () => {
    const onConfirm = jest.fn().mockRejectedValue(new Error('Network request failed'));
    const { getByText, findByText } = await setup({ onConfirm });
    await fireEvent.press(getByText('Save Changes'));
    expect(await findByText("Couldn't save your changes. Please try again.")).toBeTruthy();
  });

  test('changes that were not saved are discarded when the modal is reopened', async () => {
    const { getByPlaceholderText, getByDisplayValue, rerender, onConfirm, onCancel } = await setup();
    await fireEvent.changeText(getByPlaceholderText('Name'), 'Someone Else');
    const props = { initialValues: initial, sexOptions, onConfirm, onCancel };
    await rerender(<AboutMeModal visible={false} {...props} />);
    await rerender(<AboutMeModal visible {...props} />);
    expect(getByDisplayValue('Jane Doe')).toBeTruthy();
  });

  test('Go Back calls onCancel without saving', async () => {
    const { getByText, onConfirm, onCancel } = await setup();
    await fireEvent.press(getByText('Go Back'));
    expect(onCancel).toHaveBeenCalled();
    expect(onConfirm).not.toHaveBeenCalled();
  });
});
