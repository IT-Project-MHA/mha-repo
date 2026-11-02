/** Unit tests for my_pain_api_helpers. For each of the five sections:
 *    - load returns the assessment's saved record, or null when the section hasn't been done
 *    - save creates a record when there is none, and updates the existing one when there is
 *    - save stamps completed_at
 */

const mockApis: Record<string, jest.Mock> = {
  pain: jest.fn(),
  movement: jest.fn(),
  personalCare: jest.fn(),
  socialHealth: jest.fn(),
  management: jest.fn(),
};
jest.mock('@/api/django-API', () => ({
  apiMyPain: (...a: any[]) => mockApis.pain(...a),
  apiMyMovement: (...a: any[]) => mockApis.movement(...a),
  apiMyPersonalCare: (...a: any[]) => mockApis.personalCare(...a),
  apiMySocialHealth: (...a: any[]) => mockApis.socialHealth(...a),
  apiMyManagement: (...a: any[]) => mockApis.management(...a),
}));

import * as helpers from '@/api/my_pain_api_helpers';

// section name, its mocked api, and its load & save helpers
const SECTIONS: [string, string, (id: string) => Promise<any>, (id: string, d: any) => Promise<any>][] = [
  ['My Pain', 'pain', helpers.apiLoadMyPain, helpers.apiSaveMyPain],
  ['My Movement', 'movement', helpers.apiLoadMyMovement, helpers.apiSaveMyMovement],
  ['My Personal Care', 'personalCare', helpers.apiLoadMyPersonalCare, helpers.apiSaveMyPersonalCare],
  ['My Social Health', 'socialHealth', helpers.apiLoadMySocialHealth, helpers.apiSaveMySocialHealth],
  ['My Management', 'management', helpers.apiLoadMyManagement, helpers.apiSaveMyManagement],
];

afterEach(() => jest.resetAllMocks());

describe.each(SECTIONS)('%s', (_name, key, load, save) => {
  test('load returns the saved record for the assessment', async () => {
    mockApis[key].mockResolvedValue([{ id: 'r1' }]);
    expect(await load('a1')).toEqual({ id: 'r1' });
    expect(mockApis[key]).toHaveBeenCalledWith('select', { assessment: 'a1' });
  });

  test('load returns null when the section has not been done', async () => {
    mockApis[key].mockResolvedValue([]);
    expect(await load('a1')).toBeNull();
  });

  test('save creates a record with completed_at when there is none', async () => {
    mockApis[key].mockResolvedValueOnce([]).mockResolvedValueOnce({ id: 'new id' }); // select, create
    await save('a1', { reflection: 'placeholder' });
    const [operation, values] = mockApis[key].mock.calls[1];
    expect(operation).toBe('create');
    expect(values).toMatchObject({ assessment: 'a1', reflection: 'placeholder' });
    expect(Number.isNaN(Date.parse(values.completed_at))).toBe(false);
  });

  test('save updates the existing record', async () => {
    mockApis[key].mockResolvedValueOnce([{ id: 'r1' }]).mockResolvedValueOnce({ id: 'r1' });
    await save('a1', { reflection: 'placeholder new' });
    const [operation, values] = mockApis[key].mock.calls[1];
    expect(operation).toBe('update');
    expect(values).toMatchObject({ id: 'r1', reflection: 'placeholder new' });
    expect(values.assessment).toBeUndefined();
  });
});
