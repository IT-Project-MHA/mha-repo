// Component tests for the My Connections screen.

import { render, fireEvent, waitFor } from '@testing-library/react-native';
import Screen from '@/app/(tabs)/settings/mySupportLinks';
import {
  apiMySupportLinks,
  apiRemoveSupportPerson,
  apiAcceptInvitation,
  apiDeclineInvitation,
  apiInviteSupportPerson,
} from '@/api/settings_api_helpers';

// ----- Mocks -----
jest.mock('@/context/ThemeContext', () => ({
  useTheme: () => ({
    theme: new Proxy({}, { get: () => ({}) }),
    colours: { onSurface: 'pink', primary: 'blue', surface: 'red' },
  }),
}));
jest.mock('@/api/django-API', () => ({}));


const mockRefreshUserType = jest.fn();
jest.mock('@/context/AuthorisationContext', () => ({
  useUser: () => ({ refreshUserType: mockRefreshUserType }),
}));

// keeps real validation helpers, blocks calls that reach the server
jest.mock('@/api/settings_api_helpers', () => ({
  ...jest.requireActual('@/api/settings_api_helpers'),
  apiMySupportLinks: jest.fn(),
  apiRemoveSupportPerson: jest.fn(),
  apiRemoveConnection: jest.fn(),
  apiInviteSupportPerson: jest.fn(),
  apiSaveSupportPermissions: jest.fn(),
  apiAcceptInvitation: jest.fn(),
  apiDeclineInvitation: jest.fn(),
}));

const mockMyConnections = apiMySupportLinks as jest.Mock;
const mockRemoveSupportPerson = apiRemoveSupportPerson as jest.Mock;
const mockAcceptInvitation = apiAcceptInvitation as jest.Mock;
const mockDeclineInvitation = apiDeclineInvitation as jest.Mock;
const mockInviteSupportPerson = apiInviteSupportPerson as jest.Mock;

// ----- Test data -----
const noPerms = { viewAppointments: false, viewAssessments: false, viewPrescriptions: false };
const connections = {
  supportPeople: [{ id: 'l1', name: 'Jess', phone: '+61412345678', invited: false, permissions: noPerms }],
  supporting: [{ id: 'l2', name: 'John Appleseed', phone: '', invited: false, permissions: noPerms }],
  invitations: [] as { id: string; name: string }[],
};

beforeEach(() => {
  mockMyConnections.mockResolvedValue(connections);
  mockRemoveSupportPerson.mockResolvedValue(null);
  mockAcceptInvitation.mockResolvedValue({});
  mockRefreshUserType.mockResolvedValue(undefined);
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('My Connections', () => {
  test('shows the support people and the people the user supports once loaded', async () => {
    const { findByText, getByText } = await render(<Screen />);
    expect(await findByText('Jess')).toBeTruthy();
    expect(getByText('John Appleseed')).toBeTruthy();
  });

  test('removing a support person deletes the link and reloads the list', async () => {
    const { findByText, getByText } = await render(<Screen />);
    await fireEvent.press(await findByText('Jess'));
    await fireEvent.press(getByText('Remove Support Person'));
    await fireEvent.press(getByText('Remove')); // confirm
    await waitFor(() => expect(mockRemoveSupportPerson).toHaveBeenCalledWith('l1'));
    await waitFor(() => expect(mockMyConnections).toHaveBeenCalledTimes(2));
  });

  test('accepting an invitation accepts it, refreshes the user type and reloads', async () => {
    mockMyConnections.mockResolvedValue({ ...connections, invitations: [{ id: 'i1', name: 'Sam' }] });
    const { findByText, getByText } = await render(<Screen />);
    expect(await findByText('Sam invited you to support them')).toBeTruthy();
    await fireEvent.press(getByText('Accept'));
    await waitFor(() => expect(mockAcceptInvitation).toHaveBeenCalledWith('i1'));
    await waitFor(() => expect(mockRefreshUserType).toHaveBeenCalled());
    await waitFor(() => expect(mockMyConnections).toHaveBeenCalledTimes(2));
  });
});

test('declining an invitation declines it and reloads without changing the user type', async () => {
    mockMyConnections.mockResolvedValue({ ...connections, invitations: [{ id: 'i1', name: 'Sam' }] });
    const { findByText, getByText } = await render(<Screen />);
    await findByText('Sam invited you to support them');
    await fireEvent.press(getByText('Decline'));
    await waitFor(() => expect(mockDeclineInvitation).toHaveBeenCalledWith('i1'));
    await waitFor(() => expect(mockMyConnections).toHaveBeenCalledTimes(2));
    expect(mockRefreshUserType).not.toHaveBeenCalled();
  });

  test('sending an invite calls the API and reloads the list', async () => {
    const { findAllByText, getByText, getByPlaceholderText } = await render(<Screen />);
    const [addButton] = await findAllByText('Add Support Person');
    await fireEvent.press(addButton);
    await fireEvent.changeText(getByPlaceholderText('Phone Number'), '0412 345 678');
    await fireEvent.press(getByText('Send Invite'));
    await waitFor(() => expect(mockInviteSupportPerson).toHaveBeenCalledWith('0412 345 678'));
    await waitFor(() => expect(mockMyConnections).toHaveBeenCalledTimes(2));
  });