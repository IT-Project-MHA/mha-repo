/* API helpers for settings, built on the calls in django-API.js. Use them
inside a try/catch block, a failed request throws an ApiError. */
import {
    apiAssignedGender,
    apiPatientProfile,
    apiUser,
    apiSupportLink,
    apiUserSettings,
    apiAppointment, apiAssessment, apiMyPain, apiMyMovement, apiMyPersonalCare,
    apiMySocialHealth, apiMyManagement, apiPrescription,
} from './django-API';
import { apiErrorMessage, normalisePhoneNumber } from './care_planner_api_helpers';

/*--------------------My Account------------------------------------------------------*/

export { apiErrorMessage };

/**
 * returns an Australian mobile number in the format the User table takes (local,
 * no spaces), e.g. '+61412345678' or '0412 345 678' -> '0412345678', or the number as typed if
 * it isn't one
 */
function toLocalPhone(phone) {
    const normalised = normalisePhoneNumber(phone);
    return normalised ? `0${normalised.slice(3)}` : phone;
}

/* Details for the My Account page:
- takes no parameters and returns { user, profile, sexOptions }:
    - user: the user's own User
    - profile: the user's own PatientProfile, or null if they don't have one yet (it is created
      the first time they save a field that belongs to it)
    - sexOptions: the choices for assigned_gender_at_birth, each { value, label } */
export async function apiMyAccount() {
    const [[user], sexOptions] = await Promise.all([apiUser('select'), apiAssignedGender()]);
    // filtering by user, as select also returns the profiles of patients the user supports
    const [profile] = await apiPatientProfile('select', { user: user.id });
    return { user, profile: profile ?? null, sexOptions };
}

/* Saves the About Me details, from the edit details modal:
- takes the user's id, the id of their PatientProfile (null if they don't have one) and the
  details ({ name, sex, birthYear, phone, email }), returns the saved { user, profile }
- name, phone & email are saved on the User, phone is sent as a local number with no spaces
- sex & birthYear are saved on the PatientProfile, which is created if there is none yet. 
  Either is left out when blank, and the profile isn't created
  when both are
- a blank email is sent as an empty string */
export async function apiSaveAboutMe(userId, profileId, { name, sex, birthYear, phone, email }) {
    const user = await apiUser('update', {
        id: userId,
        display_name: name.trim(),
        phone_number: toLocalPhone(phone),
        email: email.trim(),
    });

    const details = {
        assigned_gender_at_birth: sex || undefined,
        birth_year: birthYear.trim() ? Number(birthYear) : undefined,
    };
    if (profileId) {
        const profile = await apiPatientProfile('update', { id: profileId, ...details });
        return { user, profile };
    }
    if (details.assigned_gender_at_birth === undefined && details.birth_year === undefined) {
        return { user, profile: null };
    }
    const profile = await apiPatientProfile('create', details);
    return { user, profile };
}


/* Deletes the user's account:
- takes no parameters, returns null
- the server returns 409 if other records depend on the user, which throws an ApiError */
export async function apiDeleteMyAccount() {
    const [user] = await apiUser('select');
    return apiUser('delete', { id: user.id });
}

/* Checks the About Me details before they are saved:
- takes the details ({ name, sex, birthYear, phone, email }), returns a message to show the
  user, or null if they are all valid
- phone must be an Australian mobile number, the same rule as the server, spaces are ignored
- birthYear can be left blank, otherwise it must be a 4 digit year that isn't in the future */
export function validateAboutMe({ name, birthYear, phone, email }) {
    if (!name.trim()) {
        return 'Enter your name.';
    }
    if (birthYear.trim() && (!/^\d{4}$/.test(birthYear.trim()) || Number(birthYear) > new Date().getFullYear())) {
        return 'Enter your birth year as 4 digits, e.g. 1985.';
    }
    if (!normalisePhoneNumber(phone)) {
        return 'Enter an Australian mobile number.';
    }
    if (email.trim() && !/^\S+@\S+\.\S+$/.test(email.trim())) {
        return 'Enter a valid email address.';
    }
    return null;
}

/* Details for working out the user's role:
- takes no parameters, returns { hasProfile, isSupporter, onboarded }
- hasProfile: the user has their own PatientProfile
- isSupporter: the user is the support person on at least one active SupportLink
- onboarded: the user has accepted the terms (stand-in until the server has a role field) */
export async function apiMyRole() {
    const [user] = await apiUser('select');
    const [[profile], links, terms] = await Promise.all([
        apiPatientProfile('select', { user: user.id }),
        apiSupportLink('select'),
        apiTermsAndPrivacy('select'),
    ]);
    return {
        hasProfile: Boolean(profile),
        isSupporter: links.some((l) => l.supporter_user === user.id && l.status === 'active'),
        onboarded: terms.length > 0,
    };
}

/* Saves the My Conditions details, from the edit conditions modal:
- takes the id of the user's PatientProfile (null if they don't have one) and the details
  ({ hasDiagnosis, otherConditions }), returns the saved PatientProfile
- hasDiagnosis is true, false or null (not answered, left out)
- creates the PatientProfile if there is none yet */
export async function apiSaveConditions(profileId, { hasDiagnosis, otherConditions }) {
    const details = {
        has_diagnosis: hasDiagnosis ?? undefined,
        other_conditions: otherConditions.trim(),
    };
    if (profileId) {
        return apiPatientProfile('update', { id: profileId, ...details });
    }
    // nothing entered: don't create a profile
    if (details.has_diagnosis === undefined && !details.other_conditions) {
        return null;
    }
    return apiPatientProfile('create', details);
}

