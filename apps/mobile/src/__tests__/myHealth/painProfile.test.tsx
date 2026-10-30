/** Component tests for painProfile tab in myHealth.
 * Tests cover:
 *
 *  Share PDF button:
 *    - shows "Loading…" and is disabled (no export) until summaries load
 *    - becomes "Share PDF" and renders loaded data once summaries resolve
 *  PDF export:
 *    - builds the PDF, writes it to storage, and opens the share sheet
 *    - includes loaded profile data in the generated HTML
 *    - alerts and skips writing/sharing when no PDF data is produced
 *    - alerts and does not share when sharing is unavailable
 *    - alerts when PDF generation throws
 *  Assessment sections:
 *    - renders the My Pain field rows once the summary resolves
 *    - shows the fallback for an empty assessment section
*/

import React from 'react';
import { Alert } from 'react-native';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react-native';

// ----- Mocks -----

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn(), navigate: jest.fn() }),
}));

// summary API helpers
const mockAboutMe = jest.fn();
const mockConditions = jest.fn();
const mockPain = jest.fn();
const mockMovement = jest.fn();
const mockPersonalCare = jest.fn();
const mockSocial = jest.fn();
const mockManagement = jest.fn();
jest.mock('@/api/my_health_api_helpers', () => ({
  apiAboutMe: (...a: any[]) => mockAboutMe(...a),
  apiMyConditions: (...a: any[]) => mockConditions(...a),
  apiMyPainSummary: (...a: any[]) => mockPain(...a),
  apiMovementSummary: (...a: any[]) => mockMovement(...a),
  apiPersonalCareSummary: (...a: any[]) => mockPersonalCare(...a),
  apiSocialHealthSummary: (...a: any[]) => mockSocial(...a),
  apiManagementSummary: (...a: any[]) => mockManagement(...a),
}));

// PDF generation / sharing / file write
const mockPrintToFile = jest.fn();
jest.mock('expo-print', () => ({
  printToFileAsync: (...a: any[]) => mockPrintToFile(...a),
}));

const mockIsAvailable = jest.fn();
const mockShareAsync = jest.fn();
jest.mock('expo-sharing', () => ({
  isAvailableAsync: (...a: any[]) => mockIsAvailable(...a),
  shareAsync: (...a: any[]) => mockShareAsync(...a),
}));

const mockWriteAsString = jest.fn();
jest.mock('expo-file-system/legacy', () => ({
  documentDirectory: 'path/',
  writeAsStringAsync: (...a: any[]) => mockWriteAsString(...a),
  EncodingType: { Base64: 'base64' },
}));

import Screen from '../../app/(tabs)/myHealth/painProfile';

const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});

beforeEach(() => {
  mockAboutMe.mockResolvedValue({ name: 'Jane Doe', sex: 'Female', ageGroup: '30-39' });
  mockConditions.mockResolvedValue({ primaryCondition: 'Chronic back pain', otherConditions: '' });
  mockPain.mockResolvedValue({
    location: 'Lower back', current: 7, average: 5, worst: 9, mildest: 2, characteristics: 'Aching',
  });
  // assessment sections other than My Pain are left empty
  mockMovement.mockResolvedValue({
    activeHours: null, general: '', walking: '', lifting: '', sitting: '', standing: '',
  });
  mockPersonalCare.mockResolvedValue({ general: '', personalCare: '', sleeping: '' });
  mockSocial.mockResolvedValue({
    socialLife: '', travelling: '', mood: null, relationships: null, enjoyment: null,
  });
  mockManagement.mockResolvedValue({ medication: '', exercise: '', emotion: '' });

  mockPrintToFile.mockResolvedValue({ uri: 'file_location', base64: 'pdf_data' });
  mockIsAvailable.mockResolvedValue(true);
  mockShareAsync.mockResolvedValue(undefined);
  mockWriteAsString.mockResolvedValue(undefined);
});

afterEach(() => {
  jest.clearAllMocks();
});

// Render and wait until the summaries have loaded
async function renderReady() {
  await render(<Screen />);
  await screen.findByText('Share PDF');
}

// ----- Tests -----

describe('API loading', () => {
  test('disabled when summaries haven\'t finished loading', async () => {
    const pending = new Promise(() => {});
    for (const m of [mockAboutMe, mockConditions, mockPain, mockMovement,
      mockPersonalCare, mockSocial, mockManagement]) {
      m.mockReturnValue(pending);
    }
    await render(<Screen />);
    expect(screen.getByText('Loading…')).toBeTruthy();
    
    fireEvent.press(screen.getByText('Loading…'));
    expect(mockPrintToFile).not.toHaveBeenCalled();
  });

  test('renders loaded data once summaries load', async () => {
    await renderReady();
    expect(screen.getByText('Share PDF')).toBeTruthy();
    expect(screen.getByText('Jane Doe')).toBeTruthy();
    expect(screen.getByText('Lower back')).toBeTruthy();
  });
});

describe('PDF export', () => {
  test('builds the PDF, writes it to storage, and opens the share sheet', async () => {
    await renderReady();
    fireEvent.press(screen.getByText('Share PDF'));
    await waitFor(() => expect(mockShareAsync).toHaveBeenCalledTimes(1));
    expect(mockPrintToFile).toHaveBeenCalledTimes(1);
    expect(mockPrintToFile.mock.calls[0][0]).toEqual(
      expect.objectContaining({ base64: true, html: expect.stringContaining('My Pain Profile') }),
    );
    // wrote the base64 to the app's document directory
    expect(mockWriteAsString).toHaveBeenCalledWith(
      'path/pain-profile.pdf', 'pdf_data', { encoding: 'base64' },
    );
    // shared that file as a PDF
    expect(mockShareAsync).toHaveBeenCalledWith(
      'path/pain-profile.pdf',
      expect.objectContaining({ mimeType: 'application/pdf' }),
    );
  });

  test('includes loaded profile data in the generated HTML', async () => {
    await renderReady();
    fireEvent.press(screen.getByText('Share PDF'));

    await waitFor(() => expect(mockPrintToFile).toHaveBeenCalled());
    const html: string = mockPrintToFile.mock.calls[0][0].html;
    expect(html).toContain('Jane Doe');          // about me
    expect(html).toContain('Chronic back pain');  // condition
    expect(html).toContain('Lower back');         // pain location
  });

  test('alerts and skips writing/sharing when no PDF data is produced', async () => {
    mockPrintToFile.mockResolvedValueOnce({base64: undefined});
    await renderReady();
    fireEvent.press(screen.getByText('Share PDF'));
    await waitFor(() =>
      expect(alertSpy).toHaveBeenCalledWith('Could not create PDF', expect.any(String)),
    );
    expect(mockWriteAsString).not.toHaveBeenCalled();
    expect(mockShareAsync).not.toHaveBeenCalled();
  });

  test('alerts and does not share when sharing is unavailable', async () => {
    mockIsAvailable.mockResolvedValueOnce(false);
    await renderReady();
    fireEvent.press(screen.getByText('Share PDF'));
    await waitFor(() =>
      expect(alertSpy).toHaveBeenCalledWith('Sharing unavailable', expect.any(String)),
    );
    expect(mockShareAsync).not.toHaveBeenCalled();
  });

  test('alerts when PDF generation throws', async () => {
    mockPrintToFile.mockRejectedValueOnce(new Error('placeholder error'));
    await renderReady();
    fireEvent.press(screen.getByText('Share PDF'))
    await waitFor(() =>
      expect(alertSpy).toHaveBeenCalledWith(
        'Could not create PDF', expect.stringContaining('placeholder error')),
    );
    expect(mockShareAsync).not.toHaveBeenCalled();
  });
});

describe('Assessment sections', () => {
  test('renders the My Pain field rows', async () => {
    await renderReady();
    expect(screen.getByText('Lower back')).toBeTruthy();
    expect(screen.getByText('My Current pain: 7')).toBeTruthy();
    expect(screen.getByText('My current pain is fairly severe.')).toBeTruthy();
    expect(screen.getByText('Aching')).toBeTruthy();
  });

  test('shows the fallback for an empty assessment section', async () => {
    await renderReady();
    const walkingRow = screen.getByText('Walking:').parent!;
    expect(within(walkingRow).getByText('Not available')).toBeTruthy();
  });
});
