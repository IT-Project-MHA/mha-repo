// Screen tests for the My Account page.

import { Alert } from 'react-native';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import Screen from '@/app/(tabs)/settings/myAccount';

import { UserType } from '../../../constants/userType';
import {
  apiMyAccount,
  apiSaveAboutMe,
  apiSaveConditions,
  apiDeleteMyAccount,
} from '@/api/settings_api_helpers';

// ----- Mocks -----
jest.mock('@/context/ThemeContext', () => ({
  useTheme: () => ({
    theme: new Proxy({}, { get: () => ({}) }),
    colours: { onSurface: 'pink', primary: 'blue', surface: 'red' },
  }),
}));

// Lets each test choose what kind of user is logged in.
const mockSetUserType = jest.fn();
let mockUserState = { isSupport: false, isPatient: true };
jest.mock('@/context/AuthorisationContext', () => ({
  useUser: () => ({ setUserType: mockSetUserType, ...mockUserState }),
}));

// Keep the real validation + error helpers (the modals use them), fake only the API calls.
jest.mock('@/api/django-API', () => ({}));
jest.mock('@/api/settings_api_helpers', () => ({
  ...jest.requireActual('@/api/settings_api_helpers'),
  apiMyAccount: jest.fn(),
  apiSaveAboutMe: jest.fn(),
  apiSaveConditions: jest.fn(),
  apiDeleteMyAccount: jest.fn(),
}));

const mockMyAccount = apiMyAccount as jest.Mock;
const mockSaveAboutMe = apiSaveAboutMe as jest.Mock;
const mockSaveConditions = apiSaveConditions as jest.Mock;
const mockDeleteMyAccount = apiDeleteMyAccount as jest.Mock;

// ----- Test data -----
const sexOptions = [{ value: 'female', label: 'Female' }];
const account = {
  user: { id: 'user-1', display_name: 'Jane Doe', phone_number: '0412345678', email: 'jane@example.com' },
  profile: {
    id: 'profile-1',
    assigned_gender_at_birth: 'female',
    birth_year: 2002,
    has_diagnosis: true,
    other_conditions: 'Arthritis',
  },
  sexOptions,
};
const emptyAccount = {
  user: { ...account.user, email: null },
  profile: null,
  sexOptions,
};

beforeEach(() => {
  jest.clearAllMocks();
  mockUserState = { isSupport: false, isPatient: true };
  mockMyAccount.mockResolvedValue(account);
});

describe('loading', () => {
  test('shows the saved details once loaded', async () => {
    const { findByText, getByText } = await render(<Screen />);
    expect(await findByText('Jane Doe')).toBeTruthy();
    expect(getByText('Female')).toBeTruthy();
    expect(getByText('2002')).toBeTruthy();
    expect(getByText('0412345678')).toBeTruthy();
    expect(getByText('jane@example.com')).toBeTruthy();
    expect(getByText('Yes')).toBeTruthy();
    expect(getByText('Arthritis')).toBeTruthy();
  });

  test('shows placeholders when the user has no profile or email yet', async () => {
    mockMyAccount.mockResolvedValue(emptyAccount);
    const { findByText, getByText, getAllByText, queryByText } = await render(<Screen />);
    expect(await findByText('Jane Doe')).toBeTruthy();
    expect(getByText('Birth year not set')).toBeTruthy();
    expect(getByText('No email')).toBeTruthy();
    expect(getAllByText('Not set')).toHaveLength(2); // sex and diagnosis
    expect(queryByText('Other Conditions')).toBeNull();
  });

  test('a failed load shows an error, and Try again loads the details', async () => {
    mockMyAccount.mockRejectedValueOnce(new Error('Network request failed'));
    const { findByText } = await render(<Screen />);
    expect(await findByText("Couldn't load your account. Check your connection and try again.")).toBeTruthy();
    await fireEvent.press(await findByText('Try again'));
    expect(await findByText('Jane Doe')).toBeTruthy();
  });
});

describe('editing', () => {
  test('saving About Me updates the screen and closes the modal', async () => {
    mockSaveAboutMe.mockResolvedValue({
      user: { ...account.user, display_name: 'Janet Doe' },
      profile: account.profile,
    });
    const { findByText, getAllByText, getByPlaceholderText, getByText, queryByText } = await render(<Screen />);
    await findByText('Jane Doe');

    await fireEvent.press(getAllByText('Edit Details')[0]);
    await fireEvent.changeText(getByPlaceholderText('Name'), 'Janet Doe');
    await fireEvent.press(getByText('Save Changes'));

    expect(await findByText('Janet Doe')).toBeTruthy();
    expect(mockSaveAboutMe).toHaveBeenCalledWith(
      'user-1',
      'profile-1',
      expect.objectContaining({ name: 'Janet Doe' })
    );
    await waitFor(() => expect(queryByText('Edit My Details')).toBeNull());
  });

  test('a rejected About Me save shows the error and keeps the old details', async () => {
    mockSaveAboutMe.mockRejectedValue({ data: { phone_number: ['That number is already in use.'] } });
    const { findByText, getAllByText, getByPlaceholderText, getByText } = await render(<Screen />);
    await findByText('Jane Doe');

    await fireEvent.press(getAllByText('Edit Details')[0]);
    await fireEvent.changeText(getByPlaceholderText('Phone Number'), '0499999999');
    await fireEvent.press(getByText('Save Changes'));

    expect(await findByText('That number is already in use.')).toBeTruthy();
    expect(getByText('Edit My Details')).toBeTruthy(); // modal still open
    expect(getByText('0412345678')).toBeTruthy(); // screen still shows the saved number
  });

  test('saving My Conditions updates the screen', async () => {
    mockSaveConditions.mockResolvedValue({ ...account.profile, has_diagnosis: false });
    const { findByText, getAllByText, getByText } = await render(<Screen />);
    await findByText('Jane Doe');

    await fireEvent.press(getAllByText('Edit Details')[1]);
    await fireEvent.press(getByText('No'));
    await fireEvent.press(getByText('Save Changes'));

    await waitFor(() =>
      expect(mockSaveConditions).toHaveBeenCalledWith('profile-1', {
        hasDiagnosis: false,
        otherConditions: 'Arthritis',
      })
    );
    expect(await findByText('No')).toBeTruthy();
  });

  test('a support-only user who records a diagnosis becomes a "both" account', async () => {
    // NOTE: this fails until handleSaveConditions calls upgradeIfHasCondition(profile).
    mockUserState = { isSupport: true, isPatient: false };
    mockMyAccount.mockResolvedValue(emptyAccount);
    mockSaveConditions.mockResolvedValue({
      id: 'profile-1',
      assigned_gender_at_birth: null,
      birth_year: null,
      has_diagnosis: true,
      other_conditions: '',
    });
    const { findByText, getAllByText, getByText } = await render(<Screen />);
    await findByText('Jane Doe');

    await fireEvent.press(getAllByText('Edit Details')[1]);
    await fireEvent.press(getByText('Yes'));
    await fireEvent.press(getByText('Save Changes'));

    await waitFor(() => expect(mockSetUserType).toHaveBeenCalledWith(UserType.both));
  });
});

describe('logging out', () => {
  test('confirming logs the user out', async () => {
    const { findByText, getByText } = await render(<Screen />);
    await findByText('Jane Doe');
    await fireEvent.press(getByText('Log Out'));
    await fireEvent.press(getByText('Log out')); // the confirm button
    await waitFor(() => expect(mockSetUserType).toHaveBeenCalledWith(UserType.undefined));
  });

  test('going back does not log out', async () => {
    const { findByText, getByText, queryByText } = await render(<Screen />);
    await findByText('Jane Doe');
    await fireEvent.press(getByText('Log Out'));
    await fireEvent.press(getByText('go back'));
    expect(mockSetUserType).not.toHaveBeenCalled();
    await waitFor(() => expect(queryByText('Are you sure you want to log out?')).toBeNull());
  });
});

describe('deleting the account', () => {
  test('confirming deletes the account and logs the user out', async () => {
    mockDeleteMyAccount.mockResolvedValue(undefined);
    const { findByText, getByText } = await render(<Screen />);
    await findByText('Jane Doe');
    await fireEvent.press(getByText('Delete my account'));
    await fireEvent.press(getByText('Delete')); // the confirm button
    await waitFor(() => expect(mockDeleteMyAccount).toHaveBeenCalled());
    await waitFor(() => expect(mockSetUserType).toHaveBeenCalledWith(UserType.undefined));
  });

  test('going back does not delete anything', async () => {
    const { findByText, getByText } = await render(<Screen />);
    await findByText('Jane Doe');
    await fireEvent.press(getByText('Delete my account'));
    await fireEvent.press(getByText('go back'));
    expect(mockDeleteMyAccount).not.toHaveBeenCalled();
    expect(mockSetUserType).not.toHaveBeenCalled();
  });

  test('a failed delete shows an alert and does not log the user out', async () => {
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    mockDeleteMyAccount.mockRejectedValue(new Error('Network request failed'));
    const { findByText, getByText } = await render(<Screen />);
    await findByText('Jane Doe');
    await fireEvent.press(getByText('Delete my account'));
    await fireEvent.press(getByText('Delete'));
    await waitFor(() => expect(alertSpy).toHaveBeenCalledWith('Could not delete account', 'Please try again.'));
    expect(mockSetUserType).not.toHaveBeenCalled();
    alertSpy.mockRestore();
  });
});
