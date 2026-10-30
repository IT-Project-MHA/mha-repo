/** Unit tests for the My Health API helpers
 * 
 * Test plan: Pain Profile, Weekly Sections, Section Summary, Pain graphs.
 * 
 * Tests cover:
 *
 *  apiAboutMe:
 *    - returns the name, sex label and age group
 *    - blank sex and age group when there is no profile or no birth year
 *    - every age band boundary
 * 
 *  apiMyConditions:
 *    - joins the chosen pain type names and returns the other conditions text
 *    - blank values when null or when the user has no profile
 * 
 *  apiAnsweredSections:
 *    - only the sections that have a record for that week
 *    - empty for a week with nothing answered, an unknown week, no profile or no week
 *    - uses the user's own profile, or the given patient's when a supporter is viewing
 * 
 *  apiMyPainSummary:
 *    - no week given: most recent week, skipping weeks with no record
 *    - week given: that exact week, averaging only with earlier weeks
 *    - averages the two most recent non-null averages, null when none
 *    - location and characteristics join the options with the user's own text
 *    - empty summary for an unknown week or no profile
 * 
 *  Movement, Personal Care, Social Health and Management summaries:
 *    - turn saved option ids into text (medication lists prescriptions, then over the counter)
 *    - fall back to the most recent week with no week given, but not when a week is given
 *    - empty summary when there is no record
 * 
 *  apiScoreHistory:
 *    - pain uses the weekly average, other areas use their score
 *    - oldest first, weeks with no value left out, a score of 0 is kept
 *    - unknown area throws, no profile gives an empty list
 *    - uses the given patient's profile, and the fake data when switched on
 * 
 *  apiPainDetailHistory:
 *    - each week with worst, mildest and location names, oldest first
 *    - empty list when the user has no profile
 */

// ----- Mocks -----
const mockApiAssessment = jest.fn();
const mockApiMyPain = jest.fn();
const mockApiPainTrend = jest.fn();
const mockApiMyMovement = jest.fn();
const mockApiMyPersonalCare = jest.fn();
const mockApiMySocialHealth = jest.fn();
const mockApiMyManagement = jest.fn();
const mockApiQuestionOption = jest.fn();
const mockApiQuestionOptionOrdered = jest.fn();
const mockApiPrescription = jest.fn();
const mockApiUser = jest.fn();
const mockApiPatientProfile = jest.fn();
const mockApiAssignedGender = jest.fn();
jest.mock('../../api/django-API', () => ({
  apiAssessment: (...a: any[]) => mockApiAssessment(...a),
  apiMyPain: (...a: any[]) => mockApiMyPain(...a),
  apiPainTrend: (...a: any[]) => mockApiPainTrend(...a),
  apiMyMovement: (...a: any[]) => mockApiMyMovement(...a),
  apiMyPersonalCare: (...a: any[]) => mockApiMyPersonalCare(...a),
  apiMySocialHealth: (...a: any[]) => mockApiMySocialHealth(...a),
  apiMyManagement: (...a: any[]) => mockApiMyManagement(...a),
  apiQuestionOption: (...a: any[]) => mockApiQuestionOption(...a),
  apiQuestionOptionOrdered: (...a: any[]) => mockApiQuestionOptionOrdered(...a),
  apiPrescription: (...a: any[]) => mockApiPrescription(...a),
  apiUser: (...a: any[]) => mockApiUser(...a),
  apiPatientProfile: (...a: any[]) => mockApiPatientProfile(...a),
  apiAssignedGender: (...a: any[]) => mockApiAssignedGender(...a),
}));

const mockOwnPatientProfileId = jest.fn();
jest.mock('../../api/care_planner_api_helpers', () => ({
  ownPatientProfileId: () => mockOwnPatientProfileId(),
}));

import {
  apiAboutMe,
  apiMyConditions,
  apiAnsweredSections,
  apiMyPainSummary,
  apiMovementSummary,
  apiPainLocations,
  apiPersonalCareSummary,
  apiSocialHealthSummary,
  apiManagementSummary,
  apiScoreHistory,
  apiPainDetailHistory,  
} from '../../api/my_health_api_helpers';

// ----- Test data -----
// three weeks, newest first
const A1 = { id: 'a1', week_starting: '2026-03-02' };
const A2 = { id: 'a2', week_starting: '2026-02-23' };
const A3 = { id: 'a3', week_starting: '2026-02-16' };

// makes a mock that returns the row for the assessment it is asked about (or none)
const rowsBy = (table: Record<string, object>) => async (_action: string, params: { assessment: string }) =>
  table[params.assessment] ? [table[params.assessment]] : [];

// option text for the ordered questions (ids are unique across sections)
const orderedOptions: Record<string, { id: number; text: string }[]> = {
  movement_general_impacts: [{ id: 1, text: 'Stairs' }, { id: 2, text: 'Driving' }],
  movement_walking: [{ id: 10, text: 'Limited' }],
  movement_sitting: [{ id: 20, text: 'Short periods' }],
  movement_lifting: [{ id: 30, text: 'Light only' }],
  movement_standing: [{ id: 40, text: 'Briefly' }],
  care_general_impacts: [{ id: 3, text: 'Cooking' }],
  care_personal_care: [{ id: 50, text: 'Needs help' }],
  care_sleeping: [{ id: 51, text: 'Wakes often' }],
  social_social_life: [{ id: 60, text: 'Goes out less' }],
  social_travelling: [{ id: 61, text: 'Avoids long trips' }],
  management_exercise: [{ id: 70, text: 'Walking' }],
};

beforeEach(() => {
  jest.resetAllMocks();
  mockOwnPatientProfileId.mockResolvedValue('profile-1');
  mockApiAssessment.mockResolvedValue([A1, A2, A3]);
  mockApiQuestionOptionOrdered.mockImplementation(
    async (_a: string, p: { question_key: string }) => orderedOptions[p.question_key] ?? []
  );
});

// --- Pain profile: about me and conditions ------------------------------------

describe('apiAboutMe', () => {
  const thisYear = new Date().getFullYear();

  beforeEach(() => {
    mockApiUser.mockResolvedValue([{ id: 'u1', display_name: 'Jane Doe' }]);
    mockApiAssignedGender.mockResolvedValue([{ value: 'female', label: 'Female' }]);
  });

  test('returns the name, the sex label and the age group', async () => {
    mockApiPatientProfile.mockResolvedValue([{ assigned_gender_at_birth: 'female', birth_year: thisYear - 30 }]);
    expect(await apiAboutMe()).toEqual({
      name: 'Jane Doe',
      sex: 'Female',
      ageGroup: 'Middle Adult (25-44 years)',
    });
  });

  test('sex and age group are blank when the user has no profile', async () => {
    mockApiPatientProfile.mockResolvedValue([]);
    expect(await apiAboutMe()).toEqual({ name: 'Jane Doe', sex: '', ageGroup: '' });
  });

  test('age group is blank when there is no birth year', async () => {
    mockApiPatientProfile.mockResolvedValue([{ assigned_gender_at_birth: 'female', birth_year: null }]);
    expect((await apiAboutMe()).ageGroup).toBe('');
  });

  test.each([
    [14, 'Youth (14 years and younger)'],
    [15, 'Young Adult (15-24 years)'],
    [24, 'Young Adult (15-24 years)'],
    [25, 'Middle Adult (25-44 years)'],
    [44, 'Middle Adult (25-44 years)'],
    [45, 'Older Adult (45-64 years)'],
    [64, 'Older Adult (45-64 years)'],
    [65, 'Retirement (65 years and older)'],
  ])('age %i is in the band "%s"', async (age, label) => {
    mockApiPatientProfile.mockResolvedValue([{ assigned_gender_at_birth: 'female', birth_year: thisYear - age }]);
    expect((await apiAboutMe()).ageGroup).toBe(label);
  });
});

describe('apiMyConditions', () => {
  beforeEach(() => {
    mockApiUser.mockResolvedValue([{ id: 'u1' }]);
    mockApiQuestionOption.mockResolvedValue([
      { id: 1, text: 'Back pain' },
      { id: 2, text: 'Arthritis' },
    ]);
  });

  test('joins the chosen pain type names and returns the other conditions text', async () => {
    mockApiPatientProfile.mockResolvedValue([{ pain_types: [1, 2, 99], other_conditions: 'Asthma' }]);
    expect(await apiMyConditions()).toEqual({
      primaryCondition: 'Back pain, Arthritis', // the unknown id 99 is dropped
      otherConditions: 'Asthma',
    });
  });

  test('other conditions is blank when null', async () => {
    mockApiPatientProfile.mockResolvedValue([{ pain_types: [], other_conditions: null }]);
    expect(await apiMyConditions()).toEqual({ primaryCondition: '', otherConditions: '' });
  });

  test('both are blank when the user has no profile', async () => {
    mockApiPatientProfile.mockResolvedValue([]);
    expect(await apiMyConditions()).toEqual({ primaryCondition: '', otherConditions: '' });
  });
});

// --- Answered sections --------------------------------------------------------

describe('apiAnsweredSections', () => {
  beforeEach(() => {
    mockApiMyPain.mockImplementation(rowsBy({ a1: { id: 1 } }));
    mockApiMyMovement.mockImplementation(rowsBy({ a1: { id: 1 } }));
    mockApiMyPersonalCare.mockImplementation(rowsBy({}));
    mockApiMySocialHealth.mockImplementation(rowsBy({}));
    mockApiMyManagement.mockImplementation(rowsBy({}));
  });

  test('returns only the sections that have a record for that week', async () => {
    const result = await apiAnsweredSections('profile-1', '2026-03-02');
    expect([...result].sort()).toEqual(['my_movement', 'my_pain']);
  });

  test('a week with nothing answered gives an empty list', async () => {
    expect(await apiAnsweredSections('profile-1', '2026-02-23')).toEqual([]);
  });

  test('a week the user has no assessment for gives an empty list', async () => {
    expect(await apiAnsweredSections('profile-1', '2020-01-06')).toEqual([]);
  });

  test('uses the logged-in user\'s own profile when none is given', async () => {
    await apiAnsweredSections(undefined, '2026-03-02');
    expect(mockOwnPatientProfileId).toHaveBeenCalled();
    expect(mockApiAssessment).toHaveBeenCalledWith('select', { patient_profile: 'profile-1' });
  });

  test('uses the given profile (a supporter viewing a patient) instead of their own', async () => {
    await apiAnsweredSections('patient-9', '2026-03-02');
    expect(mockOwnPatientProfileId).not.toHaveBeenCalled();
    expect(mockApiAssessment).toHaveBeenCalledWith('select', { patient_profile: 'patient-9' });
  });

  test('gives an empty list with no profile or no week', async () => {
    mockOwnPatientProfileId.mockResolvedValue(null);
    expect(await apiAnsweredSections(undefined, '2026-03-02')).toEqual([]);
    expect(await apiAnsweredSections('profile-1', '')).toEqual([]);
  });
});

// --- Pain summary -------------------------------------------------------------

describe('apiMyPainSummary', () => {
  const row = (over: object) => ({
    average: 6,
    current: 5,
    worst: 8,
    mildest: 2,
    locations: [1],
    other_location: '',
    characteristics: [10],
    other_characteristic: '',
    ...over,
  });

  beforeEach(() => {
    mockApiQuestionOption.mockImplementation(async (_a: string, p: { question_key: string }) =>
      p.question_key === 'pain_location'
        ? [{ id: 1, text: 'Lower back' }, { id: 2, text: 'Shoulder' }]
        : [{ id: 10, text: 'Burning' }, { id: 11, text: 'Aching' }]
    );
  });

  test('with no week given, uses the most recent week and averages its average with the one before', async () => {
    mockApiMyPain.mockImplementation(rowsBy({ a1: row({ average: 6 }), a2: row({ average: 4 }) }));
    const result = await apiMyPainSummary();
    expect(result).toMatchObject({ current: 5, worst: 8, mildest: 2, average: 5 }); // (6 + 4) / 2
  });

  test('with no week given, skips newer weeks that have no pain record', async () => {
    mockApiMyPain.mockImplementation(rowsBy({ a2: row({ average: 4, current: 3 }) }));
    const result = await apiMyPainSummary();
    expect(result).toMatchObject({ current: 3, average: 4 });
  });

  test('with a week given, uses that exact week and only earlier weeks for the average', async () => {
    mockApiMyPain.mockImplementation(
      rowsBy({ a1: row({ average: 9 }), a2: row({ average: 4, current: 3 }), a3: row({ average: 2 }) })
    );
    const result = await apiMyPainSummary(undefined, '2026-02-23');
    expect(result).toMatchObject({ current: 3, average: 3 }); // (4 + 2) / 2, not including the newer week
  });

  test('non-null averages only: a null average is skipped', async () => {
    mockApiMyPain.mockImplementation(
      rowsBy({ a1: row({ average: 6 }), a2: row({ average: null }), a3: row({ average: 2 }) })
    );
    expect((await apiMyPainSummary()).average).toBe(4); // (6 + 2) / 2
  });

  test('average is null when no week has one', async () => {
    mockApiMyPain.mockImplementation(rowsBy({ a1: row({ average: null }) }));
    expect((await apiMyPainSummary()).average).toBeNull();
  });

  test('a week the user has no assessment for gives the empty summary', async () => {
    mockApiMyPain.mockImplementation(rowsBy({ a1: row({}) }));
    expect(await apiMyPainSummary(undefined, '2020-01-06')).toEqual({
      location: '',
      current: null,
      average: null,
      worst: null,
      mildest: null,
      characteristics: '',
    });
  });

  test('location and characteristics join the chosen options with the user\'s own extra text', async () => {
    mockApiMyPain.mockImplementation(
      rowsBy({
        a1: row({
          locations: [1, 2],
          other_location: 'Jaw',
          characteristics: [10, 11],
          other_characteristic: 'Tingling',
        }),
      })
    );
    const result = await apiMyPainSummary();
    expect(result.location).toBe('Lower back, Shoulder, Jaw');
    expect(result.characteristics).toBe('Burning, Aching, Tingling');
  });

  test('gives the empty summary when the user has no profile', async () => {
    mockOwnPatientProfileId.mockResolvedValue(null);
    expect((await apiMyPainSummary()).current).toBeNull();
    expect(mockApiAssessment).not.toHaveBeenCalled();
  });
});

// --- Other section summaries --------------------------------------------------

describe('apiMovementSummary', () => {
  const record = {
    active_hours: 6,
    general_impacts: [1, 2],
    walking: 10,
    sitting: 20,
    lifting: 30,
    standing: 40,
  };

  test('turns the saved option ids into their text', async () => {
    mockApiMyMovement.mockImplementation(rowsBy({ a1: record }));
    expect(await apiMovementSummary()).toEqual({
      activeHours: 6,
      general: 'Stairs, Driving',
      walking: 'Limited',
      lifting: 'Light only',
      sitting: 'Short periods',
      standing: 'Briefly',
    });
  });

  test('with no week given, falls back to the most recent week that has a record', async () => {
    mockApiMyMovement.mockImplementation(rowsBy({ a2: record }));
    expect((await apiMovementSummary()).walking).toBe('Limited');
  });

  test('with a week given, does not fall back to other weeks', async () => {
    mockApiMyMovement.mockImplementation(rowsBy({ a2: record }));
    expect(await apiMovementSummary(undefined, '2026-03-02')).toEqual({
      activeHours: null,
      general: '',
      walking: '',
      lifting: '',
      sitting: '',
      standing: '',
    });
  });
});

describe('apiPersonalCareSummary', () => {
  test('turns the saved option ids into their text', async () => {
    mockApiMyPersonalCare.mockImplementation(
      rowsBy({ a1: { general_activities_impact: [3], personal_care: 50, sleeping: 51 } })
    );
    expect(await apiPersonalCareSummary()).toEqual({
      general: 'Cooking',
      personalCare: 'Needs help',
      sleeping: 'Wakes often',
    });
  });

  test('gives the empty summary when there is no record', async () => {
    mockApiMyPersonalCare.mockImplementation(rowsBy({}));
    expect(await apiPersonalCareSummary()).toEqual({ general: '', personalCare: '', sleeping: '' });
  });
});

describe('apiSocialHealthSummary', () => {
  test('returns option text and the 0-10 ratings, with null for a missing rating', async () => {
    mockApiMySocialHealth.mockImplementation(
      rowsBy({ a1: { social_life: 60, travelling: 61, mood: 7, relationships: null, enjoyment_of_life: 5 } })
    );
    expect(await apiSocialHealthSummary()).toEqual({
      socialLife: 'Goes out less',
      travelling: 'Avoids long trips',
      mood: 7,
      relationships: null,
      enjoyment: 5,
    });
  });
});

describe('apiManagementSummary', () => {
  test('medication lists the chosen prescriptions by name, then any over the counter medication', async () => {
    mockApiPrescription.mockResolvedValue([
      { id: 1, name: 'Panadol' },
      { id: 2, name: 'Ibuprofen' },
    ]);
    mockApiMyManagement.mockImplementation(
      rowsBy({ a1: { medication: [1, 2], otc_medication: 'Antacid', exercise: 70, emotion: 'Calm' } })
    );
    expect(await apiManagementSummary()).toEqual({
      medication: 'Panadol, Ibuprofen, Antacid',
      exercise: 'Walking',
      emotion: 'Calm',
    });
  });

  test('gives the empty summary when there is no record', async () => {
    mockApiPrescription.mockResolvedValue([]);
    mockApiMyManagement.mockImplementation(rowsBy({}));
    expect(await apiManagementSummary()).toEqual({ medication: '', exercise: '', emotion: '' });
  });
});

// --- Chart history ------------------------------------------------------------

describe('apiScoreHistory', () => {
  test('pain plots the weekly average, oldest first, leaving out weeks with no value', async () => {
    mockApiMyPain.mockImplementation(rowsBy({ a1: { average: 6 }, a2: { average: null }, a3: { average: 3 } }));
    expect(await apiScoreHistory('pain')).toEqual([
      { completedAt: '2026-02-16', score: 3 },
      { completedAt: '2026-03-02', score: 6 },
    ]);
  });

  test('other areas plot their score', async () => {
    mockApiMyMovement.mockImplementation(rowsBy({ a1: { score: 7 }, a3: { score: 4 } }));
    expect(await apiScoreHistory('movement')).toEqual([
      { completedAt: '2026-02-16', score: 4 },
      { completedAt: '2026-03-02', score: 7 },
    ]);
  });

  test('a score of 0 is kept (no pain is real data)', async () => {
    mockApiMyPain.mockImplementation(rowsBy({ a1: { average: 0 } }));
    expect(await apiScoreHistory('pain')).toEqual([{ completedAt: '2026-03-02', score: 0 }]);
  });

  test('an unknown area throws', async () => {
    await expect(apiScoreHistory('bogus')).rejects.toThrow('Unknown assessment area: bogus');
  });

  test('gives an empty list when the user has no profile', async () => {
    mockOwnPatientProfileId.mockResolvedValue(null);
    expect(await apiScoreHistory('pain')).toEqual([]);
    expect(mockApiAssessment).not.toHaveBeenCalled();
  });

  test('uses the given profile (a supporter viewing a patient) instead of their own', async () => {
    mockApiMyPain.mockImplementation(rowsBy({}));
    await apiScoreHistory('pain', 'patient-9');
    expect(mockOwnPatientProfileId).not.toHaveBeenCalled();
    expect(mockApiAssessment).toHaveBeenCalledWith('select', { patient_profile: 'patient-9' });
  });

});

describe('apiPainDetailHistory (server does the filtering)', () => {
  // a week as painTrend returns it
  const week = (week_starting: string, average: number | null, worst = 8, mildest = 2) => ({
    week_starting,
    current: 5,
    average,
    worst,
    mildest,
    locations: ['loc-1'],
  });

  test('asks the server for the user\'s own weeks, passing the days and location', async () => {
    mockApiPainTrend.mockResolvedValue([]);
    await apiPainDetailHistory(undefined, 30, 'loc-1');
    expect(mockOwnPatientProfileId).toHaveBeenCalled();
    expect(mockApiPainTrend).toHaveBeenCalledWith('select', {
      patient_profile: 'profile-1',
      days: 30,
      location: 'loc-1',
    });
  });

  test('with no days or location, asks for all time and all locations', async () => {
    mockApiPainTrend.mockResolvedValue([]);
    await apiPainDetailHistory();
    const params = mockApiPainTrend.mock.calls[0][1];
    expect(params.days ?? null).toBeNull();
    expect(params.location ?? null).toBeNull();
  });

  test('maps the server weeks to completedAt, score, worst and mildest, in the server\'s order', async () => {
    mockApiPainTrend.mockResolvedValue([
      week('2026-02-16', 3, 5, 1),
      week('2026-03-02', 6, 8, 2),
    ]);
    expect(await apiPainDetailHistory()).toEqual([
      { completedAt: '2026-02-16', score: 3, worst: 5, mildest: 1 },
      { completedAt: '2026-03-02', score: 6, worst: 8, mildest: 2 },
    ]);
  });

  test('leaves out weeks with no average, but keeps a score of 0', async () => {
    mockApiPainTrend.mockResolvedValue([
      week('2026-02-16', null),
      week('2026-02-23', 0),
      week('2026-03-02', 6),
    ]);
    const result = await apiPainDetailHistory();
    expect(result.map((p: any) => p.score)).toEqual([0, 6]);
  });

  test('uses the given profile (a supporter viewing a patient) instead of their own', async () => {
    mockApiPainTrend.mockResolvedValue([]);
    await apiPainDetailHistory('patient-9', 30);
    expect(mockOwnPatientProfileId).not.toHaveBeenCalled();
    expect(mockApiPainTrend).toHaveBeenCalledWith(
      'select',
      expect.objectContaining({ patient_profile: 'patient-9', days: 30 })
    );
  });

  test('gives an empty list without calling the server when the user has no profile', async () => {
    mockOwnPatientProfileId.mockResolvedValue(null);
    expect(await apiPainDetailHistory()).toEqual([]);
    expect(mockApiPainTrend).not.toHaveBeenCalled();
  });

});

describe('apiPainLocations', () => {
  test('lists every pain location option as id and label', async () => {
    mockApiQuestionOption.mockResolvedValue([
      { id: 'loc-1', text: 'Lower back' },
      { id: 'loc-2', text: 'Shoulder' },
    ]);
    expect(await apiPainLocations()).toEqual([
      { id: 'loc-1', label: 'Lower back' },
      { id: 'loc-2', label: 'Shoulder' },
    ]);
    expect(mockApiQuestionOption).toHaveBeenCalledWith('select', {
      app_section: 'my_pain',
      question_key: 'pain_location',
    });
  });
});