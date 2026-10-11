import {
    apiAppointment,
    apiAppointmentAccess,
    apiAppointmentQuestion,
    apiPatientProfile,
    apiSupportLink,
    apiUser,
} from './django-API';

/* Care planner API helpers, built on the calls in django-API.js. Use them inside a try/catch block,
a failed request throws an ApiError. */

// returns the id of the user's own patient profile, or null if they don't have one
async function ownPatientProfileId() {
    const [user] = await apiUser('select');
    const [profile] = await apiPatientProfile('select', { user: user.id });
    return profile ? profile.id : null;
}

/* Appointments where the user is the patient:
- takes no parameters and returns an array of all the user's own appointments
- returns an empty array if the user has no patient_profile */
export async function apiPatientAppointments() {
    const profileId = await ownPatientProfileId();
    if (!profileId) {
        return [];
    }
    return apiAppointment('select', { patient_profile: profileId });
}

/* Appointments where the user is the support person:
- takes no parameters and returns an array of all appointments of other patients that the user
  can see, either through can_view_appointments on their SupportLink or an AppointmentAccess
  grant */
export async function apiSupportAppointments() {
    const [profileId, appointments] = await Promise.all([
        ownPatientProfileId(),
        apiAppointment('select'),
    ]);
    return appointments.filter((appointment) => appointment.patient_profile !== profileId);
}

/* Support links of the user:
- takes no parameters and returns an array of the SupportLinks where the user is the patient, both
  active ones and invites the support person hasn't accepted yet. Revoked links are left out as
  they can't be given access to an appointment
- returns an empty array if the user has no patient_profile */
export async function apiMySupportLinks() {
    const profileId = await ownPatientProfileId();
    if (!profileId) {
        return [];
    }
    const links = await apiSupportLink('select', { patient_profile: profileId });
    return links.filter((link) => link.status !== 'revoked');
}

// helper function: returns an Australian mobile number in the format the server saves it in, e.g.
// '0412 345 678' -> '+61412345678', or the number as typed if it isn't one
function toServerPhone(phone) {
    const digits = phone.replace(/\D/g, '');
    if (digits.startsWith('04') && digits.length === 10) {
        return `+61${digits.slice(1)}`;
    }
    if (digits.startsWith('614') && digits.length === 11) {
        return `+${digits}`;
    }
    return phone;
}

/* Error message to show the user for a failed request:
- takes the error thrown by an API call and a fallback message, returns the server's first error
  message (e.g. 'Enter an Australian mobile number.'), or the fallback if it didn't send one */
export function apiErrorMessage(error, fallback) {
    // the server sends {detail: 'message'} or {attribute: ['message', ...]}
    const messages = Object.values(error?.data ?? {}).flat();
    const message = messages.find((item) => typeof item === 'string');
    return message ?? fallback;
}

/* Saves the details of the appointment being created, from the create appointment page:
- takes the id of the appointment if it has already been saved (null the first time) and the
  details ({ scheduledDate, doctor, healthService }), returns the saved Appointment
- creates the Appointment the first time, then updates the same one when the page is saved again
- healthService is left out when not chosen: the server uses its default when creating, and keeps
  the saved one when updating */
export async function apiSaveAppointment(appointmentId, { scheduledDate, doctor, healthService }) {
    const details = {
        scheduled_date: scheduledDate.toISOString(),
        doctor: doctor,
        health_service: healthService ?? undefined,
    };
    if (appointmentId) {
        return apiAppointment('update', { id: appointmentId, ...details });
    }
    return apiAppointment('create', details);
}

/* Saves the support persons of the appointment being created, from the add support person page:
- takes the appointment id and the support persons, returns the SupportLink id of each person in
  the same order, so the page can keep them and saving again doesn't invite anyone twice
- finds each person's SupportLink, inviting the ones entered by hand who don't have one:
    - picked from My Support Links (supportLinkId): their existing SupportLink is used
    - entered by hand: the user's SupportLink with that phone number is used, otherwise a new one
      is made. The server links it to the account with that number straight away, or when
      someone registers with it
- then gives each of them access to the appointment with the access ticked for them (or changes
  their access if they already have it), and revokes the access of anyone no longer listed
- the access starts working once the support person has accepted the invite in the app
- safe to call again after a failure, the links & access already saved are reused */
export async function apiSaveSupportPeople(appointmentId, supportPeople) {
    const [appointment, links, accessList] = await Promise.all([
        apiAppointment('select', { id: appointmentId }),
        apiSupportLink('select'),
        apiAppointmentAccess('select', { appointment: appointmentId }),
    ]);

    // the user's own links by phone number, so a person entered by hand isn't invited twice
    const linksByPhone = new Map(
        links
            .filter((link) => link.patient_profile === appointment.patient_profile)
            .filter((link) => link.status !== 'revoked' && link.invited_phone_number)
            .map((link) => [link.invited_phone_number, link.id]),
    );

    // checks every person's link first, so a phone number the server doesn't accept stops the
    // save before anyone's access changes
    const supportLinkIds = [];
    for (const person of supportPeople) {
        let supportLinkId = person.supportLinkId;
        if (!supportLinkId) {
            const phone = toServerPhone(person.phone);
            supportLinkId = linksByPhone.get(phone);
            if (!supportLinkId) {
                const link = await apiSupportLink('create', { invited_phone_number: phone });
                supportLinkId = link.id;
                linksByPhone.set(phone, supportLinkId);
            }
        }
        supportLinkIds.push(supportLinkId);
    }

    for (const [index, person] of supportPeople.entries()) {
        await apiAppointmentAccess('create', {
            appointment: appointmentId,
            support_link: supportLinkIds[index],
            can_add_questions: person.canAddQuestions,
            can_record_answers: person.canAddAnswers,
        });
    }

    // people removed from the page lose their access
    const kept = new Set(supportLinkIds);
    for (const access of accessList) {
        if (access.revoked_at === null && !kept.has(access.support_link)) {
            await apiAppointmentAccess('delete', { appointment: appointmentId, id: access.id });
        }
    }

    return supportLinkIds;
}

/* Saves the questions of the appointment being created, from the add questions page:
- takes the appointment id and the questions ({ text, source }), returns nothing
- replaces the appointment's questions with the given ones, in the given order
- safe to call again after a failure or after the page is saved again */
export async function apiSaveQuestions(appointmentId, questions) {
    const saved = await apiAppointmentQuestion('select', { appointment: appointmentId });
    for (const question of saved) {
        await apiAppointmentQuestion('delete', { id: question.id });
    }

    // one at a time, so the server numbers them in the order they were added
    for (const question of questions) {
        await apiAppointmentQuestion('create', {
            appointment: appointmentId,
            text: question.text,
            source: question.source,
        });
    }
}
