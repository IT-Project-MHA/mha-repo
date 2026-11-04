// Screen tests for the My Account page.

import { render, fireEvent, waitFor } from '@testing-library/react-native';
import Screen from '@/app/(tabs)/settings/myAccount';

import { UserType } from '../../../constants/userType';
import { apiLogOut, apiChangePin, apiChangePhone } from '@/api/django-API';
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
const mockRefreshUserType = jest.fn();
let mockUserState = { isSupport: false, isPatient: true };

jest.mock('@/context/AuthorisationContext', () => ({
  useUser: () => ({ setUserType: mockSetUserType, refreshUserType: mockRefreshUserType, ...mockUserState }),
  
}));

// Keep the real validation + error helpers (the modals use them), fake only the API calls.
jest.mock('@/api/django-API', () => ({
  apiLogOut: jest.fn(),
  apiLogOutEverywhere: jest.fn(),
  apiChangePhone: jest.fn(),
  apiChangePin: jest.fn(),
  request_code: jest.fn(),
  verify_code: jest.fn(),
  ApiError: class ApiError extends Error {},
}));

  jest.mock('@/components/onboarding/GetDeviceID', () => ({
  __esModule: true,
  default: jest.fn().mockResolvedValue('device-1'),
}));

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
const mockLogOut = apiLogOut as jest.Mock;

// ----- Test data -----
const sexOptions = [{ value: 'female', label: 'Female' }];

const painTypeOptions = [
  { id: 'p1', text: 'Arthritis' },
  { id: 'p2', text: 'Back pain' },
];

const account = {
  user: { id: 'user-1', display_name: 'Jane Doe', phone_number: '0412345678', email: 'jane@example.com' },
  profile: {
    id: 'profile-1',
    assigned_gender_at_birth: 'female',
    birth_year: 2002,
    pain_types: ['p1'],
    other_conditions: 'Gout',
  },
  sexOptions,
  painTypeOptions,
};
const emptyAccount = {
  user: { ...account.user, email: null },
  profile: null,
  sexOptions,
  painTypeOptions,
};

beforeEach(() => {
  jest.clearAllMocks();
  mockUserState = { isSupport: false, isPatient: true };
  mockMyAccount.mockResolvedValue(account);
  mockRefreshUserType.mockResolvedValue(undefined);
  mockLogOut.mockResolvedValue(undefined);
});

describe('loading', () => {
  test('shows the saved details once loaded', async () => {
    const { findByText, getByText } = await render(<Screen />);
    expect(await findByText('Jane Doe')).toBeTruthy();
    expect(getByText('Female')).toBeTruthy();
    expect(getByText('2002')).toBeTruthy();
    expect(getByText('0412345678')).toBeTruthy();
    expect(getByText('Arthritis')).toBeTruthy(); // primary condition
    expect(getByText('Gout')).toBeTruthy(); // other conditions
  });

  test('a support person with no profile sees the prompt, not sex and birth year', async () => {
    mockMyAccount.mockResolvedValue(emptyAccount);
    const { findByText, getByText, queryByText } = await render(<Screen />);
    expect(await findByText('Jane Doe')).toBeTruthy();
    expect(queryByText('Sex:')).toBeNull();
    expect(queryByText('Birth Year:')).toBeNull();
    expect(getByText('Yes, I do')).toBeTruthy();
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
    const { findByText, getAllByText, queryByPlaceholderText, getByPlaceholderText, getByText, queryByText } = await render(<Screen />);
    await findByText('Jane Doe');

      await fireEvent.press(getByText('Edit My Details')); 
    await fireEvent.changeText(getByPlaceholderText('Name'), 'Janet Doe');
    await fireEvent.press(getByText('Save Changes'));

    expect(await findByText('Janet Doe')).toBeTruthy();
    expect(mockSaveAboutMe).toHaveBeenCalledWith(
      'user-1',
      'profile-1',
      expect.objectContaining({ name: 'Janet Doe' })
    );
    await waitFor(() => expect(queryByPlaceholderText('Name')).toBeNull());
  });

  test('a rejected About Me save shows the error and keeps the old details', async () => {
    mockSaveAboutMe.mockRejectedValue({ data: { phone_number: ['That number is already in use.'] } });
    const { findByText, getAllByText, getByPlaceholderText, getByText } = await render(<Screen />);
    await findByText('Jane Doe');

    await fireEvent.press(getByText('Edit My Details'));
    await fireEvent.press(getByText('Save Changes'));

    expect(await findByText('That number is already in use.')).toBeTruthy();
    expect(getByPlaceholderText('Name')).toBeTruthy(); // modal still open
    expect(getByText('Jane Doe')).toBeTruthy(); // screen still shows the saved name
  });

  test('saving My Conditions updates the screen', async () => {
    mockSaveConditions.mockResolvedValue({ ...account.profile, pain_types: ['p1', 'p2']});
    const { findByText, getByLabelText, getByText } = await render(<Screen />);
    await findByText('Jane Doe');

    await fireEvent.press(getByText('Edit Details'));
    await fireEvent.press(getByLabelText('Back pain'));
    await fireEvent.press(getByText('Save Changes'));

    await waitFor(() =>
      expect(mockSaveConditions).toHaveBeenCalledWith('profile-1', {
        painTypes: ['p1', 'p2'],
        otherConditions: 'Gout',
      })
    );
  });

  test('a support-only user who records a diagnosis becomes a "both" account', async () => {
    // NOTE: this fails until handleSaveConditions calls upgradeIfHasCondition(profile).
    mockUserState = { isSupport: true, isPatient: false };
    mockMyAccount.mockResolvedValue(emptyAccount);
    mockSaveConditions.mockResolvedValue({
      id: 'profile-1',
      assigned_gender_at_birth: null,
      birth_year: null,
      pain_types: ['p1'],
      other_conditions: '',
    });
    const { findByText, getByLabelText, getByText } = await render(<Screen />);
    await findByText('Jane Doe');

    await fireEvent.press(getByText('Yes, I do'));
    await fireEvent.press(getByLabelText('Arthritis'));
    await fireEvent.press(getByText('Change to patient profile'));

    await waitFor(() => expect(mockSaveConditions).toHaveBeenCalledWith(null, { painTypes: ['p1'], otherConditions: '' }));
  });
});

describe('logging out', () => {
  test('confirming logs the user out', async () => {
    const { findByText, getByText } = await render(<Screen />);
    await findByText('Jane Doe');
    await fireEvent.press(getByText('Log Out'));
    await fireEvent.press(getByText('Log out')); // the confirm button
    await waitFor(() => expect(mockLogOut).toHaveBeenCalled());
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

  test('going back does not delete anything', async () => {
    const { findByText, getByText } = await render(<Screen />);
    await findByText('Jane Doe');
    await fireEvent.press(getByText('Delete my account'));
    await fireEvent.press(getByText('go back'));
    expect(mockDeleteMyAccount).not.toHaveBeenCalled();
    expect(mockSetUserType).not.toHaveBeenCalled();
  });
});
