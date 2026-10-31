/**
 * Stores the possible roles of users of the app.
 * 
 * Different user-types have authorisation to view different screens.
 */
export const UserType = {
    patient: 'Patient',
    supportPerson: 'SupportPerson',
    admin: 'Admin',
    both: 'SupportPersonPatient',
    undefined: 'Undefined', // for onboarding
    noRole: 'NoRole', // onboarded, but no profile and no active links
} as const;

/**
 * exports the allowed values within UserType as well as the type (structure).
 */
export type UserType = typeof UserType[keyof typeof UserType];