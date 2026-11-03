import { apiMyPain, apiMyMovement, apiMyPersonalCare, apiMySocialHealth, apiMyManagement } from './django-API';

// returns the assessment's saved MyPain, or null if the section hasn't been done yet
export async function apiLoadMyPain(assessmentId) {
    const [existing] = await apiMyPain('select', { assessment: assessmentId });
    return existing ?? null;
}

/* Create/update a finished My Pain section to its assessment
- completed_at is set to now */
export async function apiSaveMyPain(assessmentId, details) {
    const values = { ...details, completed_at: new Date().toISOString() };
    const [existing] = await apiMyPain('select', { assessment: assessmentId });
    if (existing) {
        return apiMyPain('update', { id: existing.id, ...values });
    }
    return apiMyPain('create', { assessment: assessmentId, ...values });
}

// returns the assessment's saved MyMovement, or null if the section hasn't been done yet
export async function apiLoadMyMovement(assessmentId) {
    const [existing] = await apiMyMovement('select', { assessment: assessmentId });
    return existing ?? null;
}

/* Create/update a finished My Movement section to its assessment
- completed_at is set to now */
export async function apiSaveMyMovement(assessmentId, details) {
    const values = { ...details, completed_at: new Date().toISOString() };
    const [existing] = await apiMyMovement('select', { assessment: assessmentId });
    if (existing) {
        return apiMyMovement('update', { id: existing.id, ...values });
    }
    return apiMyMovement('create', { assessment: assessmentId, ...values });
}

// returns the assessment's saved MyPersonalCare, or null if the section hasn't been done yet
export async function apiLoadMyPersonalCare(assessmentId) {
    const [existing] = await apiMyPersonalCare('select', { assessment: assessmentId });
    return existing ?? null;
}

/* Create/update a finished My Personal Care section to its assessment
- completed_at is set to now */
export async function apiSaveMyPersonalCare(assessmentId, details) {
    const values = { ...details, completed_at: new Date().toISOString() };
    const [existing] = await apiMyPersonalCare('select', { assessment: assessmentId });
    if (existing) {
        return apiMyPersonalCare('update', { id: existing.id, ...values });
    }
    return apiMyPersonalCare('create', { assessment: assessmentId, ...values });
}

// returns the assessment's saved MySocialHealth, or null if the section hasn't been done yet
export async function apiLoadMySocialHealth(assessmentId) {
    const [existing] = await apiMySocialHealth('select', { assessment: assessmentId });
    return existing ?? null;
}

/* Create/update a finished My Social Health section to its assessment
- completed_at is set to now */
export async function apiSaveMySocialHealth(assessmentId, details) {
    const values = { ...details, completed_at: new Date().toISOString() };
    const [existing] = await apiMySocialHealth('select', { assessment: assessmentId });
    if (existing) {
        return apiMySocialHealth('update', { id: existing.id, ...values });
    }
    return apiMySocialHealth('create', { assessment: assessmentId, ...values });
}

// returns the assessment's saved MyManagement, or null if the section hasn't been done yet
export async function apiLoadMyManagement(assessmentId) {
    const [existing] = await apiMyManagement('select', { assessment: assessmentId });
    return existing ?? null;
}

/* Create/update a finished My Management section to its assessment
- completed_at is set to now */
export async function apiSaveMyManagement(assessmentId, details) {
    const values = { ...details, completed_at: new Date().toISOString() };
    const [existing] = await apiMyManagement('select', { assessment: assessmentId });
    if (existing) {
        return apiMyManagement('update', { id: existing.id, ...values });
    }
    return apiMyManagement('create', { assessment: assessmentId, ...values });
}
