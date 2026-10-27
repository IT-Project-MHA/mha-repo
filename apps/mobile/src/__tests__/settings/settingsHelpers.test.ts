// Unit tests for settings API helpers

// ----- Mocks -----
const mockApiUser = jest.fn();
const mockApiPatientProfile = jest.fn();
const mockApiSupportLink = jest.fn();
const mockApiAssignedGender = jest.fn();
jest.mock('@/api/django-API', () => ({
  apiUser: (...args: any[]) => mockApiUser(...args),
  apiPatientProfile: (...args: any[]) => mockApiPatientProfile(...args),
  apiSupportLink: (...args: any[]) => mockApiSupportLink(...args),
  apiAssignedGender: (...args: any[]) => mockApiAssignedGender(...args),
}));

import {
  apiMyAccount,
  apiSaveAboutMe,
  apiSaveConditions,
  apiDeleteMyAccount,
  validateAboutMe,
  apiMyConnections,
  apiInviteSupportPerson,
  apiRemoveSupportPerson,
  apiRemoveConnection,
  apiSaveSupportPermissions,
  apiErrorMessage,
} from '@/api/settings_api_helpers';

beforeEach(() => {
  mockApiUser.mockResolvedValue([{ id: 'user-1' }]);
  mockApiPatientProfile.mockResolvedValue({ id: 'profile-1' });
  mockApiSupportLink.mockResolvedValue({});
  mockApiAssignedGender.mockResolvedValue([{ value: 'female', label: 'Female' }]);
});

afterEach(() => {
  jest.resetAllMocks();
});

// --- Update account -----------------------------------------------------------

const aboutMe = { name: ' Jane Doe ', sex: 'female', birthYear: '2002', phone: '0412 345 678', email: ' jane@gmail.com ' };

describe('apiMyAccount', () => {
  test('returns the user, their profile and the sex options', async () => {
    mockApiPatientProfile.mockResolvedValue([{ id: 'profile-1' }]);
    const result = await apiMyAccount();
    expect(result.user).toEqual({ id: 'user-1' });
    expect(result.profile).toEqual({ id: 'profile-1' });
    expect(result.sexOptions).toEqual([{ value: 'female', label: 'Female' }]);
  });

  test('profile is null when the user has none yet', async () => {
    mockApiPatientProfile.mockResolvedValue([]);
    expect((await apiMyAccount()).profile).toBeNull();
  });
});

describe('apiSaveAboutMe', () => {
  test('saves trimmed name and email, and the phone as a local number with no spaces', async () => {
    await apiSaveAboutMe('user-1', 'profile-1', aboutMe);
    expect(mockApiUser).toHaveBeenCalledWith('update', {
      id: 'user-1',
      display_name: 'Jane Doe',
      phone_number: '0412345678',
      email: 'jane@gmail.com',
    });
  });

  test('updates an existing profile with sex and birth year as a number', async () => {
    await apiSaveAboutMe('user-1', 'profile-1', aboutMe);
    expect(mockApiPatientProfile).toHaveBeenCalledWith('update', {
      id: 'profile-1',
      assigned_gender_at_birth: 'female',
      birth_year: 2002,
    });
  });

  test('creates the profile when the user has none and a field is filled', async () => {
    await apiSaveAboutMe('user-1', null, aboutMe);
    expect(mockApiPatientProfile).toHaveBeenCalledWith('create', {
      assigned_gender_at_birth: 'female',
      birth_year: 2002,
    });
  });

  test('does not create a profile when sex and birth year are both blank', async () => {
    const result = await apiSaveAboutMe('user-1', null, { ...aboutMe, sex: '', birthYear: '' });
    expect(mockApiPatientProfile).not.toHaveBeenCalled();
    expect(result.profile).toBeNull();
  });

  test('a failed user save throws and nothing is saved to the profile', async () => {
    mockApiUser.mockRejectedValue(new Error('server error'));
    await expect(apiSaveAboutMe('user-1', 'profile-1', aboutMe)).rejects.toThrow('server error');
    expect(mockApiPatientProfile).not.toHaveBeenCalled();
  });
});

describe('apiSaveConditions', () => {
  test('updates an existing profile with trimmed other conditions', async () => {
    await apiSaveConditions('profile-1', { hasDiagnosis: true, otherConditions: ' Arthritis ' });
    expect(mockApiPatientProfile).toHaveBeenCalledWith('update', {
      id: 'profile-1',
      has_diagnosis: true,
      other_conditions: 'Arthritis',
    });
  });

  test('creates the profile when the user has none', async () => {
    await apiSaveConditions(null, { hasDiagnosis: true, otherConditions: '' });
    expect(mockApiPatientProfile).toHaveBeenCalledWith('create', { has_diagnosis: true, other_conditions: '' });
  });

  test('"No" (false) is sent, not dropped', async () => {
    await apiSaveConditions('profile-1', { hasDiagnosis: false, otherConditions: '' });
    expect(mockApiPatientProfile).toHaveBeenCalledWith('update', expect.objectContaining({ has_diagnosis: false }));
  });
});

describe('validateAboutMe', () => {
  test('valid details give no message, including a spaced or +61 phone and a blank birth year or email', () => {
    expect(validateAboutMe(aboutMe)).toBeNull();
    expect(validateAboutMe({ ...aboutMe, phone: '+61412345678' })).toBeNull();
    expect(validateAboutMe({ ...aboutMe, birthYear: '', email: '' })).toBeNull();
  });

  test('blank or spaces-only name is rejected', () => {
    expect(validateAboutMe({ ...aboutMe, name: '' })).toBe('Enter your name.');
    expect(validateAboutMe({ ...aboutMe, name: '   ' })).toBe('Enter your name.');
  });

  test('phone must be an Australian mobile', () => {
    expect(validateAboutMe({ ...aboutMe, phone: '' })).toBe('Enter an Australian mobile number.');
    expect(validateAboutMe({ ...aboutMe, phone: '0212345678' })).toBe('Enter an Australian mobile number.');
    expect(validateAboutMe({ ...aboutMe, phone: '+14155550123' })).toBe('Enter an Australian mobile number.');
  });

  test('birth year must be 1900-2100 (the server range)', () => {
    expect(validateAboutMe({ ...aboutMe, birthYear: '1899' })).not.toBeNull();
    expect(validateAboutMe({ ...aboutMe, birthYear: '1900' })).toBeNull();
    expect(validateAboutMe({ ...aboutMe, birthYear: '2100' })).toBeNull();
    expect(validateAboutMe({ ...aboutMe, birthYear: '2101' })).not.toBeNull();
    expect(validateAboutMe({ ...aboutMe, birthYear: '85' })).not.toBeNull();
  });

  test('email must look valid if given', () => {
    expect(validateAboutMe({ ...aboutMe, email: 'not-an-email' })).toBe('Enter a valid email address.');
  });
});

// --- Delete account -----------------------------------------------------------

describe('apiDeleteMyAccount', () => {
  test('deletes the user\'s own account by id', async () => {
    await apiDeleteMyAccount();
    expect(mockApiUser).toHaveBeenCalledWith('delete', { id: 'user-1' });
  });
});

// --- Support person: invite, permissions, remove ------------------------------

const link = (over: object) => ({
  id: 'l1',
  patient_user: 'user-1',
  supporter_user: null,
  patient_name: 'John Appleseed',
  supporter_name: null,
  invited_phone_number: '+61427052153',
  status: 'invited',
  can_view_appointments: false,
  can_view_assessments: false,
  can_view_prescriptions: false,
  ...over,
});

describe('apiInviteSupportPerson', () => {
  test('sends the number in +61 format', async () => {
    await apiInviteSupportPerson('0427 052 153');
    expect(mockApiSupportLink).toHaveBeenCalledWith('create', { invited_phone_number: '+61427052153' });
  });
});

describe('apiMyConnections', () => {
  test('links where the user is the patient are support people', async () => {
    mockApiSupportLink.mockResolvedValue([link({ id: 'l1' })]);
    const { supportPeople, supporting } = await apiMyConnections();
    expect(supportPeople.map((p: any) => p.id)).toEqual(['l1']);
    expect(supporting).toEqual([]);
  });

  test('an invited link is marked invited, and uses the phone number as its name', async () => {
    mockApiSupportLink.mockResolvedValue([link({})]);
    const [person] = (await apiMyConnections()).supportPeople;
    expect(person.invited).toBe(true);
    expect(person.name).toBe('+61427052153');
  });

  test('revoked links are left out of support people', async () => {
    mockApiSupportLink.mockResolvedValue([link({ status: 'revoked' })]);
    expect((await apiMyConnections()).supportPeople).toEqual([]);
  });

  test('people the user supports are only the active links where they are the supporter', async () => {
    mockApiSupportLink.mockResolvedValue([
      link({ id: 'a', patient_user: 'user-9', supporter_user: 'user-1', status: 'active' }),
      link({ id: 'b', patient_user: 'user-9', supporter_user: 'user-1', status: 'invited' }),
      link({ id: 'c', patient_user: 'user-9', supporter_user: 'user-1', status: 'revoked' }),
    ]);
    const { supporting } = await apiMyConnections();
    expect(supporting.map((p: any) => p.id)).toEqual(['a']);
    expect(supporting[0].name).toBe('John Appleseed'); // the patient's name
  });

  test('permissions are read from the can_view_ fields', async () => {
    mockApiSupportLink.mockResolvedValue([link({ can_view_assessments: true })]);
    const [person] = (await apiMyConnections()).supportPeople;
    expect(person.permissions).toEqual({ viewAppointments: false, viewAssessments: true, viewPrescriptions: false });
  });
});

describe('apiSaveSupportPermissions', () => {
  test('sends all three permissions to the link', async () => {
    mockApiSupportLink.mockResolvedValue(link({}));
    await apiSaveSupportPermissions('l1', { viewAppointments: true, viewAssessments: false, viewPrescriptions: true });
    expect(mockApiSupportLink).toHaveBeenCalledWith('update', {
      id: 'l1',
      can_view_appointments: true,
      can_view_assessments: false,
      can_view_prescriptions: true,
    });
  });
});

describe('removing connections', () => {
  test('a patient removing a support person deletes the link', async () => {
    await apiRemoveSupportPerson('l1');
    expect(mockApiSupportLink).toHaveBeenCalledWith('delete', { id: 'l1' });
  });

  test('a support person removing themselves revokes the link, not deletes it', async () => {
    await apiRemoveConnection('l1');
    expect(mockApiSupportLink).toHaveBeenCalledWith('update', { id: 'l1', status: 'revoked' });
  });
});

// --- Error messages -----------------------------------------------------------

describe('apiErrorMessage', () => {
  test('uses the first message the server sent for a field', () => {
    expect(apiErrorMessage({ data: { phone_number: ['Enter an Australian mobile number.'] } }, 'fallback'))
      .toBe('Enter an Australian mobile number.');
  });

  test('falls back when there is no data (e.g. no connection)', () => {
    expect(apiErrorMessage(new Error('Network request failed'), 'fallback')).toBe('fallback');
  });
});