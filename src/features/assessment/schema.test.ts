import { assessmentSchema } from './schema';
import { EMPTY_ASSESSMENT, SAMPLE_PATIENT } from './values';

const check = (change: object) => assessmentSchema.safeParse({ ...SAMPLE_PATIENT, ...change });

const failedFields = (result: ReturnType<typeof check>) =>
  result.success ? [] : result.error.issues.map((issue) => issue.path.join('.'));

describe('age rule', () => {
  // Visit on 2026-08-07, so the cut off birthday is 1966-08-07.
  it('accepts a patient turning 60 on the visit and rejects one a day short', () => {
    expect(check({ dateOfBirth: '1966-08-07' }).success).toBe(true);

    const dayShort = check({ dateOfBirth: '1966-08-08' });
    expect(failedFields(dayShort)).toEqual(['dateOfBirth']);
    expect(dayShort.error?.issues[0].message).toBe('This pathway is for patients aged 60 and over');
  });

  it('judges age on the assessment date, not on today', () => {
    // Born 1966-08-08: one day short on 2026-08-07, exactly 60 a day later.
    expect(check({ dateOfBirth: '1966-08-08', assessmentDate: '2026-08-08' }).success).toBe(true);
  });
});

describe('fixture changes from the brief', () => {
  it.each([
    ['mrn', { mrn: 'MRN-4821' }],
    ['patientName', { patientName: 'S' }],
    ['dateOfBirth', { dateOfBirth: '1966-08-08' }],
    ['mobility', { mobility: 'crutches' }],
    ['barthelIndex', { barthelIndex: 82 }],
    ['barthelIndex', { barthelIndex: 105 }],
    ['pharmacistReviewRequested', { medicationCount: 5, pharmacistReviewRequested: false }],
    ['followUpDate', { followUpDate: '2026-08-07' }],
    ['consentObtained', { consentObtained: false }],
  ])('rejects with the error on %s only: %j', (field, change) => {
    expect(failedFields(check(change))).toEqual([field]);
  });

  it.each([
    { barthelIndex: 0 },
    { barthelIndex: 100 },
    { medicationCount: 4, pharmacistReviewRequested: false },
  ])('accepts %j', (change) => {
    expect(check(change).success).toBe(true);
  });
});

it('gives one error per required field on an empty form, with no cross field noise', () => {
  const result = assessmentSchema.safeParse(EMPTY_ASSESSMENT);
  const fields = failedFields(result);

  expect(fields).toHaveLength(9);
  expect(new Set(fields).size).toBe(9);
});
