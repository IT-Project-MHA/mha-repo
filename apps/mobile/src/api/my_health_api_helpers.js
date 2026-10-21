// from victorias code
import {
    apiAssessment,
    apiMyPain,
    apiQuestionOption,
    apiPrescription,
    apiUser,
} from './django-API';

import {ownPatientProfileId} from './care_planner_api_helpers'

// victorias
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

// retrieve pain history
export async function apiPainHistory(patientProfileId){
    const profileId = patientProfileId ?? (await ownPatientProfileId());
    if (!profileId){
        return [];
    }
    const assessments = await apiAssessment('select', { patient_profile: profileId });

    const pain = await Promise.all(
        assessments.map((assessment) => apiMyPain('select', {assessment: assessment.id})),
    );

    return assessments
        .map((assessment, index) => ({
            completedAt: assessment.week_starting,
            score: pain[index][0]?.average ?? null,
        }))
        .filter((point) => point.score !== null)
        .sort((a,b) => a.completedAt.localeCompare(b.completedAt));
}

// create dummy user
export async function makeUser(phone_number, display_name, email){
    apiUser('create', phone_number, display_name, email);
}
