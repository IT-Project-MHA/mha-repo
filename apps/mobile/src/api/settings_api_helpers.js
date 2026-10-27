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

/*--------------------My Connections (rename)!------------------------------------------------------*/

/* Details for the My Connections page:
- takes no parameters and returns { supportPeople, supporting }, each an array of
  { id, name, phone, invited, viewAppointments }, where id is the SupportLink's id:
    - supportPeople: the user's SupportLinks as the patient, both active ones and invites the
      support person hasn't accepted yet (invited is true). Revoked links are left out. name is
      empty until the support person has an account, so the phone number they were invited with
      is used
    - supporting: the active SupportLinks where the user is the support person, name is the
      patient's name. The server doesn't send the patient's phone number, so phone is empty
- viewAppointments is can_view_appointments of the SupportLink */
export async function apiMyConnections() {
    const [[user], links] = await Promise.all([apiUser('select'), apiSupportLink('select')]);

    const supportPeople = links
        .filter((link) => link.patient_user === user.id && link.status !== 'revoked')
        .map((link) => ({
            id: link.id,
            name: link.supporter_name || link.invited_phone_number || 'Support Person',
            phone: link.invited_phone_number ?? '',
            invited: link.status !== 'active',
            viewAppointments: Boolean(link.can_view_appointments),
        }));

    const supporting = links
        .filter((link) => link.supporter_user === user.id && link.status === 'active')
        .map((link) => ({
            id: link.id,
            name: link.patient_name,
            phone: '',
            invited: false,
            viewAppointments: Boolean(link.can_view_appointments),
        }));

    const invitations = links
    .filter((link) => link.supporter_user === user.id && link.status === 'invited')
    .map((link) => ({ id: link.id, name: link.patient_name }));

    return { supportPeople, supporting, invitations };

}


/* Accepts an invitation to support a patient, as the support person:
- takes the SupportLink id, returns the saved SupportLink */
export async function apiAcceptInvitation(linkId) {
    return apiSupportLink('update', { id: linkId, status: 'active' });
}

/* Invites a support person:
- takes the phone number as typed and returns the new SupportLink, with status invited
- the server links it to the account with that number straight away, or when someone
  registers with it
- the phone number is saved as e.g. '+61412345678' */
export async function apiInviteSupportPerson(phone) {
    return apiSupportLink('create', { invited_phone_number: normalisePhoneNumber(phone) });
}

/* Declines an invitation, as the support person: the link is revoked, not deleted */
export async function apiDeclineInvitation(linkId) {
    return apiSupportLink('update', { id: linkId, status: 'revoked' });
}

/* Removes a support person, as the patient:
- takes the SupportLink id, returns null
- the server returns 409 if other records depend on the link, which throws an ApiError */
export async function apiRemoveSupportPerson(linkId) {
    return apiSupportLink('delete', { id: linkId });
}

/* Removes the user as a support person of a patient, as the support person:
- takes the SupportLink id, returns the saved SupportLink
- a support person can only change the status, so the link is revoked, not deleted */
export async function apiRemoveConnection(linkId) {
    return apiSupportLink('update', { id: linkId, status: 'revoked' });
}

/* Checks the phone number of an invite before it is sent:
- takes the phone number as typed, returns a message to show the user, or null if it is valid
- must be an Australian mobile number, the same rule as the server, spaces are ignored */
export function validateSupportPhone(phone) {
    if (!normalisePhoneNumber(phone)) {
        return 'Enter an Australian mobile number.';
    }
    return null;
}

/*--------------------Accessibility------------------------------------------------------*/

/* Details for the Accessibility page:
- takes no parameters and returns the user's own UserSettings, or null if they don't have a
  settings record yet (it is created the first time they save a setting) */
export async function apiMySettings() {
    const [settings] = await apiUserSettings('select');
    return settings ?? null;
}

/* Saves accessibility settings:
- takes the id of the user's UserSettings (null if they don't have one) and the changed fields
  ({ high_contrast, text_size_percent }), returns the saved UserSettings
- creates the UserSettings if there is none yet */
export async function apiSaveSettings(settingsId, changes) {
    if (settingsId) {
        return apiUserSettings('update', { id: settingsId, ...changes });
    }
    return apiUserSettings('create', changes);
}


/*--------------------My Data------------------------------------------------------*/


/* Deletes all of the user's health data, which makes their account a support person account:
- takes no parameters, returns true if there was data to delete, false if the user has no
  PatientProfile (already a support person account)
- deletes dependants first (assessment sections, appointments, support links as the patient,
  then assessments & prescriptions), and the PatientProfile last
- a failed request throws an ApiError (409 if something still depends on a record). Nothing is
  rolled back, but it is safe to call again, as each call only deletes what is left */
export async function apiDeleteMyData() {
    const [user] = await apiUser('select');
    const [profile] = await apiPatientProfile('select', { user: user.id });
    if (!profile) {
        return false;
    }
    const patient_profile = profile.id;

    const removeAll = async (api, filters) => {
        const rows = await api('select', filters);
        await Promise.all(rows.map((row) => api('delete', { id: row.id })));
    };

    const assessments = await apiAssessment('select', { patient_profile });


    // Deletes things that depend on assessments, appointments & prescriptions
    await Promise.all([
        ...assessments.flatMap((a) => [
            removeAll(apiMyPain, { assessment: a.id }),
            removeAll(apiMyMovement, { assessment: a.id }),
            removeAll(apiMyPersonalCare, { assessment: a.id }),
            removeAll(apiMySocialHealth, { assessment: a.id }),
            removeAll(apiMyManagement, { assessment: a.id }),
        ]),
        removeAll(apiAppointment, { patient_profile }),
    ]);

    // Deletes assessments, prescriptions & the user's own support people
    const links = await apiSupportLink('select', { patient_profile });
    await Promise.all([
        ...assessments.map((a) => apiAssessment('delete', { id: a.id })),
        removeAll(apiPrescription, { patient_profile }),
        ...links.filter((l) => l.patient_user === user.id)
                .map((l) => apiSupportLink('delete', { id: l.id })),
    ]);

    // Deletes the profile itself
    await apiPatientProfile('delete', { id: profile.id });
    return true;
}
