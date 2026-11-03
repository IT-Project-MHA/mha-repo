/** Component tests for the mySupportLinks screen in carePlanner.
 * Tests cover:
 *    - the empty-state message when there are no support links
 *    - a load failure shows the error message
 *    - saved links render their name and phone number
 *    - a link with an account that hasn't accepted shows the pending note
 *    - pressing a link picks it and goes back to the new support person page
 */

import React from 'react';
import { actRender, press, expectText } from '../../helpers/testHelpers';

const mockRouter = { push: jest.fn(), back: jest.fn(), replace: jest.fn() };
const mockPickSupportLink = jest.fn();
const mockApiMySupportLinks = jest.fn();

jest.mock('expo-router', () => ({ useRouter: () => mockRouter }));
jest.mock('../../../context/AppointmentContext', () => ({
  useAppointment: () => ({ pickSupportLink: mockPickSupportLink }),
}));
jest.mock('../../api/care_planner_api_helpers', () => ({
  apiMySupportLinks: (...a: any[]) => mockApiMySupportLinks(...a),
}));
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

import Screen from '../../app/(tabs)/carePlanner/mySupportLinks';

afterEach(() => jest.clearAllMocks());

test('shows the empty-state message when there are no support links', async () => {
  mockApiMySupportLinks.mockResolvedValue([]);
  await actRender(<Screen />);
  expectText('You have no support links yet');
});

test('a load failure shows the error message', async () => {
  mockApiMySupportLinks.mockRejectedValue(new Error('placeholder error'));
  await actRender(<Screen />);
  expectText('Your support links could not be loaded');
});

test('saved links render their name and phone number', async () => {
  mockApiMySupportLinks.mockResolvedValue([{ 
    id: 'l1', 
    invited_phone_number: '+61412345678', 
    supporter_name: 'Jane Doe', 
    status: 'active' },
  ]);
  await actRender(<Screen />);
  expectText('Jane Doe');
  expectText('+61412345678');
});

test('a link with an account that has not accepted shows the pending note', async () => {
  mockApiMySupportLinks.mockResolvedValue([{ 
    id: 'l1', 
    invited_phone_number: '+61412345678', 
    supporter_name: 'Jane Doe', 
    status: 'invited' },
  ]);
  await actRender(<Screen />);
  expectText('Invite not accepted yet');
});

test('pressing a link picks it and goes back', async () => {
  mockApiMySupportLinks.mockResolvedValue([{ 
    id: 'l1', 
    invited_phone_number: '+61412345678', 
    supporter_name: 'Jane Doe', 
    status: 'active' },
  ]);
  await actRender(<Screen />);
  await press('Jane Doe');
  expect(mockPickSupportLink).toHaveBeenCalledWith({ id: 'l1', phone: '+61412345678' });
  expect(mockRouter.back).toHaveBeenCalled();
});
