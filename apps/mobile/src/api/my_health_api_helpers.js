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
    apiPainTrend,
} from './django-API';

import {ownPatientProfileId} from './care_planner_api_helpers'

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
Gets the record for one assessment section.
- sectionApi: one of apiMyPain, apiMyMovement, apiMyPersonalCare, apiMySocialHealth,
  apiMyManagement
- weekStarting: that exact week's record ('YYYY-MM-DD')
  - if blank: the most recent week that has a record */
async function sectionRecord(sectionApi, profileId, weekStarting) {
    // all user assessments, sort by week_starting (newest first)
    const assessments = await apiAssessment('select', {patient_profile: profileId});
    const weeks = [...assessments].sort((a, b)=>b.week_starting.localeCompare(a.week_starting));

    // scoped to one week: only that week's record, no fallback to other weeks
    if (weekStarting) {
        const match = weeks.find((a)=>a.week_starting === weekStarting);
        if (!match) return null;
        const [row] = await sectionApi('select', {assessment: match.id});
        return row ?? null;
    }

    // otherwise, the most recent week that has a record
    for (const assessment of weeks) {
        const [row] = await sectionApi('select', {assessment:assessment.id});
        if (row) return row;
    }
    return null;
}

/* section key -> its section API */
const SECTION_APIS = {
    my_pain: apiMyPain,
    my_movement: apiMyMovement,
    personal_care: apiMyPersonalCare,
    social_health: apiMySocialHealth,
    management: apiMyManagement,
};

/* Which assessment sections were answered for one week.
- weekStarting: 'YYYY-MM-DD' of the week to check
- returns an array of section keys (subset of SECTION_APIS keys) that have a record for that
  week, so callers can hide links to sections that don't exist. Empty if the week (or profile)
  isn't found or nothing was answered. */
export async function apiAnsweredSections(patientProfileId, weekStarting) {
    const profileId = patientProfileId ?? (await ownPatientProfileId());
    if (!profileId || !weekStarting) return [];

    const assessments = await apiAssessment('select', {patient_profile: profileId});
    const match = assessments.find((a)=>a.week_starting === weekStarting);
    if (!match) return [];

    const present = [];
    await Promise.all(
        // checks all sections in parallel
        // turns SECTION_APIS into an array of [key, api] pairs
        Object.entries(SECTION_APIS).map(async ([key, api])=>{
            const [row] = await api('select', {assessment: match.id});
            if (row) present.push(key);
        }),
    );
    return present;
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

/* My Pain Summary for Pain Profile & Assessment Records
- weekStarting: that exact week's record ('YYYY-MM-DD')
  - if blank: the most recent week that has a record
- returns {location, current, average, worst, mildest, characteristics}
- average is the mean (rounded) of up to the 2 most recent non-null averages at or before the
  chosen week, or null if none
- location & characteristics are each a string concatenated of all the selected options plus
  the user's own text inputs for any extra options */
export async function apiMyPainSummary(patientProfileId, weekStarting) {
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

    // store query result to be reused
    const painCache = new Map();
    const painFor = async (assessmentId) => {
        if (!painCache.has(assessmentId)) {
            const [row] = await apiMyPain('select', {assessment: assessmentId});
            painCache.set(assessmentId, row ?? null);
        }
        return painCache.get(assessmentId);
    };

    // where to start: the selected week, or the newest week
    let startIndex = 0;
    if (weekStarting) {
        startIndex = weeks.findIndex((a)=>a.week_starting === weekStarting);
        if (startIndex === -1) return empty;
    }

    // record for the non-average fields
    let latest = null;
    let latestIndex = startIndex;
    if (weekStarting) {
        latest = await painFor(weeks[startIndex].id);
    } else {
        for (let i = startIndex; i < weeks.length; i++) {
            const row = await painFor(weeks[i].id);
            if (row) { latest = row; latestIndex = i; break; }
        }
    }
    if (!latest) return empty;

    // average: up to the 2 most recent non-null averages at or before the chosen week
    const averages = [];
    for (let i = latestIndex; i < weeks.length && averages.length < 2; i++) {
        const row = await painFor(weeks[i].id);
        if (row && row.average !== null) averages.push(row.average);
    }

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
export async function apiMovementSummary(patientProfileId, weekStarting) {
    const empty = {activeHours:null, general:'', walking: '', lifting: '', sitting: '',
        standing: ''};
    const profileId = patientProfileId ?? (await ownPatientProfileId());
    if (!profileId) return empty;

    const texts = await orderedOptionText('my_movement', ['movement_general_impacts',
        'movement_walking', 'movement_sitting', 'movement_lifting', 'movement_standing',]);
    const latest = await sectionRecord(apiMyMovement, profileId, weekStarting);
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
export async function apiPersonalCareSummary(patientProfileId, weekStarting) {
    const empty = {general: '', personalCare: '', sleeping: ''};
    const profileId = patientProfileId ?? (await ownPatientProfileId());
    if (!profileId) return empty;

    const texts = await orderedOptionText('my_personal_care', [
        'care_general_impacts', 'care_personal_care', 'care_sleeping',
    ]);
    const latest = await sectionRecord(apiMyPersonalCare, profileId, weekStarting);
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
export async function apiSocialHealthSummary(patientProfileId, weekStarting) {
    const empty = {socialLife:'', travelling:'', mood:null, relationships: null, enjoyment:null};
    const profileId = patientProfileId ?? (await ownPatientProfileId());
    if (!profileId) return empty;

    const texts = await orderedOptionText('my_social_health', ['social_social_life',
        'social_travelling',]);
    const latest = await sectionRecord(apiMySocialHealth, profileId, weekStarting);
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
export async function apiManagementSummary(patientProfileId, weekStarting) {
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
    const latest = await sectionRecord(apiMyManagement, profileId, weekStarting);
    if (!latest) return empty;

    return {
        medication: [...latest.medication.map((id)=>prescriptionNames.get(id)).filter(Boolean),
            ...(latest.otc_medication ? [latest.otc_medication] : [])].join(', '),
        exercise:exerciseTexts.get(latest.exercise) ?? '',
        emotion:latest.emotion ?? '',
    };
}

// -------------- My Health Chart --------------

// which API & numeric field to plot for each assessment area
const HISTORY_FIELDS = {
    pain: [apiMyPain, 'average'],
    movement: [apiMyMovement, 'score'],
    personalCare: [apiMyPersonalCare, 'score'],
    socialHealth: [apiMySocialHealth, 'score'],
    management: [apiMyManagement, 'score'],
};

/* Weekly history of one assessment area for charting
* - area: a key of HISTORY_FIELDS
* - returns [{completedAt, score}] oldest first, weeks with no record or no value are left out 
*/
export async function apiScoreHistory(area, patientProfileId) {

    const entry = HISTORY_FIELDS[area];
    if (!entry) {
        throw new Error(`Unknown assessment area: ${area}`);
    }
    const [sectionApi, field] = entry;

    const profileId = patientProfileId ?? (await ownPatientProfileId());
    if (!profileId) {
        return [];
    }
    const assessments = await apiAssessment('select', { patient_profile: profileId });

    const rows = await Promise.all(
        assessments.map((assessment) => sectionApi('select', {assessment: assessment.id})),
    );

    return assessments
        .map((assessment, index) => ({
            completedAt: assessment.week_starting,
            score: rows[index][0]?.[field] ?? null,
        }))
        .filter((point) => point.score !== null)
        .sort((a, b) => a.completedAt.localeCompare(b.completedAt));
}

// retrieves pain history
export function apiPainHistory(patientProfileId) {
    return apiScoreHistory('pain', patientProfileId);
}

// backend doesn't allow days to be empty, so use large number for all days
const ALL_TIME_DAYS = 36500;

/* Weekly pain history with detail for the chart & summary
* - days: leave it out for all time
* - returns [{completedAt, score, worst, mildest, locations}] oldest first
* - score is the weekly average, locations are the option labels
* */
export async function apiPainDetailHistory(patientProfileId, days, locationId) {
    const profileId = patientProfileId ?? (await ownPatientProfileId());
    if (!profileId) {
        return [];
    }

    const weeks = await apiPainTrend('select', {
        patient_profile: profileId,
        days: days ?? ALL_TIME_DAYS,
        location: locationId,
    });
    
    return weeks
        .map((w) => ({
            completedAt: w.week_starting,
            score: w.average,
            worst: w.worst,
            mildest: w.mildest,
        }))
        .filter((p) => p.score != null);
}

/* All pain location options, for the location chips: [{id, label}] */
export async function apiPainLocations() {
    const options = await apiQuestionOption('select',
        {app_section: 'my_pain', question_key: 'pain_location'});
    return options.map((o) => ({ id: o.id, label: o.text }));
}