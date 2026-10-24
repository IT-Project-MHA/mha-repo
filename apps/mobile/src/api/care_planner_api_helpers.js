import {
    apiAppointment,
    apiAppointmentAccess,
    apiAppointmentAnswer,
    apiAppointmentQuestion,
    apiAssessment,
    apiMyPain,
    apiPatientProfile,
    apiQuestionOption,
    apiSupportLink,
    apiUser,
} from './django-API';
import { suggestedIdOfText } from '../../constants/suggestedQuestions';

/* Care planner API helpers, built on the calls in django-API.js. Use them inside a try/catch block,
a failed request throws an ApiError. */

// returns the id of the user's own patient profile, or null if they don't have one
export async function ownPatientProfileId() {
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

/* Patients the user is a support person for:
- takes no parameters and returns an array of { patientId, patientName } from the user's active
  SupportLinks, where patientId is the patient's patient_profile id */
export async function apiSupportedPatients() {
    const [[user], links] = await Promise.all([apiUser('select'), apiSupportLink('select')]);
    return links
        .filter((link) => link.supporter_user === user.id && link.status === 'active')
        .map((link) => ({ patientId: link.patient_profile, patientName: link.patient_name }));
}

/* Appointments where the user is the support person, with the patient's name:
- same as apiSupportAppointments, with patientName added to each appointment */
export async function apiSharedAppointments() {
    const [appointments, patients] = await Promise.all([
        apiSupportAppointments(),
        apiSupportedPatients(),
    ]);
    const names = new Map(patients.map((patient) => [patient.patientId, patient.patientName]));
    return appointments.map((appointment) => ({
        ...appointment,
        patientName: names.get(appointment.patient_profile) ?? '',
    }));
}

// helper function: returns the audio type of a recording file, from its extension
function recordingType(uri) {
    const extension = uri.split('.').pop().toLowerCase();
    return extension === '3gp' ? 'audio/3gpp' : `audio/${extension === 'm4a' ? 'm4a' : extension}`;
}

/* Saves the answer of a question:
- takes the question id, the answer's id if the question already has one (otherwise undefined),
  and the changes { text, recording }, either can be left out:
    - text: the typed answer, an empty string removes it
    - recording: a recording file on the device (its uri) to upload, or null to remove the saved
      recording. Uploading needs the doctor's permission
- creates the answer if there is none yet, otherwise changes it. Returns the saved AppointmentAnswer,
  its recording_file is the recording's download URL */
export async function apiSaveAnswer(questionId, answerId, { text, recording } = {}) {
    const values = {};
    if (text !== undefined) {
        values.text = text;
    }
    if (recording !== undefined) {
        values.recording_file = recording === null ? null : {
            uri: recording,
            name: recording.split('/').pop(),
            type: recordingType(recording),
        };
    }
    if (answerId) {
        return apiAppointmentAnswer('update', { id: answerId, ...values });
    }
    return apiAppointmentAnswer('create', { question: questionId, ...values });
}

/* Pain values for the suggested questions (PainSummary in constants/suggestedQuestions.ts):
- takes a patient_profile id, or nothing for the user's own, returns { locations, average, worst,
  mildest, current }
- goes through the patient's weekly assessments from the newest week back, until each value is
  found: locations, worst, mildest & current come from the most recent week that has them, average
  is the average of the 2 most recent weeks that have it (or the 1 week if there's only 1), rounded
- a value no assessment has is left out (locations is empty), so its questions aren't shown. A
  support person only sees the patient's assessments if the patient allows it
  (can_view_assessments), otherwise every value is left out */
export async function apiPainSummary(patientProfileId) {
    const summary = { locations: [] };
    const profileId = patientProfileId ?? (await ownPatientProfileId());
    if (!profileId) {
        return summary;
    }
    const [assessments, locationOptions] = await Promise.all([
        apiAssessment('select', { patient_profile: profileId }),
        apiQuestionOption('select', { app_section: 'my_pain', question_key: 'pain_location' }),
    ]);
    const locationNames = new Map(locationOptions.map((option) => [option.id, option.text]));
    // newest week first
    const weeks = [...assessments].sort((a, b) => b.week_starting.localeCompare(a.week_starting));

    const averages = [];
    for (const assessment of weeks) {
        // one MyPain per assessment, none if that section wasn't started
        const [pain] = await apiMyPain('select', { assessment: assessment.id });
        if (!pain) {
            continue;
        }

        if (summary.locations.length === 0) {
            summary.locations = [
                ...pain.locations.map((id) => locationNames.get(id)).filter(Boolean),
                ...(pain.other_location ? [pain.other_location] : []),
            ];
        }
        if (pain.average !== null && averages.length < 2) {
            averages.push(pain.average);
        }
        for (const field of ['worst', 'mildest', 'current']) {
            if (summary[field] === undefined && pain[field] !== null) {
                summary[field] = pain[field];
            }
        }

        // stops once every value is found
        if (summary.locations.length > 0 && averages.length === 2 &&
            ['worst', 'mildest', 'current'].every((field) => summary[field] !== undefined)) {
            break;
        }
    }

    if (averages.length > 0) {
        summary.average = Math.round(averages.reduce((total, value) => total + value, 0) / averages.length);
    }
    return summary;
}

/* One appointment with everything the appointment pages show:
- takes the appointment id, returns the Appointment with:
    - questions: in order, each { id, text, source, addedBy, suggestedId, answerId, answer,
      recording }. addedBy is 'support' when someone other than the patient added it, answerId is
      the answer's id (left out when there is no answer), recording is the answer's recording URL
      (it needs the user's token to download)
    - supportPeople: each person with live access, { name, phone, canAddQuestions,
      canAddAnswers, supportLinkId }. name is empty until they have an account
    - doctorPermission & doctorSignature: whether the doctor has signed to allow recordings, and
      their signature as a PNG data URL
    - patientId & patientName: the patient the appointment belongs to
    - canAddQuestions & canAddAnswers: what the user may do as a support person of this
      appointment, false when it's their own appointment */
export async function apiAppointmentDetails(appointmentId) {
    const [[user], appointment, questions, accessList, links] = await Promise.all([
        apiUser('select'),
        apiAppointment('select', { id: appointmentId }),
        apiAppointmentQuestion('select', { appointment: appointmentId }),
        apiAppointmentAccess('select', { appointment: appointmentId }),
        apiSupportLink('select'),
    ]);
    const linksById = new Map(links.map((link) => [link.id, link]));
    const liveAccess = accessList.filter((access) => access.revoked_at === null);
    // the user's own access, which only works once their link is active
    const ownAccess = liveAccess.filter((access) => {
        const link = linksById.get(access.support_link);
        return link?.supporter_user === user.id && link.status === 'active';
    });
    const patientLink = links.find((link) => link.patient_profile === appointment.patient_profile);

    return {
        ...appointment,
        // each question comes with its answer, null if it has none
        questions: questions.map((question) => {
            const answer = question.answer;
            return {
                id: question.id,
                text: question.text,
                source: question.source,
                addedBy: question.created_by !== appointment.created_by ? 'support' : undefined,
                suggestedId:
                    question.source === 'suggested' ? suggestedIdOfText(question.text) : undefined,
                answerId: answer?.id,
                answer: answer?.text || undefined,
                recording: answer?.recording_file || undefined,
            };
        }),
        supportPeople: liveAccess.map((access) => {
            const link = linksById.get(access.support_link);
            return {
                name: link?.supporter_name ?? '',
                phone: link?.invited_phone_number ?? '',
                canAddQuestions: access.can_add_questions,
                canAddAnswers: access.can_record_answers,
                supportLinkId: access.support_link,
            };
        }),
        doctorPermission: appointment.doctor_permission,
        doctorSignature: appointment.doctor_signature || undefined,
        patientId: appointment.patient_profile,
        patientName: patientLink?.patient_name ?? '',
        canAddQuestions: ownAccess.some((access) => access.can_add_questions),
        canAddAnswers: ownAccess.some((access) => access.can_record_answers),
    };
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
    return normalisePhoneNumber(phone) ?? phone;
}

/* Phone number in the format the server saves it in:
- takes a phone number as typed, returns it as e.g. '+61412345678', or null if it isn't an
  Australian mobile number. Spaces & dashes are ignored, the same rules as the server */
export function normalisePhoneNumber(phone) {
    const digits = phone.replace(/\D/g, '');
    if (digits.startsWith('04') && digits.length === 10) {
        return `+61${digits.slice(1)}`;
    }
    if (digits.startsWith('614') && digits.length === 11) {
        return `+${digits}`;
    }
    return null;
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
