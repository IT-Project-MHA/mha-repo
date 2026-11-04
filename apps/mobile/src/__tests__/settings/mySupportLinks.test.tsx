// Component tests for the My Connections screen.
jest.mock('react-native-safe-area-context', () =>
  require('react-native-safe-area-context/jest/mock').default
);

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn(), navigate: jest.fn(), replace: jest.fn(), back: jest.fn() }),
}));

jest.mock('@/api/care_planner_api_helpers', () => ({
  ...jest.requireActual('@/api/care_planner_api_helpers'),
  ownPatientProfileId: jest.fn(),
}));

import { ownPatientProfileId } from '@/api/care_planner_api_helpers';
const mockOwnProfileId = ownPatientProfileId as jest.Mock;

jest.mock('@/context/AppointmentContext', () => ({
  useAppointment: () => ({ pickSupportLink: jest.fn() }),
}));

import { render, fireEvent, waitFor } from '@testing-library/react-native';
import Screen from '@/app/(tabs)/carePlanner/mySupportLinksBase';

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
  useUser: () => ({ refreshUserType: mockRefreshUserType, isPatient: true, isSupport: false }),
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
  mockOwnProfileId.mockResolvedValue('profile-1');
  mockInviteSupportPerson.mockResolvedValue({});
  mockDeclineInvitation.mockResolvedValue({});
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('My Connections', () => {
  test('accepting an invitation accepts it, refreshes the user type and reloads', async () => {
    mockMyConnections.mockResolvedValue({ ...connections, invitations: [{ id: 'i1', name: 'Sam' }] });
    const { findByText, getByText } = await render(<Screen />);
    expect(await findByText('Sam invited you to support them')).toBeTruthy();
    await fireEvent.press(getByText('Accept'));
    await waitFor(() => expect(mockAcceptInvitation).toHaveBeenCalledWith('i1'));
    await waitFor(() => expect(mockRefreshUserType).toHaveBeenCalled());
    await waitFor(() => expect(mockMyConnections).toHaveBeenCalledTimes(2));
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
    await waitFor(() => expect(mockInviteSupportPerson).toHaveBeenCalledWith('+61412345678'));
    await waitFor(() => expect(mockMyConnections).toHaveBeenCalledTimes(2));
  });
});

