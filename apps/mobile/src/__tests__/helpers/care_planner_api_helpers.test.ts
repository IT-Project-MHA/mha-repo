/** Unit tests for the Care Planner API helpers
 *
 * Tests cover:
 *
 *  apiPatientAppointments:
 *    - returns the appointments of the user's own patient profile
 *    - empty list when the user has no profile
 *
 *  apiSupportAppointments:
 *    - leaves out the user's own appointments
 *    - keeps every appointment when the user has no profile
 *
 *  apiSupportedPatients:
 *    - only the user's active links as a support person
 *
 *  apiSharedAppointments:
 *    - adds the patient's name, blank when the patient isn't known
 *
 *  apiSaveAnswer:
 *    - creates an answer for the question when there is none, updates it otherwise
 *    - a recording is sent as a file with its name and audio type (m4a, 3gp, others)
 *    - null removes the recording, values left out aren't sent
 *
 *  apiSaveOwnQuestions:
 *    - deletes own questions no longer listed, creates new ones in order, updates changed text
 *    - other people's questions are never changed or deleted
 *
 *  apiPainSummary:
 *    - no profile gives only an empty location list
 *    - uses the given patient's profile instead of the user's
 *    - values come from the newest week that has them, weeks with no record are skipped
 *    - average of the 2 most recent averages, rounded, or the only one
 *    - stops loading weeks once every value is found
 *
 *  apiAppointmentDetails:
 *    - questions with their answers, marking those added by someone else
 *    - support people with live access only, blank name & phone without a link
 *    - doctor's permission, patient name and id
 *    - the user's own access only counts once their link is active
 *
 *  apiMySupportLinks:
 *    - leaves out revoked links, empty list when the user has no profile
 *
 *  normalisePhoneNumber:
 *    - 04 and 614 mobile numbers, ignoring spaces & dashes
 *    - null for anything else
 *
 *  apiSaveAppointment:
 *    - creates the first time, updates after, leaving out a missing date & health service
 *
 *  apiSaveSupportPeople:
 *    - reuses picked links and links with the same phone number, invites new numbers once
 *    - doesn't reuse revoked links or other patients' links
 *    - a number that isn't a mobile is sent as typed for the server to refuse
 *    - gives each person their access and revokes the access of people removed
 *    - a refused invite stops the save
 */

// ----- Mocks -----
const mockApiAppointment = jest.fn();
const mockApiAppointmentAccess = jest.fn();
const mockApiAppointmentAnswer = jest.fn();
const mockApiAppointmentQuestion = jest.fn();
const mockApiAssessment = jest.fn();
const mockApiMyPain = jest.fn();
const mockApiPatientProfile = jest.fn();
const mockApiQuestionOption = jest.fn();
const mockApiSupportLink = jest.fn();
const mockApiUser = jest.fn();
jest.mock('../../api/django-API', () => ({
  apiAppointment: (...a: any[]) => mockApiAppointment(...a),
  apiAppointmentAccess: (...a: any[]) => mockApiAppointmentAccess(...a),
  apiAppointmentAnswer: (...a: any[]) => mockApiAppointmentAnswer(...a),
  apiAppointmentQuestion: (...a: any[]) => mockApiAppointmentQuestion(...a),
  apiAssessment: (...a: any[]) => mockApiAssessment(...a),
  apiMyPain: (...a: any[]) => mockApiMyPain(...a),
  apiPatientProfile: (...a: any[]) => mockApiPatientProfile(...a),
  apiQuestionOption: (...a: any[]) => mockApiQuestionOption(...a),
  apiSupportLink: (...a: any[]) => mockApiSupportLink(...a),
  apiUser: (...a: any[]) => mockApiUser(...a),
}));

import {
  apiPatientAppointments,
  apiSupportAppointments,
  apiSupportedPatients,
  apiSharedAppointments,
  apiSaveAnswer,
  apiSaveOwnQuestions,
  apiPainSummary,
  apiAppointmentDetails,
  apiMySupportLinks,
  normalisePhoneNumber,
  apiSaveAppointment,
  apiSaveSupportPeople,
} from '../../api/care_planner_api_helpers';

// ----- Test data -----
const USER_ID = "u1";
const PROFILE_ID = "p1";

// set user & patient profile API return values
function signedInAs(profileId: string | null = PROFILE_ID) {
  mockApiUser.mockResolvedValue([{ id: USER_ID }]);
  mockApiPatientProfile.mockResolvedValue(profileId ? [{ id: profileId }] : []);
}

// get all calls value for a particular mock function and operation (select, delete, etc.)
function calls(mock: jest.Mock, operation: string) {
  // mock.mock.calls is an array of calls in order
  return mock.mock.calls.filter(([op]) => op === operation).map(([, values]) => values);
}

// MyPain record
function pain(values: any = {}) {
  return {
    locations: [],
    other_location: '',
    average: null,
    worst: null,
    mildest: null,
    current: null,
    ...values,
  };
}

beforeEach(() => {
  signedInAs();
});
afterEach(() => jest.resetAllMocks());

// ----- Tests -----
describe('apiPatientAppointments', () => {
  test("returns the appointments of the user's own patient profile", async () => {
    mockApiAppointment.mockResolvedValue([{ id: 1 }]);
    await expect(apiPatientAppointments()).resolves.toEqual([{ id: 1 }]);
    expect(mockApiPatientProfile).toHaveBeenCalledWith('select', { user: USER_ID });
    expect(mockApiAppointment).toHaveBeenCalledWith('select', { patient_profile: PROFILE_ID });
  });

  test('empty list when the user has no profile', async () => {
    signedInAs(null);
    await expect(apiPatientAppointments()).resolves.toEqual([]);
    expect(mockApiAppointment).not.toHaveBeenCalled();
  });
});

describe('apiSupportAppointments', () => {
  test("leaves out the user's own appointments", async () => {
    mockApiAppointment.mockResolvedValue([
      { id: 1, patient_profile: PROFILE_ID },
      { id: 2, patient_profile: 'p2' },
    ]);
    await expect(apiSupportAppointments()).resolves.toEqual([{ id: 2, patient_profile: 'p2' }]);
  });

  test('keeps every appointment when the user has no profile', async () => {
    signedInAs(null);
    mockApiAppointment.mockResolvedValue([{ id: 2, patient_profile: 'p2' }]);
    await expect(apiSupportAppointments()).resolves.toHaveLength(1);
  });
});

describe('apiSupportedPatients', () => {
  test("only the user's active links as a support person", async () => {
    mockApiSupportLink.mockResolvedValue([
      { supporter_user: USER_ID, status: 'active', patient_profile: 'p3', patient_name: 'pat1' },
      { supporter_user: USER_ID, status: 'pending', patient_profile: 'p4', patient_name: 'pat2' },
      { supporter_user: USER_ID, status: 'revoked', patient_profile: 'p5', patient_name: 'pat3' },
      { supporter_user: 'u2', status: 'active', patient_profile: PROFILE_ID, patient_name: 'pat4' },
    ]);
    await expect(apiSupportedPatients()).resolves.toEqual([{ patientId: 'p3', patientName: 'pat1' }]);
  });
});

describe('apiSharedAppointments', () => {
  test("adds the patient's name, blank when the patient isn't known", async () => {
    mockApiAppointment.mockResolvedValue([
      { id: 1, patient_profile: 'p3' },
      { id: 2, patient_profile: 'p4' },
    ]);
    mockApiSupportLink.mockResolvedValue([
      { supporter_user: USER_ID, status: 'active', patient_profile: 'p3', patient_name: 'pat1' },
    ]);
    await expect(apiSharedAppointments()).resolves.toEqual([
      { id: 1, patient_profile: 'p3', patientName: 'pat1' },
      { id: 2, patient_profile: 'p4', patientName: '' },
    ]);
  });
});

describe('apiSaveAnswer', () => {
  test('creates an answer for the question when there is none', async () => {
    mockApiAppointmentAnswer.mockResolvedValue({ id: 5 });
    await expect(apiSaveAnswer(3, undefined, { text: 'placeholder A' })).resolves.toEqual({ id: 5 });
    expect(mockApiAppointmentAnswer).toHaveBeenCalledWith('create', { question: 3, text: 'placeholder A' });
  });

  test('updates the answer when it already has one', async () => {
    await apiSaveAnswer(3, 5, { text: '' });
    expect(mockApiAppointmentAnswer).toHaveBeenCalledWith('update', { id: 5, text: '' });
  });

  test('a recording is sent as a file with its name and audio type', async () => {
    await apiSaveAnswer(3, 5, { recording: 'file:///cache/recording1.m4a' });
    expect(calls(mockApiAppointmentAnswer, 'update').map((values) => values.recording_file)).toEqual([
      { uri: 'file:///cache/recording1.m4a', name: 'recording1.m4a', type: 'audio/m4a' },
    ]);
  });

  test("null removes the recording, values left out aren't sent", async () => {
    await apiSaveAnswer(3, 5, { recording: null });
    await apiSaveAnswer(3, undefined);
    expect(mockApiAppointmentAnswer).toHaveBeenNthCalledWith(1, 'update', { id: 5, recording_file: null });
    expect(mockApiAppointmentAnswer).toHaveBeenNthCalledWith(2, 'create', { question: 3 });
  });
});

describe('apiSaveOwnQuestions', () => {
  beforeEach(() => {
    mockApiAppointmentQuestion.mockImplementation(async (operation: string) =>
      operation === 'select'
        ? [
            { id: 1, text: 'Kept', created_by: USER_ID },
            { id: 2, text: 'Old text', created_by: USER_ID },
            { id: 3, text: 'Removed', created_by: USER_ID },
            { id: 4, text: 'Supporter question', created_by: 'u2' },
            { id: 5, text: 'Other removed', created_by: 'u2' },
          ]
        : {},
    );
  });

  test('deletes own questions no longer listed, creates new ones in order, updates changed text', async () => {
    await apiSaveOwnQuestions(10, [
      { id: 1, text: 'Kept', source: 'patient' },
      { text: 'New first', source: 'patient' },
      { id: 2, text: 'New text', source: 'patient' },
      { text: 'New second', source: 'suggested' },
    ]);
    expect(mockApiAppointmentQuestion).toHaveBeenCalledWith('select', { appointment: 10 });
    expect(calls(mockApiAppointmentQuestion, 'delete')).toEqual([{ id: 3 }]);
    expect(calls(mockApiAppointmentQuestion, 'update')).toEqual([{ id: 2, text: 'New text' }]);
    expect(calls(mockApiAppointmentQuestion, 'create')).toEqual([
      { appointment: 10, text: 'New first', source: 'patient' },
      { appointment: 10, text: 'New second', source: 'suggested' },
    ]);
  });

  test("other people's questions are never changed or deleted", async () => {
    await apiSaveOwnQuestions(10, [
      { id: 1, text: 'Kept', source: 'patient' },
      { id: 2, text: 'Old text', source: 'patient' },
      { id: 3, text: 'Removed', source: 'patient' },
      { id: 4, text: 'Changed by patient', source: 'support' },
    ]);
    expect(mockApiAppointmentQuestion).toHaveBeenCalledTimes(1);
  });
});

describe('apiPainSummary', () => {
  beforeEach(() => {
    mockApiQuestionOption.mockResolvedValue([
      { id: 1, text: 'Back' },
      { id: 2, text: 'Knee' },
    ]);
  });

  // given {week: pain({...})}, set API call values, storing assessment id as week
  function weeks(records: Record<string, any>) {
    mockApiAssessment.mockResolvedValue(
      Object.keys(records)
        .sort()
        .map((week) => ({ id: week, week_starting: week })),
    );
    // if the assessment (week) exists, return it
    mockApiMyPain.mockImplementation(async (_operation: string, { assessment }: any) =>
      records[assessment] ? [records[assessment]] : [],
    );
  }

  test('no profile gives only an empty location list', async () => {
    signedInAs(null);
    await expect(apiPainSummary()).resolves.toEqual({ locations: [] });
    expect(mockApiAssessment).not.toHaveBeenCalled();
  });

  test("uses the given patient's profile instead of the user's", async () => {
    weeks({});
    await apiPainSummary('p3');
    expect(mockApiUser).not.toHaveBeenCalled();
    expect(mockApiAssessment).toHaveBeenCalledWith('select', { patient_profile: 'p3' });
    expect(mockApiQuestionOption).toHaveBeenCalledWith('select', {
      app_section: 'my_pain',
      question_key: 'pain_location',
    });
  });

  test('values come from the newest week that has them, weeks with no record are skipped', async () => {
    weeks({
      '2026-10-05': pain({ locations: [1], worst: 9, mildest: 1, current: 4, average: 2 }),
      '2026-10-12': pain({ locations: [2, 3], other_location: 'Neck', average: 5, worst: 7 }),
      '2026-10-19': null,
      '2026-10-26': pain({ current: 6 }),
    });
    await expect(apiPainSummary()).resolves.toEqual({
      locations: ['Knee', 'Neck'],
      average: 4,
      worst: 7,
      mildest: 1,
      current: 6,
    });
  });

  test('average of the 2 most recent averages, rounded, or the only one', async () => {
    weeks({
      '2026-10-05': pain({ average: 1 }),
      '2026-10-12': pain({ average: 4 }),
      '2026-10-19': pain({ average: 7 }),
    });
    await expect(apiPainSummary()).resolves.toMatchObject({ average: 6 });

    weeks({ '2026-10-05': pain({ average: 3 }) });
    await expect(apiPainSummary()).resolves.toEqual({ locations: [], average: 3 });
  });

  test('stops loading weeks once every value is found', async () => {
    const full = { locations: [1], average: 5, worst: 8, mildest: 2, current: 3 };
    weeks({ '2026-10-05': pain(full), '2026-10-12': pain(full), '2026-10-19': pain(full) });
    await apiPainSummary();
    expect(mockApiMyPain.mock.calls.map(([, values]) => values.assessment)).toEqual([
      '2026-10-19',
      '2026-10-12',
    ]);
  });
});

describe('apiAppointmentDetails', () => {
  const appointment = {
    id: 10,
    patient_profile: 'p3',
    created_by: 'u3',
    doctor: 'Dr',
    doctor_permission: true,
    doctor_signature: 'data:image',
  };

  beforeEach(() => {
    mockApiAppointment.mockResolvedValue(appointment);
    mockApiAppointmentQuestion.mockResolvedValue([
      { id: 1, text: 'placeholder Q', source: 'patient', created_by: 'u3', answer: null },
      {
        id: 2, text: 'placeholder support Q', source: 'support', created_by: USER_ID,
        answer: { id: 9, text: 'placeholder Q', recording_file: 'http:///recording.m4a' },
      },
      { id: 3, text: 'empty', source: 'suggested', created_by: 'u3', 
        answer: { id: 8, text: '', recording_file: null } },
    ]);
    mockApiAppointmentAccess.mockResolvedValue([
      { support_link: 100, revoked_at: null, can_add_questions: true, 
        can_record_answers: false },
      { support_link: 101, revoked_at: '2026-10-01T00:00:00Z', can_add_questions: true, 
        can_record_answers: true },
      { support_link: 102, revoked_at: null, can_add_questions: false, can_record_answers: true },
    ]);
    mockApiSupportLink.mockResolvedValue([
      { id: 100, patient_profile: 'p3', patient_name: 'p3', supporter_user: USER_ID, 
        supporter_name: PROFILE_ID, invited_phone_number: '+61412345678', status: 'active', },
    ]);
  });

  test('questions with their answers, marking those added by someone else', async () => {
    const details = await apiAppointmentDetails(10);
    expect(mockApiAppointment).toHaveBeenCalledWith('select', { id: 10 });
    expect(details.questions).toEqual([
      { id: 1, text: 'placeholder Q', source: 'patient', addedBy: undefined,
        answerId: undefined, answer: undefined, recording: undefined },
      { id: 2, text: 'placeholder support Q', source: 'support', addedBy: 'support',
        answerId: 9, answer: 'placeholder Q', recording: 'http:///recording.m4a' },
      { id: 3, text: 'empty', source: 'suggested', addedBy: undefined,
        answerId: 8, answer: undefined, recording: undefined },
    ]);
  });

  test('support people with live access only, blank name & phone without a link', async () => {
    const details = await apiAppointmentDetails(10);
    expect(details.supportPeople).toEqual([
      // current user as supporter
      { name: PROFILE_ID, phone: '+61412345678', canAddQuestions: true, canAddAnswers: false, supportLinkId: 100 },
      // another supporter user for the same appointment (link isn't visible)
      { name: '', phone: '', canAddQuestions: false, canAddAnswers: true, supportLinkId: 102 },
    ]);
  });

  test("doctor's permission, patient name and id", async () => {
    await expect(apiAppointmentDetails(10)).resolves.toMatchObject({
      doctor: 'Dr',
      doctorPermission: true,
      doctorSignature: 'data:image',
      patientId: 'p3',
      patientName: 'p3',
      canAddQuestions: true,
      canAddAnswers: false,
    });
    // p4 is missing a support link, show fallback values
    mockApiAppointment.mockResolvedValue({ ...appointment, patient_profile: 'p4', doctor_signature: '' });
    await expect(apiAppointmentDetails(10)).resolves.toMatchObject({
      doctorSignature: undefined,
      patientName: '',
    });
  });

  test("the user's own access only counts once their link is active", async () => {
    mockApiSupportLink.mockResolvedValue([
      { id: 100, patient_profile: 'p3', patient_name: 'p3', supporter_user: USER_ID, status: 'pending' },
    ]);
    await expect(apiAppointmentDetails(10)).resolves.toMatchObject({
      canAddQuestions: false,
      canAddAnswers: false,
    });
  });
});

describe('apiMySupportLinks', () => {
  test('leaves out revoked links', async () => {
    mockApiSupportLink.mockResolvedValue([
      { id: 1, status: 'active' },
      { id: 2, status: 'pending' },
      { id: 3, status: 'revoked' },
    ]);
    await expect(apiMySupportLinks()).resolves.toEqual([
      { id: 1, status: 'active' },
      { id: 2, status: 'pending' },
    ]);
    expect(mockApiSupportLink).toHaveBeenCalledWith('select', { patient_profile: PROFILE_ID });
  });

  test('empty list when the user has no profile', async () => {
    signedInAs(null);
    await expect(apiMySupportLinks()).resolves.toEqual([]);
    expect(mockApiSupportLink).not.toHaveBeenCalled();
  });
});

describe('normalisePhoneNumber', () => {
  test('04 and 614 mobile numbers, ignoring spaces & dashes', () => {
    expect(normalisePhoneNumber('0412 345 678')).toBe('+61412345678');
    expect(normalisePhoneNumber('0412-345-678')).toBe('+61412345678');
    expect(normalisePhoneNumber('+61 412 345 678')).toBe('+61412345678');
    expect(normalisePhoneNumber('61412345678')).toBe('+61412345678');
  });

  test('null for anything else', () => {
    expect(normalisePhoneNumber('')).toBeNull();
    expect(normalisePhoneNumber('0412 345 67')).toBeNull();
    expect(normalisePhoneNumber('02 9876 5432')).toBeNull();
    expect(normalisePhoneNumber('+61 2 9876 5432')).toBeNull();
    expect(normalisePhoneNumber('+1 412 345 6789')).toBeNull();
  });
});

describe('apiSaveAppointment', () => {
  const date = new Date('2026-11-03T10:00:00Z');

  test('creates the appointment the first time', async () => {
    mockApiAppointment.mockResolvedValue({ id: 10 });
    await expect(
      apiSaveAppointment(null, { scheduledDate: date, doctor: 'Dr', healthService: 'Physiotherapist' }),
    ).resolves.toEqual({ id: 10 });
    expect(mockApiAppointment).toHaveBeenCalledWith('create', {
      scheduled_date: '2026-11-03T10:00:00.000Z',
      doctor: 'Dr',
      health_service: 'Physiotherapist',
    });
  });

  test('updates after, leaving out a missing date & health service', async () => {
    await apiSaveAppointment(10, { scheduledDate: undefined, doctor: 'Dr', healthService: null });
    expect(mockApiAppointment).toHaveBeenCalledWith('update', {
      id: 10,
      scheduled_date: undefined,
      doctor: 'Dr',
      health_service: undefined,
    });
  });
});

describe('apiSaveSupportPeople', () => {
  let nextLinkId: number;

  // add same permissions for every person()
  function person(values: any) {
    return { canAddQuestions: false, canAddAnswers: false, ...values };
  }

  beforeEach(() => {
    nextLinkId = 200;
    mockApiAppointment.mockResolvedValue({ id: 10, patient_profile: PROFILE_ID });
    mockApiSupportLink.mockImplementation(async (operation: string) =>
      operation === 'select'
        ? [
            { id: 100, patient_profile: PROFILE_ID, status: 'active', invited_phone_number: '+61412345678' },
            { id: 101, patient_profile: PROFILE_ID, status: 'revoked', invited_phone_number: '+61411111111' },
            { id: 102, patient_profile: 'p2', status: 'active', invited_phone_number: '+61422222222' },
            { id: 103, patient_profile: PROFILE_ID, status: 'pending', invited_phone_number: '' },
          ]
        : { id: nextLinkId++ },
    );
    mockApiAppointmentAccess.mockImplementation(async (operation: string) =>
      operation === 'select'
        ? [
            { id: 1, support_link: 100, revoked_at: null },
            { id: 2, support_link: 103, revoked_at: null },
            { id: 3, support_link: 104, revoked_at: '2026-10-01T00:00:00Z' },
          ]
        : {},
    );
  });

  test('reuses picked links and links with the same phone number, invites new numbers once', async () => {
    const ids = await apiSaveSupportPeople(10, [
      person({ supportLinkId: 103 }),
      person({ phone: '0412 345 678' }),
      person({ phone: '0433 333 333' }),
      person({ phone: '+61 433 333 333' }),
    ]);
    expect(ids).toEqual([103, 100, 200, 200]);
    expect(calls(mockApiSupportLink, 'create')).toEqual([{ invited_phone_number: '+61433333333' }]);
  });

  test("doesn't reuse revoked links or other patients' links", async () => {
    const ids = await apiSaveSupportPeople(10, [
      person({ phone: '0411 111 111' }),
      person({ phone: '0422 222 222' }),
    ]);
    expect(ids).toEqual([200, 201]);
    expect(calls(mockApiSupportLink, 'create')).toEqual([
      { invited_phone_number: '+61411111111' },
      { invited_phone_number: '+61422222222' },
    ]);
  });

  test('a number that isn\'t a mobile is sent as typed for the server to refuse', async () => {
    await apiSaveSupportPeople(10, [person({ phone: '02 9876 5432' })]);
    expect(calls(mockApiSupportLink, 'create')).toEqual([{ invited_phone_number: '02 9876 5432' }]);
  });

  test('gives each person their access and revokes the access of people removed', async () => {
    await apiSaveSupportPeople(10, [
      person({ supportLinkId: 100, canAddQuestions: true }),
      person({ phone: '0433 333 333', canAddAnswers: true }),
    ]);
    expect(calls(mockApiAppointmentAccess, 'create')).toEqual([
      { appointment: 10, support_link: 100, can_add_questions: true, can_record_answers: false },
      { appointment: 10, support_link: 200, can_add_questions: false, can_record_answers: true },
    ]);
    // remove support link 103
    expect(calls(mockApiAppointmentAccess, 'delete')).toEqual([{ appointment: 10, id: 2 }]);
  });

  test('a refused invite stops the save', async () => {
    mockApiSupportLink.mockImplementation(async (operation: string) => {
      if (operation === 'select') {
        return [];
      }
      throw { data: { invited_phone_number: ['Enter valid mobile number.'] } };
    });
    await expect(apiSaveSupportPeople(10, [person({ phone: '123' })])).rejects.toEqual({
      data: { invited_phone_number: ['Enter valid mobile number.'] },
    });
    expect(calls(mockApiAppointmentAccess, 'create')).toEqual([]);
    expect(calls(mockApiAppointmentAccess, 'delete')).toEqual([]);
  });
});
