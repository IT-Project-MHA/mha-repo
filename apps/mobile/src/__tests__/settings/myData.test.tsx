// Component tests for the My Data screen (delete health data).
import { Alert } from 'react-native';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import Screen from '@/app/(tabs)/settings/myData';
import { apiDeleteMyData } from '@/api/settings_api_helpers';

jest.mock('@/context/ThemeContext', () => ({
  useTheme: () => ({
    theme: new Proxy({}, { get: () => ({}) }),
    colours: { onSurface: 'pink', primary: 'blue', surface: 'red' },
  }),
}));
jest.mock('@/api/django-API', () => ({}));

jest.mock('@/api/settings_api_helpers', () => ({
  ...jest.requireActual('@/api/settings_api_helpers'),
  apiDeleteMyData: jest.fn(),
}));

const mockReplace = jest.fn();
jest.mock('expo-router', () => ({ useRouter: () => ({ replace: mockReplace }) }));

const mockRefreshUserType = jest.fn();
jest.mock('@/context/AuthorisationContext', () => ({
  useUser: () => ({ refreshUserType: mockRefreshUserType }),
}));
jest.mock('expo-web-browser', () => ({ openBrowserAsync: jest.fn() }));

const mockDeleteMyData = apiDeleteMyData as jest.Mock;
let alertSpy: jest.SpyInstance;

beforeEach(() => {
  mockRefreshUserType.mockResolvedValue(undefined);
  alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
});

afterEach(() => jest.clearAllMocks());

const confirmDelete = async (utils: any) => {
  await fireEvent.press(utils.getByText('Delete my Data'));
  await fireEvent.press(utils.getByText('Delete')); // confirm
};

describe('My Data', () => {
  test('confirming deletes the data, refreshes the user type and says so', async () => {
    mockDeleteMyData.mockResolvedValue(true);
    await confirmDelete(await render(<Screen />));
    await waitFor(() => expect(mockDeleteMyData).toHaveBeenCalled());
    await waitFor(() => expect(mockRefreshUserType).toHaveBeenCalled());
    expect(alertSpy.mock.calls[0][0]).toBe('Data deleted');
  });

  test('pressing OK after deleting data leaves the patient screens', async () => {
    mockDeleteMyData.mockResolvedValue(true);
    await confirmDelete(await render(<Screen />));
    await waitFor(() => expect(alertSpy).toHaveBeenCalled());
    alertSpy.mock.calls[0][2][0].onPress(); // the OK button
    expect(mockReplace).toHaveBeenCalledWith('/carePlanner');
  });

  test('with no data stored it says so and does not navigate', async () => {
    mockDeleteMyData.mockResolvedValue(false);
    await confirmDelete(await render(<Screen />));
    await waitFor(() => expect(alertSpy).toHaveBeenCalled());
    expect(alertSpy.mock.calls[0][0]).toBe('Nothing to delete');
    alertSpy.mock.calls[0][2][0].onPress();
    expect(mockReplace).not.toHaveBeenCalled();
  });

  test('a failed delete shows an alert and does not refresh the user type', async () => {
    mockDeleteMyData.mockRejectedValue(new Error('Network request failed'));
    await confirmDelete(await render(<Screen />));
    await waitFor(() => expect(alertSpy).toHaveBeenCalled());
    expect(alertSpy.mock.calls[0][0]).toBe('Could not delete your data');
    expect(mockRefreshUserType).not.toHaveBeenCalled();
  });
});