import type { Assessment } from './schema';

// What the inputs hold while the nurse is still filling things in. A number box
// can be empty (or hold a half typed '-'), and selects and dates start as ''
// because there is no valid enum value or ISO date to begin with.
// Mapped from Assessment, so a field added to the schema shows up here too.
export type AssessmentDraft = {
  [K in keyof Assessment]: Assessment[K] extends number
    ? number | string
    : Assessment[K] extends boolean
      ? boolean
      : string;
};

export const EMPTY_ASSESSMENT: AssessmentDraft = {
  mrn: '',
  patientName: '',
  dateOfBirth: '',
  assessmentDate: '',
  mobility: '',
  barthelIndex: '',
  medicationCount: '',
  pharmacistReviewRequested: false,
  followUpDate: '',
  consentObtained: false,
};

// Invented patient. Typed as Assessment so the compiler checks it is a valid one.
export const SAMPLE_PATIENT: Assessment = {
  mrn: 'MRN-004821',
  patientName: 'Sushila Deshpande',
  dateOfBirth: '1949-03-12',
  assessmentDate: '2026-08-07',
  mobility: 'cane',
  barthelIndex: 80,
  medicationCount: 3,
  pharmacistReviewRequested: false,
  followUpDate: '2026-09-04',
  consentObtained: true,
};
