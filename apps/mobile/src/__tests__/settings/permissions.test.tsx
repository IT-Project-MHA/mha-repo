// Component tests for the Permissions screen (microphone, notifications, reminders, offline backup).
import { Alert, Linking } from 'react-native';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { getRecordingPermissionsAsync } from 'expo-audio';
import Screen from '@/app/(tabs)/settings/permissions';
import { apiMySettings, apiSaveSettings } from '@/api/settings_api_helpers';

jest.mock('@/context/ThemeContext', () => ({
  useTheme: () => ({
    theme: new Proxy({}, { get: () => ({}) }),
    colours: { onSurface: 'pink', primary: 'blue', surface: 'red' },
  }),
}));
jest.mock('@/api/django-API', () => ({}));


jest.mock('@/api/settings_api_helpers', () => ({
  ...jest.requireActual('@/api/settings_api_helpers'),
  apiMySettings: jest.fn(),
  apiSaveSettings: jest.fn(),
}));
jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: { getItem: jest.fn(), setItem: jest.fn() },
}));
jest.mock('expo-notifications', () => ({ getPermissionsAsync: jest.fn(), requestPermissionsAsync: jest.fn() }));
jest.mock('expo-audio', () => ({ getRecordingPermissionsAsync: jest.fn(), requestRecordingPermissionsAsync: jest.fn() }));
jest.mock('@/components/atomicUI/Toggle', () => {
  const React = require('react');
  const { Pressable } = require('react-native');
  return {
    __esModule: true,
    default: ({ onToggle, switchOn }: any) =>
      React.createElement(Pressable, { onPress: onToggle, accessibilityRole: 'switch', accessibilityState: { checked: switchOn } }),
  };
});

const mockMySettings = apiMySettings as jest.Mock;
const mockSaveSettings = apiSaveSettings as jest.Mock;
const mockNotifGet = Notifications.getPermissionsAsync as jest.Mock;
const mockMicGet = getRecordingPermissionsAsync as jest.Mock;
const mockSetItem = AsyncStorage.setItem as jest.Mock;
let alertSpy: jest.SpyInstance;

// the switches are in this order on the screen
const MIC = 0, NOTIFICATIONS = 1, ASSESSMENT_REMINDERS = 2, APPOINTMENT_REMINDERS = 3, OFFLINE = 4;
const isOn = (switches: any[], i: number) => switches[i].props.accessibilityState.checked;

beforeEach(() => {
  mockMySettings.mockResolvedValue({ id: 's1', notifications_enabled: true, microphone_access: false, offline_backup: true });
  mockNotifGet.mockResolvedValue({ granted: true, canAskAgain: true });
  mockMicGet.mockResolvedValue({ granted: true, canAskAgain: true });
  (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
  mockSetItem.mockResolvedValue(undefined);
  alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  jest.spyOn(Linking, 'openSettings').mockResolvedValue(undefined);
});

afterEach(() => jest.clearAllMocks());

describe('Permissions', () => {
  test('shows each saved setting as on or off', async () => {
    const { findAllByRole } = await render(<Screen />);
    const switches = await findAllByRole('switch');
    expect(isOn(switches, MIC)).toBe(false);
    expect(isOn(switches, NOTIFICATIONS)).toBe(true);
    expect(isOn(switches, OFFLINE)).toBe(true);
  });

  test('turning notifications on saves it, and creates the settings record if there is none', async () => {
    mockMySettings.mockResolvedValue(null);
    mockSaveSettings.mockResolvedValue({ id: 's1', notifications_enabled: true });
    const { findAllByRole } = await render(<Screen />);
    await fireEvent.press((await findAllByRole('switch'))[NOTIFICATIONS]);
    await waitFor(() => expect(mockSaveSettings).toHaveBeenCalledWith(null, { notifications_enabled: true }));
  });

  test('turning notifications off saves false', async () => {
    mockSaveSettings.mockResolvedValue({ id: 's1', notifications_enabled: false });
    const { findAllByRole } = await render(<Screen />);
    await fireEvent.press((await findAllByRole('switch'))[NOTIFICATIONS]);
    await waitFor(() => expect(mockSaveSettings).toHaveBeenCalledWith('s1', { notifications_enabled: false }));
  });

  test('if the phone refuses, an alert offers phone settings and nothing is saved', async () => {
    mockMySettings.mockResolvedValue({ id: 's1', notifications_enabled: false });
    mockNotifGet.mockResolvedValue({ granted: false, canAskAgain: false });
    const { findAllByRole } = await render(<Screen />);
    await fireEvent.press((await findAllByRole('switch'))[NOTIFICATIONS]);
    await waitFor(() => expect(alertSpy).toHaveBeenCalledWith('Allow notifications', expect.any(String), expect.any(Array)));
    expect(mockSaveSettings).not.toHaveBeenCalled();
  });

  test('a failed save puts the switch back and shows an alert', async () => {
    mockSaveSettings.mockRejectedValue(new Error('Network request failed'));
    const { findAllByRole, getAllByRole } = await render(<Screen />);
    await fireEvent.press((await findAllByRole('switch'))[NOTIFICATIONS]);
    await waitFor(() => expect(alertSpy.mock.calls[0][0]).toBe('Could not save'));
    expect(isOn(getAllByRole('switch'), NOTIFICATIONS)).toBe(true);
  });

  test('reminder switches follow notifications: on when they are on, off when they are off', async () => {
    const on = await render(<Screen />);
    let switches = await on.findAllByRole('switch');
    expect(isOn(switches, ASSESSMENT_REMINDERS)).toBe(true);
    expect(isOn(switches, APPOINTMENT_REMINDERS)).toBe(true);
    await on.unmount();

    mockMySettings.mockResolvedValue({ id: 's1', notifications_enabled: false });
    const off = await render(<Screen />);
    switches = await off.findAllByRole('switch');
    expect(isOn(switches, ASSESSMENT_REMINDERS)).toBe(false);
    expect(isOn(switches, APPOINTMENT_REMINDERS)).toBe(false);
  });

  test('turning a reminder off is remembered on the phone, not sent to the server', async () => {
    const { findAllByRole } = await render(<Screen />);
    await fireEvent.press((await findAllByRole('switch'))[ASSESSMENT_REMINDERS]);
    expect(mockSetItem).toHaveBeenCalledWith('reminders.assessment', 'false');
    expect(mockSaveSettings).not.toHaveBeenCalled();
  });
});