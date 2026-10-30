// Component tests for the Legal screen.
import { render, fireEvent } from '@testing-library/react-native';
import * as WebBrowser from 'expo-web-browser';
import Screen from '@/app/(tabs)/settings/legal';

jest.mock('@/context/ThemeContext', () => ({
  useTheme: () => ({
    theme: new Proxy({}, { get: () => ({}) }),
    colours: { onSurface: 'pink', primary: 'blue', surface: 'red' },
  }),
}));

jest.mock('expo-web-browser', () => ({ openBrowserAsync: jest.fn() }));

const mockOpen = WebBrowser.openBrowserAsync as jest.Mock;

afterEach(() => jest.clearAllMocks());

describe('Legal', () => {
  // the links are placeholders, so these check that a web address opens, not which one
  test('Privacy Policy opens a web link', async () => {
    const { getByText } = await render(<Screen />);
    await fireEvent.press(getByText('Privacy Policy'));
    expect(mockOpen).toHaveBeenCalledWith(expect.stringMatching(/^https:\/\//));
  });

  test('Terms & Conditions opens a web link', async () => {
    const { getByText } = await render(<Screen />);
    await fireEvent.press(getByText('Terms & Conditions'));
    expect(mockOpen).toHaveBeenCalledWith(expect.stringMatching(/^https:\/\//));
  });
});