import { apiAppointment, apiPatientProfile, apiUser } from '../api/django-API';

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
