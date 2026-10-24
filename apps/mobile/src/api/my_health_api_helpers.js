import {
    apiAssessment,
    apiMyPain,
    apiQuestionOption,
    apiPrescription,
    apiUser,
    apiPatientProfile,
    apiAssignedGender,
    apiMyMovement,
    apiMyPersonalCare,
    apiMySocialHealth,
    apiQuestionOptionOrdered,
    apiMyManagement,
} from './django-API';

import {ownPatientProfileId} from './care_planner_api_helpers'

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

// -------------- Pain Profile --------------

/* About me details for the My Pain Profile
- takes no parameters (the user's own details) and returns { name, sex, ageGroup } as strings,
  each '' when that detail isn't set */
export async function apiAboutMe() {
    const [user] = await apiUser('select');
    const [[profile], genderOptions] = await Promise.all([
        apiPatientProfile('select', {user: user.id}),
        apiAssignedGender(),
    ]);

    const genderLabels = new Map(genderOptions.map((option) => [option.value, option.label]));

    return {
        name: user?.display_name ?? '',
        sex: profile ? (genderLabels.get(profile.assigned_gender_at_birth) ?? '') : '',
        ageGroup: profile ? ageGroupFromBirthYear(profile.birth_year) : '',
    };
}

/* Age band from a birth year, '' when there's no birth year. Age is this year minus the birth
year.
Age bands are taken from Australian Bureau of Statistics low-level (broad) population groups:
https://www.abs.gov.au/statistics/standards/age-standard/latest-release*/
function ageGroupFromBirthYear(birthYear) {
    if (!birthYear) {
        return '';
    }
    const age = new Date().getFullYear() - birthYear;
    const bands = [
        { max: 14, label: 'Youth (14 years and younger)' },
        { max: 24, label: 'Young Adult (15-24 years)' },
        { max: 44, label: 'Middle Adult (25-44 years)' },
        { max: 64, label: 'Older Adult (45-64 years)' },
    ];
    const band = bands.find((b) => age <= b.max);
    return band ? band.label : 'Retirement (65 years and older)';
}

/* My conditions for Pain Profile
- takes no parameters (the user's own details) and returns {primaryCondition, otherConditions}
  as strings, otherwise ''
- primaryCondition is the user's selected pain type labels joined together
- otherConditions is their text input other_conditions */
export async function apiMyConditions() {
    const [user] = await apiUser('select');
    const [[profile], painTypeOptions] = await Promise.all([
        apiPatientProfile('select', {user: user.id}),
        apiQuestionOption('select', {app_section: 'onboarding', question_key: 'pain_type'}),
    ]);
    if (!profile) {
        return {primaryCondition: '', otherConditions: ''};
    }
    //
    const painTypeNames = new Map(painTypeOptions.map((option) => [option.id, option.text]));
    return {
        primaryCondition: profile.pain_types
            // get the names of the ids from painTypeNames
            .map((id) => painTypeNames.get(id))
            .filter(Boolean)
            .join(', '),
        otherConditions: profile.other_conditions ?? '',
    };
}

/* Helper function: 
Gets the record from the patient's most recent assessment section.
- sectionApi: one of apiMyPain, apiMyMovement, apiMyPersonalCare, apiMySocialHealth, 
  apiMyManagement */
async function latestSection(sectionApi, profileId) {

    // all user assessments, sort by week_starting
    const assessments = await apiAssessment('select', {patient_profile: profileId});
    const weeks = [...assessments].sort((a, b)=>b.week_starting.localeCompare(a.week_starting));
    // try fetching record starting from the most recent assessment
    for (const assessment of weeks) {
        const [row] = await sectionApi('select', {assessment:assessment.id});
        if (row) return row;
    }
    return null;
}

/* Helper function: 
Given app section and all all question keys of that section in QusetionOptionOrdered, 
get the list of all id->text for each possible answer. 

e.g.
const text = orderedOptionText('my_personal_care', ['care_general_impacts','care_personal_care',
    'care_sleeping]); 
returns a map of key-value pairs where text.get(id) gives the corresponding text
*/
async function orderedOptionText(app_section, questionKeys){
    const sets = await Promise.all(
        questionKeys.map((question_key)=>
            apiQuestionOptionOrdered('select', {app_section, question_key})),
    );
    return new Map(sets.flat().map((option)=>[option.id, option.text]));
}

/* My Pain for Pain Profile
- returns {location, current, average, worst, mildest, characteristics}
- average is the mean of the 2 most recent weeks that have one (or the 1 week
  if there's only 1), rounded, and null if no week has one
- location & characteristics are each a string concatenated of all the selected options plus
  the user's own text inputs for any extra options */
export async function apiMyPainSummary(patientProfileId) {
    const empty = {location: '', current: null, average: null , worst: null, mildest: null,
        characteristics: ''};
    const profileId = patientProfileId ?? (await ownPatientProfileId());
    if (!profileId) return empty;
    const [locationOptions, characteristicOptions, assessments] = await Promise.all([
        apiQuestionOption('select', {app_section: 'my_pain', question_key: 'pain_location'}),
        apiQuestionOption('select', {app_section: 'my_pain', question_key: 'pain_characteristic'}),
        apiAssessment('select', {patient_profile: profileId}),
    ]);
    const texts = new Map([...locationOptions, ...characteristicOptions].map((o)=>[o.id,o.text]));

    // newest week first
    const weeks = [...assessments].sort((a, b)=>b.week_starting.localeCompare(a.week_starting));

    let latest = null;      // most recent week with a MyPain record (for the non-average fields)
    const averages = [];    // up to the 2 most recent non-null averages
    for (const assessment of weeks) {
        const [pain] = await apiMyPain('select', {assessment: assessment.id});
        if (!pain) continue;
        if (!latest) latest = pain;
        if (pain.average !== null && averages.length < 2) averages.push(pain.average);
        if (latest && averages.length === 2) break;
    }
    if (!latest) return empty;

    const average = averages.length > 0
        ? Math.round(averages.reduce((total, value)=>total + value, 0) / averages.length)
        : null;

    return {
        location:[...latest.locations.map((id)=>texts.get(id)).filter(Boolean),
            ...(latest.other_location ? [latest.other_location] : []),
        ].join(', '),
        current:latest.current,
        average,
        worst:latest.worst,
        mildest:latest.mildest,
        characteristics:[...latest.characteristics.map((id)=>texts.get(id)).filter(Boolean),
            ...(latest.other_characteristic ? [latest.other_characteristic] : []),
        ].join(', '),
    };
}

/* Impacts to Movement for Pain Profile 
- returns {activeHours, general, walking, lifting, sitting, standing} as display strings
*/
export async function apiMovementSummary(patientProfileId) {
    const empty = {activeHours:null, general:'', walking: '', lifting: '', sitting: '',
        standing: ''};
    const profileId = patientProfileId ?? (await ownPatientProfileId());
    if (!profileId) return empty;

    const texts = await orderedOptionText('my_movement', ['movement_general_impacts', 
        'movement_walking', 'movement_sitting', 'movement_lifting', 'movement_standing',]);
    const latest = await latestSection(apiMyMovement, profileId);
    if (!latest) return empty;
    return {
        activeHours:latest.active_hours == null ? null : latest.active_hours,
        general:latest.general_impacts.map((id)=>texts.get(id)).filter(Boolean).join(', '),
        walking:texts.get(latest.walking) ?? '',
        lifting:texts.get(latest.lifting) ?? '',
        sitting:texts.get(latest.sitting) ?? '',
        standing:texts.get(latest.standing) ?? '',
    }
}

/* Impacts to Personal Care for Pain Profile 
- returns {general, personalCare, sleeping} */
export async function apiPersonalCareSummary(patientProfileId) {
    const empty = {general: '', personalCare: '', sleeping: ''};
    const profileId = patientProfileId ?? (await ownPatientProfileId());
    if (!profileId) return empty;

    const texts = await orderedOptionText('my_personal_care', [
        'care_general_impacts', 'care_personal_care', 'care_sleeping',
    ]);
    const latest = await latestSection(apiMyPersonalCare, profileId);
    if (!latest) return empty;

    return {
        general: latest.general_activities_impact.map((id)=>texts.get(id)).filter(Boolean)
            .join(', '),
        personalCare: texts.get(latest.personal_care) ?? '',
        sleeping: texts.get(latest.sleeping) ?? '',
    };
}

/*  Impacts to Social Health for Pain Profile
- returns {socialLife, travelling, mood, relationships, enjoyment}
- mood, relationships & enjoyment are 0-10 numbers (or null) */
export async function apiSocialHealthSummary(patientProfileId) {
    const empty = {socialLife:'', travelling:'', mood:null, relationships: null, enjoyment:null};
    const profileId = patientProfileId ?? (await ownPatientProfileId());
    if (!profileId) return empty;

    const texts = await orderedOptionText('my_social_health', ['social_social_life',
        'social_travelling',]);
    const latest = await latestSection(apiMySocialHealth, profileId);
    if (!latest) return empty;

    return {
        socialLife:texts.get(latest.social_life) ?? '',
        travelling:texts.get(latest.travelling) ?? '',
        mood:latest.mood ?? null,
        relationships:latest.relationships ?? null,
        enjoyment:latest.enjoyment_of_life ?? null,
    };
}

/* My Current Management for Pain Profile
- returns {medication, exercise, emotion} as display strings 
- medication is a string concatenated of all prescriptions the user has selected from their
  prescription list, plus any extra OTC medication */
export async function apiManagementSummary(patientProfileId) {
    const empty = { medication: '', exercise: '', emotion: ''};
    const profileId = patientProfileId ?? (await ownPatientProfileId());
    if (!profileId) return empty;

    const [exerciseOptions, prescriptions] = await Promise.all([
        apiQuestionOptionOrdered('select', {app_section: 'my_management', question_key: 
            'management_exercise'}),
        apiPrescription('select', {patient_profile: profileId}),
    ]);
    const exerciseTexts = new Map(exerciseOptions.map((o)=> [o.id, o.text]));
    const prescriptionNames = new Map(prescriptions.map((p) => [p.id, p.name]));
    const latest = await latestSection(apiMyManagement, profileId);
    if (!latest) return empty;

    return {
        medication: [...latest.medication.map((id)=>prescriptionNames.get(id)).filter(Boolean),
            ...(latest.otc_medication ? [latest.otc_medication] : [])].join(', '),
        exercise:exerciseTexts.get(latest.exercise) ?? '',
        emotion:latest.emotion ?? '',
    };
}